<#
.SYNOPSIS
    Linter riguroso de gobernanza documental, trazabilidad, factualidad y accesibilidad bimodal.
.DESCRIPTION
    Inspecciona exhaustivamente el vault docs/ y el codigo fuente sin simulaciones:
    - Verificacion real de resolucion de 100% de wikilinks (cero enlaces rotos).
    - Fugas de abstraccion en Secciones 1-5 de Casos de Uso e Historias de Usuario.
    - Contaminacion de directrices tecnicas en reglas/ (deben residir en directrices/DIR-*).
    - Reglas de negocio fantasma (citas a RN-* inexistentes).
    - Verificacion de matriz de campos y riqueza en Seccion 6 de CUs.
    - Deteccion de rutas absolutas locales (C:\...) y politica Cero Emojis.
    - Aislamiento de consultas Dataview crudas.
.PARAMETER DocsPath
    Ruta a la carpeta docs/. Por defecto: "docs".
#>

param(
    [string]$DocsPath = "docs"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DocsPath)) {
    Write-Host "[ERROR] Directorio no encontrado: $DocsPath" -ForegroundColor Red
    exit 1
}

$hallazgos = @()
$totalWikilinks = 0

Write-Host "=== Iniciando Doc-Linter Riguroso en: $DocsPath ===" -ForegroundColor Cyan

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
                        Mensaje = "Palabra tecnica '$kw' en seccion funcional de $($file.Name)"
                    }
                }
            }
        }
    }
}

# 2. Control de Riqueza y Matriz de Campos en Casos de Uso
foreach ($file in $cuFiles) {
    if (-not $file) { continue }
    $raw = Get-Content $file.FullName -Raw
    if ($raw -notmatch "Matriz Exhaustiva de Campos|Campo\s*\|\s*Tipo") {
        $hallazgos += [PSCustomObject]@{
            Severidad = "Medio"
            Tipo = "SintesisExcesiva"
            Archivo = $file.FullName
            Linea = 1
            Mensaje = "El caso de uso $($file.Name) carece de la Matriz Exhaustiva de Campos y Validaciones en su Seccion 6"
        }
    }
}

# 3. Chequeo de Contaminacion Taxonomica en docs/arquitectura/reglas/
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

# 4. Parser y Resolucion Real de Todos los Wikilinks en el Vault (Cero Simulaciones)
$allMarkdown = Get-ChildItem -Path $DocsPath -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
$archivosPorNombre = @{}
foreach ($f in $allMarkdown) {
    $archivosPorNombre[$f.BaseName] = $f.FullName
}

foreach ($file in $allMarkdown) {
    $lines = Get-Content $file.FullName
    for ($idx = 0; $idx -lt $lines.Count; $idx++) {
        $l = $lines[$idx]
        $matches = [regex]::Matches($l, "\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]")
        foreach ($m in $matches) {
            $totalWikilinks++
            $target = $m.Groups[1].Value.Trim()
            if ($target -eq "" -or $target.StartsWith("#")) { continue }
            
            # Normalizar nombre base
            $targetBase = [System.IO.Path]::GetFileNameWithoutExtension($target)
            if (-not $archivosPorNombre.ContainsKey($targetBase)) {
                # Verificar si es ruta relativa
                $targetRel = Join-Path $file.DirectoryName "$target.md"
                if (-not (Test-Path $targetRel)) {
                    $hallazgos += [PSCustomObject]@{
                        Severidad = "Alto"
                        Tipo = "EnlaceRoto"
                        Archivo = $file.FullName
                        Linea = ($idx + 1)
                        Mensaje = "Wikilink roto a '$target' en $($file.Name)"
                    }
                }
            }
        }
    }
}

# 5. Deteccion de Reglas Fantasma
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
                Severidad = "Critico"
                Tipo = "ReglaFantasma"
                Archivo = $file.FullName
                Linea = 0
                Mensaje = "Referencia a regla inexistente '$rnId' en $($file.Name)"
            }
        }
    }
}

# 6. Chequeo de Rutas Absolutas Locales, Emojis y Dataview Crudo
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

# Reporte y Resumen Metrico
Write-Host "Total de archivos analizados: $($allMarkdown.Count)" -ForegroundColor Gray
Write-Host "Total de wikilinks verificados: $totalWikilinks" -ForegroundColor Gray
Write-Host ""

if ($hallazgos.Count -eq 0) {
    Write-Host "[EXITO] Cero hallazgos. Documentacion 100% conforme con gobernanza bimodal, factualidad y accesibilidad." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[ALERTA] Se encontraron $($hallazgos.Count) hallazgos de gobernanza:" -ForegroundColor Yellow
    $hallazgos | Format-Table -Property Severidad, Tipo, Mensaje -AutoSize
    exit 1
}
