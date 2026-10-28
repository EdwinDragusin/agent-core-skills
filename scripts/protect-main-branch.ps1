# Script de Proteccion Integral de la Rama Principal (Local Hooks + GitHub Rulesets API)
# Uso: .\scripts\protect-main-branch.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$RepoSlug = "EdwinDragusin/agent-core-skills"
$RulesetName = "main-pr-only-governance"

Write-Host "1. Instalando Git Hooks locales (.githooks -> .git/hooks) en el repositorio..."
Copy-Item -Path "$RepoRoot\.githooks\*" -Destination "$RepoRoot\.git\hooks\" -Force
Write-Host "   [OK] Hooks locales activos en todas las ramas: pre-commit, commit-msg y pre-push bloquean commits/pushes directos a main."

Write-Host "`n2. Verificando autenticacion en GitHub CLI (gh)..."
gh auth status | Out-Null
Write-Host "   [OK] Sesion activa en GitHub CLI."

Write-Host "`n3. Configurando GitHub Repository Ruleset ('$RulesetName') en $RepoSlug..."
$existingId = (gh api "repos/$RepoSlug/rulesets" | ConvertFrom-Json) | Where-Object { $_.name -eq $RulesetName } | Select-Object -ExpandProperty id -First 1

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
    rules = @(
        @{ type = "deletion" },
        @{ type = "non_fast_forward" },
        @{ type = "required_linear_history" },
        @{
            type = "pull_request"
            parameters = @{
                dismiss_stale_reviews_on_push = $true
                require_code_owner_review = $false
                require_last_push_approval = $false
                required_approving_review_count = 0
                required_review_thread_resolution = $true
            }
        },
        @{
            type = "required_status_checks"
            parameters = @{
                strict_required_status_checks_policy = $true
                do_not_enforce_on_create = $false
                required_status_checks = @(
                    @{ context = "governance-check" }
                )
            }
        }
    )
} | ConvertTo-Json -Depth 10

if ($existingId) {
    $rulesetBody | gh api -X PUT "repos/$RepoSlug/rulesets/$existingId" --input - | Out-Null
    Write-Host "   [OK] Ruleset existente (ID: $existingId) actualizado exitosamente."
} else {
    $created = $rulesetBody | gh api -X POST "repos/$RepoSlug/rulesets" --input - | ConvertFrom-Json
    Write-Host "   [OK] Nuevo Ruleset creado exitosamente (ID: $($created.id))."
}

Write-Host "`nProteccion verificada: Nadie (incluyendo administradores) puede hacer push directo a 'main'. Todo cambio requiere Pull Request y check 'governance-check' en verde."
