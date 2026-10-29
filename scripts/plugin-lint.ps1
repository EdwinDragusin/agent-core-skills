<#
.SYNOPSIS
    Linter de integridad del plugin: conteos, ASCII, tamanos de contexto e indices de references.
#>
param([string]$Root = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = "Stop"
$err = @()
$agents = (Get-ChildItem "$Root\agents" -File -Filter *.md).Count
$skills = (Get-ChildItem "$Root\skills" -Directory).Count

# 1. Conteos declarados vs reales
$files = @("plugin.json","gemini-extension.json","README.md") + (Get-ChildItem $Root -Recurse -File -Include plugin.json,marketplace.json | Where-Object { $_.FullName -match '\\\.(claude|codex|cursor)-plugin\\' } | ForEach-Object { $_.FullName.Substring($Root.Length + 1) })
foreach ($f in ($files | Select-Object -Unique)) {
    $t = Get-Content "$Root\$f" -Raw -Encoding UTF8
    foreach ($m in [regex]::Matches($t, '(\d+)\s+(?:\*\*)?(?:subagentes|skills)', 'IgnoreCase')) {
        $n = [int]$m.Groups[1].Value
        $exp = if ($m.Value -match 'subagentes') { $agents } else { $skills }
        if ($n -lt 20 -and $m.Value -notmatch 'subagentes') { continue }  # subtotales por categoria`n        if ($n -ne $exp) { $err += "$f : '$($m.Value)' esperado $exp" }
    }
}

# 2. ASCII puro
Get-ChildItem $Root -Recurse -File | Where-Object { $_.FullName -notmatch '\\\.git\\' } | ForEach-Object {
    $x = [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($_.FullName))
    if ($x -match '[^\x00-\x7F]') { $err += "no-ASCII: $($_.FullName.Substring($Root.Length + 1))" }
}

# 3. Topes de contexto
Get-ChildItem "$Root\skills" -Recurse -Filter SKILL.md | Where-Object { $_.Length -gt 7168 } | ForEach-Object { $err += "SKILL.md > 7 KB: $($_.FullName.Substring($Root.Length + 1))" }
Get-ChildItem "$Root\agents" -File | Where-Object { $_.Length -gt 14336 } | ForEach-Object { $err += "agente > 14 KB: $($_.Name)" }
if ((Get-Item "$Root\rules\AGENTS.md").Length -gt 5120) { $err += "rules/AGENTS.md > 5 KB" }

# 4. INDEX en references/ con archivos > 8 KB
Get-ChildItem "$Root\skills" -Directory | ForEach-Object {
    $r = "$($_.FullName)\references"
    if ((Test-Path $r) -and (Get-ChildItem $r -File -Filter *.md | Where-Object { $_.Name -ne 'INDEX.md' -and $_.Length -gt 8000 }) -and -not (Test-Path "$r\INDEX.md")) { $err += "falta INDEX.md: skills/$($_.Name)/references" }
}

# 5. mcp_config valido y portable
$m = Get-Content "$Root\mcp_config.json" -Raw | ConvertFrom-Json
if ((Get-Content "$Root\mcp_config.json" -Raw) -match '[A-Za-z]:\\\\|@latest') { $err += "mcp_config.json: ruta absoluta o @latest" }

if ($err.Count) { $err | ForEach-Object { Write-Host "[ERROR] $_" -ForegroundColor Red }; exit 1 }
Write-Host "[EXITO] plugin-lint: $agents agentes, $skills skills, 0 hallazgos" -ForegroundColor Green