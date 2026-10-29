<#
.SYNOPSIS
    Linter ligero de gobernanza documental, trazabilidad y accesibilidad cognitiva.
.DESCRIPTION
    Inspecciona el vault docs/ para detectar:
    - Fugas de abstraccion en Casos de Uso e Historias de Usuario.
    - Contaminacion taxonomica de reglas (directrices de software en reglas/ en vez de directrices/).
    - Reglas fantasma (enlaces a RN-* sin archivo fisico).
    - Presencia de rutas absolutas locales (C:\...).
    - Violaciones de la politica Cero Emojis.
    - Consultas Dataview crudas expuestas.
.PARAMETER DocsPath
    Ruta a la carpeta docs/. Por defecto: "docs".
#>

param(
    [string]$DocsPath = "docs"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DocsPath)) {
    Write-Host "[ERROR] Ruta no encontrada: $DocsPath" -ForegroundColor Red
    exit 1
}

$hallazgos = @()

Write-Host "=== Iniciando Doc-Linter en: $DocsPath ===" -ForegroundColor Cyan

# 1. Chequeo de Fugas de Abstraccion en Casos de Uso e Historias de Usuario
$cuFiles = Get-ChildItem -Path "$DocsPath\guia\referencia\casos-de-uso" -Filter "*.md" -ErrorAction SilentlyContinue
$huFiles = Get-ChildItem -Path "$DocsPath\guia\referencia" -Filter "*historias*.md" -ErrorAction SilentlyContinue
$archivosFuncionales = @($cuFiles) + @($huFiles)

$palabrasProhibidasFuncional = @("JSONB", "HTTP 40", "HTTP 50", "UPDATE ", "INSERT ", "SELECT ", "WHERE ", "DTO", "UnitOfWork", "Argon2id")

foreach ($file in $archivosFuncionales) {
    if (-not $file) { continue }
    $lines = Get-Content $file.FullName
    $inTechnicalSection = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match "## 6\. Contrato Tecnico|## Especificacion Tecnica") {
            $inTechnicalSection = $true
        }
        if (-not $inTechnicalSection) {
            foreach ($kw in $palabrasProhibidasFuncional) {
                if ($line -match [regex]::Escape($kw)) {
                    $hallazgos += [PSCustomObject]@{
                        Severidad = "Alto"
                        Tipo = "FugaAbstraccion"
                        Archivo = $file.FullName
                        Linea = ($i + 1)
                        Mensaje = "Palabra clave tecnica '$kw' en seccion funcional de $($file.Name)"
                    }
                }
            }
        }
    }
}

# 2. Chequeo de Contaminacion Taxonomica en docs/arquitectura/reglas/
$reglasFiles = Get-ChildItem -Path "$DocsPath\arquitectura\reglas" -Filter "*.md" -ErrorAction SilentlyContinue
foreach ($file in $reglasFiles) {
    if ($file.Name -match "^RN-F") {
        $hallazgos += [PSCustomObject]@{
            Severidad = "Critico"
            Tipo = "ContaminacionTaxonomica"
            Archivo = $file.FullName
            Linea = 1
            Mensaje = "Regla de frontend $($file.Name) en catalogo de negocio. Debe trasladarse a arquitectura/directrices/DIR-FRONT-*.md"
        }
    }
    $content = Get-Content $file.FullName -Raw
    if ($content -match "varchar|nullable|import.*features|@hookform|zod") {
        $hallazgos += [PSCustomObject]@{
            Severidad = "Alto"
            Tipo = "JergaTecnicaEnRegla"
            Archivo = $file.FullName
            Linea = 1
            Mensaje = "Menciones a tipos SQL o librerias npm en regla de negocio $($file.Name)"
        }
    }
}

# 3. Deteccion de Reglas Fantasma
$allMarkdown = Get-ChildItem -Path $DocsPath -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$reglasExistentes = @($reglasFiles | ForEach-Object { $_.BaseName })

foreach ($file in $allMarkdown) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, "\[\[(RN-[A-Z0-9]+)")
    foreach ($m in $matches) {
        $rnId = $m.Groups[1].Value
        $encontrado = $false
        foreach ($r in $reglasExistentes) {
            if ($r -match "^$rnId") { $encontrado = $true; break }
        }
        if (-not $encontrado) {
            $hallazgos += [PSCustomObject]@{
                Severidad = "Alto"
                Tipo = "ReglaFantasma"
                Archivo = $file.FullName
                Linea = 0
                Mensaje = "Referencia a regla inexistente '$rnId' en $($file.Name)"
            }
        }
    }
}

# 4. Chequeo de Rutas Absolutas Locales y Emojis
foreach ($file in $allMarkdown) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $l = $lines[$i]
        if ($l -match "[A-Za-z]:\\[A-Za-z0-9_.-]+\\") {
            $hallazgos += [PSCustomObject]@{
                Severidad = "Medio"
                Tipo = "RutaAbsolutaLocal"
                Archivo = $file.FullName
                Linea = ($i + 1)
                Mensaje = "Ruta absoluta local hardcodeada en $($file.Name)"
            }
        }
        if ($l -match "[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27EF]") {
            $hallazgos += [PSCustomObject]@{
                Severidad = "Alto"
                Tipo = "EmojiDetectado"
                Archivo = $file.FullName
                Linea = ($i + 1)
                Mensaje = "Emoji prohibido detectado en $($file.Name)"
            }
        }
        if ($l -match "^\$\= dv\.pages\(\)" -and $file.Name -ne "TODO.md") {
            $hallazgos += [PSCustomObject]@{
                Severidad = "Bajo"
                Tipo = "DataviewCrudo"
                Archivo = $file.FullName
                Linea = ($i + 1)
                Mensaje = "Consulta Dataview cruda expuesta en $($file.Name)"
            }
        }
    }
}

# Reporte Final
Write-Host ""
if ($hallazgos.Count -eq 0) {
    Write-Host "[EXITO] Cero hallazgos. Documentacion conforme con estandares de gobernanza y accesibilidad bimodal." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[ALERTA] Se encontraron $($hallazgos.Count) hallazgos:" -ForegroundColor Yellow
    $hallazgos | Format-Table -Property Severidad, Tipo, Mensaje -AutoSize
    exit 1
}
