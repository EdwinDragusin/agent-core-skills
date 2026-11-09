<#
.SYNOPSIS
    Script de proteccion de la rama principal (Local Git Hooks + GitHub Rulesets API).

.DESCRIPTION
    Configura la proteccion integral de la rama principal para cualquier repositorio:
    1. Instala los hooks locales de Git en .githooks mediante 'git config core.hooksPath .githooks'.
    2. Crea o actualiza via GitHub CLI (gh) un Ruleset en la rama por defecto (~DEFAULT_BRANCH)
       que bloquea borrado, non-fast-forward, exige Pull Request y los status checks indicados.
       No impone historial lineal para permitir fusiones con merge commit.

.PARAMETER Path
    Ruta al repositorio de trabajo. Por defecto es el directorio actual (cwd).

.PARAMETER Repo
    Identificador del repositorio en GitHub (<propietario>/<nombre>).
    Por defecto se deduce del remoto 'origin' del repositorio resuelto.

.PARAMETER Checks
    Nombres de status checks requeridos (nombres de job de CI) separados por punto y coma: -Checks "Backend (estatico, unitarias);Frontend". Se usa ";" porque los nombres de job pueden contener comas.
    Por defecto es "governance-check".

.PARAMETER DryRun
    Si se activa, imprime la raiz del repositorio, el slug detectado y el payload del ruleset sin ejecutar
    cambios en la configuracion de git ni llamadas de mutacion en la API de GitHub.

.EXAMPLE
    .\scripts\protect-main-branch.ps1
    Aplica proteccion al repositorio del directorio actual con el check "governance-check".

.EXAMPLE
    .\scripts\protect-main-branch.ps1 -Path "C:\repo" -Checks "ci;lint" -DryRun
    Modo seguro para inspeccionar parametros sin aplicar cambios.
#>
param(
    [string]$Path = "",
    [string]$Repo = "",
    [string]$Checks = "governance-check",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# 1. Determinar raiz del repositorio de trabajo
$targetDir = if ($Path) { (Resolve-Path $Path).Path } else { (Get-Location).Path }
$RepoRoot = try {
    (git -C $targetDir rev-parse --show-toplevel 2>$null).Trim()
} catch { $null }

if (-not $RepoRoot -or -not (Test-Path $RepoRoot)) {
    throw "No se encontro un repositorio Git valido en '$targetDir'."
}
$RepoRoot = $RepoRoot -replace '/', '\'

# 2. Deducir slug del repositorio remoto si no fue especificado
if (-not $Repo) {
    try {
        $originUrl = (git -C $RepoRoot remote get-url origin 2>$null).Trim()
        if ($originUrl -match 'github\.com[:/](?<slug>[^/]+/[^/\.]+?)(\.git)?$') {
            $Repo = $Matches['slug']
        }
    } catch {}
}

if (-not $Repo) {
    throw "No se pudo deducir el repositorio remoto desde origin. Proporciona -Repo <owner/name>."
}

$RulesetName = "main-pr-only-governance"

# 3. Formatear lista de required_status_checks
$checkList = @()
if ($Checks) {
    $rawChecks = $Checks -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    foreach ($c in $rawChecks) {
        $checkList += @{ context = $c }
    }
}

# 4. Construir cuerpo del ruleset (sin required_linear_history para permitir merge commits)
$rulesArray = @(
    @{ type = "deletion" },
    @{ type = "non_fast_forward" },
    @{
        type = "pull_request"
        parameters = @{
            dismiss_stale_reviews_on_push = $true
            require_code_owner_review = $false
            require_last_push_approval = $false
            required_approving_review_count = 0
            required_review_thread_resolution = $true
        }
    }
)

if ($checkList.Count -gt 0) {
    $rulesArray += @{
        type = "required_status_checks"
        parameters = @{
            strict_required_status_checks_policy = $true
            do_not_enforce_on_create = $false
            required_status_checks = $checkList
        }
    }
}

$rulesetBody = @{
    name = $RulesetName
    target = "branch"
    enforcement = "active"
    bypass_actors = @()
    conditions = @{
        ref_name = @{
            include = @("~DEFAULT_BRANCH")
            exclude = @()
        }
    }
    rules = $rulesArray
} | ConvertTo-Json -Depth 10

# 5. Modo DryRun
if ($DryRun) {
    Write-Host "[DRY-RUN] Raiz del repositorio: $RepoRoot"
    Write-Host "[DRY-RUN] Repositorio GitHub:   $Repo"
    Write-Host "[DRY-RUN] Status checks:        $Checks"
    Write-Host "[DRY-RUN] Ruleset Payload:"
    Write-Host $rulesetBody
    exit 0
}

# 6. Configurar Git Hooks locales mediante core.hooksPath
Write-Host "1. Configurando Git Hooks locales via core.hooksPath en .githooks en $RepoRoot..."
git -C $RepoRoot config core.hooksPath .githooks
Write-Host "   [OK] Hooks locales activos con core.hooksPath=.githooks"

# 7. Verificar GitHub CLI
Write-Host "`n2. Verificando autenticacion en GitHub CLI (gh)..."
gh auth status | Out-Null
Write-Host "   [OK] Sesion activa en GitHub CLI."

# 8. Configurar Ruleset en GitHub
Write-Host "`n3. Configurando GitHub Repository Ruleset ('$RulesetName') en $Repo..."
$existingId = $null
try {
    $rulesets = gh api "repos/$Repo/rulesets" | ConvertFrom-Json
    $existing = $rulesets | Where-Object { $_.name -eq $RulesetName } | Select-Object -First 1
    if ($existing) { $existingId = $existing.id }
} catch {
    Write-Warning "No se pudo consultar rulesets existentes o no existen permisos."
}

if ($existingId) {
    $rulesetBody | gh api -X PUT "repos/$Repo/rulesets/$existingId" --input - | Out-Null
    Write-Host "   [OK] Ruleset existente (ID: $existingId) actualizado exitosamente."
} else {
    $created = $rulesetBody | gh api -X POST "repos/$Repo/rulesets" --input - | ConvertFrom-Json
    Write-Host "   [OK] Nuevo Ruleset creado exitosamente (ID: $($created.id))."
}

Write-Host "`nProteccion verificada: Todo cambio a la rama principal en $Repo requiere Pull Request y status checks en verde."
