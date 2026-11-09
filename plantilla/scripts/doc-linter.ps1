# scripts/doc-linter.ps1
# Linter de Gobernanza Documental y Estandar Bimodal (Lego)
# Auditoria de estructura del vault, arc42, ADRs, casos de uso y manifiestos AGENTS.md
# Cero dependencias externas. Ejecutable en PowerShell 5.1+ y Core.

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$DocsPath = "",

  [switch]$Detailed
)

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

if (-not $DocsPath) {
  if ($PSScriptRoot) {
    $DocsPath = Join-Path $PSScriptRoot "../docs"
  } else {
    $DocsPath = "docs"
  }
}
$DocsPath = [System.IO.Path]::GetFullPath($DocsPath)

Write-Host "================================================================="
Write-Host "DOC-LINTER: Auditoria de Gobernanza Documental Bimodal (Lego)"
Write-Host "Ruta auditada: $DocsPath"
Write-Host "================================================================="

if (-not (Test-Path $DocsPath)) {
  Write-Host "[ERROR BLOQUEANTE] No existe la ruta de documentacion: $DocsPath"
  exit 1
}

$TotalChecks = 0
$TotalPassed = 0
$TotalFailed = 0
$TotalWarnings = 0

$Failures = [System.Collections.Generic.List[string]]::new()
$Warnings = [System.Collections.Generic.List[string]]::new()

function Register-Check([string]$Category, [string]$Item, [bool]$Passed, [string]$Details = "") {
  $script:TotalChecks++
  if ($Passed) {
    $script:TotalPassed++
    if ($Detailed) {
      Write-Host "[PASS] [$Category] $Item" -ForegroundColor Green
    }
  } else {
    $script:TotalFailed++
    $msg = "[$Category] $Item"
    if ($Details) { $msg += " -> $Details" }
    Write-Host "[FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
  }
}

function Register-Warn([string]$Category, [string]$Item, [string]$Details = "") {
  $script:TotalWarnings++
  $msg = "[$Category] $Item"
  if ($Details) { $msg += " -> $Details" }
  Write-Host "[WARN] $msg" -ForegroundColor Yellow
  $script:Warnings.Add($msg)
}

# -----------------------------------------------------------------
# 0. ESTRUCTURA DEL VAULT (Carpetas, Capitulos arc42 y Archivos Base)
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 0. Verificacion de Estructura Base del Vault ---"

$requiredDirs = @("adr", "arquitectura", "auditorias", "guia", "_plantillas")
foreach ($dir in $requiredDirs) {
  $dirFull = Join-Path $DocsPath $dir
  $dirExists = Test-Path $dirFull -PathType Container
  Register-Check "Estructura" "Carpeta obligatoria docs/$dir existe" $dirExists $(if (-not $dirExists) { "No existe el directorio $dirFull" } else { "" })
}

$arqDir = Join-Path $DocsPath "arquitectura"
for ($capNum = 1; $capNum -le 11; $capNum++) {
  $capPrefix = "capitulo-{0:D2}-*.md" -f $capNum
  $capMatches = @()
  if (Test-Path $arqDir -PathType Container) {
    $capMatches = @(Get-ChildItem -Path $arqDir -Filter $capPrefix -File)
  }
  $capOk = ($capMatches.Count -eq 1)
  $capDetails = if ($capMatches.Count -eq 1) {
    $capMatches[0].Name
  } elseif ($capMatches.Count -eq 0) {
    "No se encontro ningun archivo docs/arquitectura/$capPrefix"
  } else {
    "Se encontraron multiples archivos ($($capMatches.Count)): $($capMatches.Name -join ', ')"
  }
  Register-Check "Estructura" ("Capitulo arc42 {0:D2} (docs/arquitectura/$capPrefix)" -f $capNum) $capOk $capDetails
}

$requiredBaseFiles = @(
  "ONBOARDING.md",
  "glosario.md",
  "TODO.md",
  "README.md",
  "auditorias/README.md"
)
foreach ($relFile in $requiredBaseFiles) {
  $fileFull = Join-Path $DocsPath $relFile
  $fileExists = Test-Path $fileFull -PathType Leaf
  Register-Check "Estructura" "Archivo obligatorio docs/$relFile existe" $fileExists $(if (-not $fileExists) { "Falta archivo obligatorio $fileFull" } else { "" })
}

$auditReadmePath = Join-Path $DocsPath "auditorias/README.md"
if (Test-Path $auditReadmePath -PathType Leaf) {
  $auditReadmeContent = [System.IO.File]::ReadAllText($auditReadmePath, [System.Text.Encoding]::UTF8)
  $hasFrontmatter = ($auditReadmeContent -match '(?s)\A---\r?\n.*?\r?\n---')
  $hasAuditFormat = ($auditReadmeContent -match 'AUDIT-\d{3}|AUDIT-NNN')
  Register-Check "Estructura" "docs/auditorias/README.md cuenta con frontmatter y formato AUDIT-NNN" ($hasFrontmatter -and $hasAuditFormat) "Frontmatter:$hasFrontmatter FormatoAUDIT:$hasAuditFormat"
}

# -----------------------------------------------------------------
# 1. CASOS DE USO (docs/guia/referencia/casos-de-uso/CU-*.md)
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 1. Verificacion de Casos de Uso (Bimodal Estricto) ---"
$cuDir = Join-Path $DocsPath "guia/referencia/casos-de-uso"
if (Test-Path $cuDir) {
  $cuFiles = Get-ChildItem -Path $cuDir -Filter "CU-*.md" | Sort-Object Name
  $technicalPattern = '\b(DTO|JSONB|SQL|SELECT|UPDATE|INSERT|UPSERT|200 OK|201 Created|400 Bad Request|401 Unauthorized|403 Forbidden|404 Not Found|409 Conflict|500 Internal Server Error)\b'
  $httpPattern = '\bHTTP\s+[1-5]\d\d\b'

  foreach ($file in $cuFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $fileName = $file.Name

    # Check existencia Seccion 6
    $hasSec6 = $content -match '## 6\.\s+Contrato T.{1,2}cnico de Ingenier.{1,2}a'
    Register-Check "CasosDeUso" "$fileName - Existencia de Seccion 6 (Contrato Tecnico)" $hasSec6

    # Check existencia subsecciones requeridas de seccion 6
    if ($hasSec6) {
      $has61 = $content -match '###?\s+6\.1'
      $has62 = $content -match '###?\s+6\.2'
      $has63 = $content -match '###?\s+6\.3'
      $has64 = $content -match '###?\s+6\.4'
      $hasAllSubs = $has61 -and $has62 -and $has63 -and $has64
      Register-Check "CasosDeUso" "$fileName - Subsecciones tecnicas 6.1 a 6.4" $hasAllSubs "6.1:$has61 6.2:$has62 6.3:$has63 6.4:$has64"
    }

    # Check secciones 1 a 5 libres de tecnicismos
    $sec6Index = $content.IndexOf("## 6. Contrato")

    if ($sec6Index -gt 0) {
      $functionalPart = $content.Substring(0, $sec6Index)
      # Omitir frontmatter
      if ($functionalPart.StartsWith("---")) {
        $secondFence = $functionalPart.IndexOf("---", 3)
        if ($secondFence -gt 0) {
          $functionalPart = $functionalPart.Substring($secondFence + 3)
        }
      }

      $lines = $functionalPart -split "`r?`n"
      $leaks = [System.Collections.Generic.List[string]]::new()
      for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        # Evaluar el texto visible renderizado (removiendo destinos internos de wikilinks)
        $visibleLine = [regex]::Replace($line, '\[\[[^\|\]]+\|([^\]]+)\]\]', '$1')
        $visibleLine = [regex]::Replace($visibleLine, '\[\[([^\]]+)\]\]', '$1')

        if ($visibleLine -match $technicalPattern) {
          $leaks.Add("L$($i+1): $($Matches[0]) en: $($line.Trim())")
        } elseif ($visibleLine -match $httpPattern) {
          $leaks.Add("L$($i+1): $($Matches[0]) en: $($line.Trim())")
        }
      }

      $noLeaks = ($leaks.Count -eq 0)
      $details = if (-not $noLeaks) { $leaks -join "; " } else { "" }
      Register-Check "CasosDeUso" "$fileName - Secciones 1 a 5 puramente funcionales (sin fugas tecnicas)" $noLeaks $details
    }
  }
}

# -----------------------------------------------------------------
# 4. ARC42 Y CATALOGO DE ADRS
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 4. Verificacion de arc42 y Catalogo de ADRs ---"

# [ESTANDAR] Recoleccion dinamica de archivos ADR (backend y frontend)
$adrDirBack = Join-Path $DocsPath "adr"
$adrDirFront = Join-Path $DocsPath "adr/frontend"

$adrFiles = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
if (Test-Path $adrDirBack) {
  Get-ChildItem -Path $adrDirBack -Filter "ADR-*.md" | ForEach-Object { $adrFiles.Add($_) }
}
if (Test-Path $adrDirFront) {
  Get-ChildItem -Path $adrDirFront -Filter "ADR-*.md" | ForEach-Object { $adrFiles.Add($_) }
}

# [ESTANDAR] Indice de ADRs en Capitulo 9
$cap9Path = Join-Path $DocsPath "arquitectura/capitulo-09-decisiones.md"
if (Test-Path $cap9Path) {
  $cap9 = [System.IO.File]::ReadAllText($cap9Path, [System.Text.Encoding]::UTF8)
  $missingInCap9 = [System.Collections.Generic.List[string]]::new()
  $duplicatesInCap9 = [System.Collections.Generic.List[string]]::new()

  foreach ($adr in $adrFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($adr.Name)
    $adrId = if ($adr.Name -match '^(ADR-(?:\d{3}|F\d{3}))') { $matches[1] } else { $baseName }
    $escapedBase = [regex]::Escape($baseName)
    $linkPattern = "(\[\[[^\]]*$escapedBase(?:\\?\|[^\]]*)?\]\]|\([^\)]*$escapedBase\.md\))"
    $occurrences = [regex]::Matches($cap9, $linkPattern)
    if ($occurrences.Count -eq 0) {
      $missingInCap9.Add($adrId)
    } elseif ($occurrences.Count -gt 1) {
      $duplicatesInCap9.Add("$adrId($($occurrences.Count))")
    }
  }

  $cap9Valid = ($missingInCap9.Count -eq 0 -and $duplicatesInCap9.Count -eq 0)
  $cap9Details = "Total indexados: $($adrFiles.Count)"
  if ($missingInCap9.Count -gt 0) { $cap9Details += " | Faltantes en Cap 9: $($missingInCap9 -join ', ')" }
  if ($duplicatesInCap9.Count -gt 0) { $cap9Details += " | Duplicados en Cap 9: $($duplicatesInCap9 -join ', ')" }

  Register-Check "arc42" "Capitulo 9 indexa todos los ADRs exactamente una vez" $cap9Valid $cap9Details
} else {
  Register-Check "arc42" "Capitulo 9 existe" $false
}

# [ESTANDAR] Nomenclatura, unicidad y resumen ejecutivo de ADRs

# Verificacion de todos los ADRs con Resumen Ejecutivo
$invalidAdrNames = [System.Collections.Generic.List[string]]::new()
$adrIdCounts = @{}

foreach ($adr in $adrFiles) {
  if ($adr.Name -notmatch '^ADR-(\d{3}|F\d{3})-[a-z0-9-]+\.md$') {
    $invalidAdrNames.Add($adr.Name)
  }
  if ($adr.Name -match '^(ADR-(?:\d{3}|F\d{3}))-') {
    $id = $matches[1]
    if ($adrIdCounts.ContainsKey($id)) {
      $adrIdCounts[$id]++
    } else {
      $adrIdCounts[$id] = 1
    }
  }
}

$duplicateAdrIds = [System.Collections.Generic.List[string]]::new()
foreach ($key in $adrIdCounts.Keys) {
  if ($adrIdCounts[$key] -gt 1) {
    $duplicateAdrIds.Add("$key($($adrIdCounts[$key]))")
  }
}

$allNamesValid = ($invalidAdrNames.Count -eq 0)
$nameDetails = "Total encontrados: $($adrFiles.Count)"
if (-not $allNamesValid) { $nameDetails += " | Nombres invalidos: $($invalidAdrNames -join ', ')" }
Register-Check "ADRs" "Nomenclatura de archivos ADR cumple patron canonico" $allNamesValid $nameDetails

$noDuplicateIds = ($duplicateAdrIds.Count -eq 0)
$dupDetails = if ($noDuplicateIds) { "Total unicos: $($adrFiles.Count)" } else { "IDs duplicados: $($duplicateAdrIds -join ', ')" }
Register-Check "ADRs" "Ausencia de identificadores ADR duplicados" $noDuplicateIds $dupDetails

$adrsMissingSummary = [System.Collections.Generic.List[string]]::new()
foreach ($adr in $adrFiles) {
  $adrContent = [System.IO.File]::ReadAllText($adr.FullName, [System.Text.Encoding]::UTF8)
  if ($adrContent -notmatch '## Resumen Ejecutivo de Negocio') {
    $adrsMissingSummary.Add($adr.Name)
  }
}

$allAdrsHaveSummary = ($adrsMissingSummary.Count -eq 0)
$missingDetails = if (-not $allAdrsHaveSummary) { $adrsMissingSummary -join ", " } else { "" }
Register-Check "ADRs" "Todos los ADRs cuentan con '## Resumen Ejecutivo de Negocio'" $allAdrsHaveSummary $missingDetails

# -----------------------------------------------------------------
# 5. ONBOARDING, GLOSARIO E HIGIENE
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 5. Verificacion de Onboarding, Glosario e Higiene ---"
$onboardingPath = Join-Path $DocsPath "ONBOARDING.md"
if (Test-Path $onboardingPath) {
  $onb = [System.IO.File]::ReadAllText($onboardingPath, [System.Text.Encoding]::UTF8)
  $hasRutaLectura = ($onb -match '(?m)^#{2,3}\s+.*(Ruta[s]?(\s+de\s+(Lectura|Aprendizaje|Incorporaci[oo]n))?|Ruta\s+\d+|Lectura\s+por\s+Rol|Recorrido)')
  Register-Check "Onboarding" "docs/ONBOARDING.md define al menos una seccion de rutas de lectura" $hasRutaLectura "SeccionRutas:$hasRutaLectura"
} else {
  Register-Check "Onboarding" "docs/ONBOARDING.md existe" $false
}

$glosarioPath = Join-Path $DocsPath "glosario.md"
if (Test-Path $glosarioPath) {
  $glo = [System.IO.File]::ReadAllText($glosarioPath, [System.Text.Encoding]::UTF8)
  $hasSecNegocio = ($glo -match 'T[ee]rminos de Negocio') -or ($glo -match 'Analog[ii]as') -or ($glo -match 'Lenguaje Ubicuo')
  $hasSecDdd = ($glo -match 'Dominio DDD') -or ($glo -match 'Arquitectura T[ee]cnica') -or ($glo -match 'T[ee]rminos T[ee]cnicos')
  $gloDual = $hasSecNegocio -and $hasSecDdd
  Register-Check "Glosario" "docs/glosario.md estructura dual (Negocio + DDD/Arquitectura)" $gloDual "Negocio:$hasSecNegocio DDD:$hasSecDdd"
} else {
  Register-Check "Glosario" "docs/glosario.md existe" $false
}

$todoPath = Join-Path $DocsPath "TODO.md"
if (Test-Path $todoPath) {
  $todoContent = [System.IO.File]::ReadAllText($todoPath, [System.Text.Encoding]::UTF8)
  $hasCollapsible = ($todoContent -match '>\s*\[!\w+\]-') -or ($todoContent -match '<details')
  Register-Check "TODO" "docs/TODO.md implementa bloques colapsables para Dataview" $hasCollapsible
} else {
  Register-Check "TODO" "docs/TODO.md existe" $false
}

# -----------------------------------------------------------------
# 6. HIGIENE GLOBAL: CERO EMOJIS EN TODO DOCS/
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 6. Verificacion de Ausencia Total de Emojis en docs/ ---"

$allMdFiles = Get-ChildItem -Path $DocsPath -Recurse -Filter "*.md" | Where-Object { $_.FullName -notmatch '[\\/]\.obsidian[\\/]' }

$emojiHits = [System.Collections.Generic.List[string]]::new()

foreach ($file in $allMdFiles) {
  $rawLines = [System.IO.File]::ReadAllLines($file.FullName, [System.Text.Encoding]::UTF8)
  for ($ln = 0; $ln -lt $rawLines.Length; $ln++) {
    $line = $rawLines[$ln]
    $chars = $line.ToCharArray()
    for ($ci = 0; $ci -lt $chars.Length; $ci++) {
      $code = [int]$chars[$ci]

      # Detectar pares surrogados para caracteres fuera del BMP (0x10000..0x10FFFF)
      if ([char]::IsHighSurrogate($chars[$ci]) -and ($ci + 1 -lt $chars.Length) -and [char]::IsLowSurrogate($chars[$ci+1])) {
        $utf32 = [char]::ConvertToUtf32($chars[$ci], $chars[$ci+1])
        # Rango de emojis y simbolos extendidos
        if (($utf32 -ge 0x1F300 -and $utf32 -le 0x1FAFF) -or
            ($utf32 -ge 0x1F000 -and $utf32 -le 0x1F02F) -or
            ($utf32 -ge 0x1F0A0 -and $utf32 -le 0x1F0FF)) {
          $emojiHits.Add(("$($file.FullName):$($ln+1) -> U+{0:X} ({1})" -f $utf32, "$($chars[$ci])$($chars[$ci+1])"))
        }
        $ci++ # Salto del par surrogado
        continue
      }

      # Caracteres en el BMP
      if (($code -ge 0x2600 -and $code -le 0x27BF) -or
          ($code -ge 0x231A -and $code -le 0x231B) -or
          ($code -ge 0x23E9 -and $code -le 0x23EC) -or
          ($code -eq 0x23F0) -or ($code -eq 0x23F3) -or
          ($code -eq 0x2B50) -or ($code -eq 0x2B55) -or
          ($code -eq 0xFE0E) -or ($code -eq 0xFE0F)) {
        $emojiHits.Add(("$($file.FullName):$($ln+1) -> U+{0:X} ({1})" -f $code, [string]$chars[$ci]))
      }
    }
  }
}

$zeroEmojis = ($emojiHits.Count -eq 0)
$emojiDetails = if (-not $zeroEmojis) { ($emojiHits | Select-Object -First 10) -join "; " } else { "" }
Register-Check "Higiene" "Cero emojis en todo el vault docs/ ($($allMdFiles.Count) notas escaneadas)" $zeroEmojis $emojiDetails

# -----------------------------------------------------------------
# 7. SINTAXIS Y RENDERIZADO DE DIAGRAMAS MERMAID
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 7. Evaluacion de Sintaxis de Diagramas Mermaid ---"

$validMermaidDirectives = @(
  "sequencediagram",
  "flowchart",
  "graph",
  "classdiagram",
  "statediagram",
  "statediagram-v2",
  "erdiagram",
  "gantt",
  "pie",
  "gitgraph",
  "mindmap",
  "timeline",
  "c4context",
  "c4container",
  "c4component",
  "c4dynamic",
  "c4deployment",
  "requirementdiagram",
  "quadrantchart"
)

$mermaidBlockCount = 0
$mermaidErrors = [System.Collections.Generic.List[string]]::new()

foreach ($file in $allMdFiles) {
  $fileContent = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  if ($fileContent -notmatch '```mermaid') { continue }

  # Extraer bloques mermaid
  $pattern = '(?s)```mermaid\r?\n(.*?)\r?\n```'
  $matches = [regex]::Matches($fileContent, $pattern)

  foreach ($m in $matches) {
    $mermaidBlockCount++
    $body = $m.Groups[1].Value.Trim()

    if ([string]::IsNullOrWhiteSpace($body)) {
      $mermaidErrors.Add("$($file.Name): bloque mermaid vacio")
      continue
    }

    # Obtener primera linea no vacia y no comentario
    $bodyLines = $body -split "`r?`n"
    $firstDirective = ""
    foreach ($bl in $bodyLines) {
      $cleanLine = $bl.Trim()
      if (-not $cleanLine -or $cleanLine.StartsWith("%%")) { continue }
      # -split con regex: String.Split(" `t") se comporta distinto en PowerShell 5.1 y 7
      $firstDirective = ($cleanLine -split '\s+')[0].ToLowerInvariant()
      break
    }

    if (-not $firstDirective) {
      $mermaidErrors.Add("$($file.Name): bloque mermaid sin directivas validas")
      continue
    }

    if ($validMermaidDirectives -notcontains $firstDirective) {
      $mermaidErrors.Add("$($file.Name): directiva mermaid no reconocida '$firstDirective'")
      continue
    }

    # Verificacion de balance de delimitadores basicos (corchetes, llaves, parentesis)
    # Excluyendo texto en comillas simples/dobles
    $openParen = 0; $closeParen = 0
    $openBracket = 0; $closeBracket = 0
    $openBrace = 0; $closeBrace = 0

    foreach ($bl in $bodyLines) {
      $trimmed = $bl.Trim()
      if ($trimmed.StartsWith("%%")) { continue }
      # Remover strings entre comillas para evitar falsos positivos
      $withoutStrings = [regex]::Replace($trimmed, '"[^"]*"', '""')

      $openParen += ($withoutStrings -replace '[^(]').Length
      $closeParen += ($withoutStrings -replace '[^)]').Length
      $openBracket += ($withoutStrings -replace '[^\[]').Length
      $closeBracket += ($withoutStrings -replace '[^\]]').Length
      $openBrace += ($withoutStrings -replace '[^{]').Length
      $closeBrace += ($withoutStrings -replace '[^}]').Length
    }

    # En diagramas de secuencia Mermaid, las etiquetas y notas no exigen parentesis pareados estrictos,
    # pero corchetes y llaves estructuran nodos y bloques.
    if ($openBracket -ne $closeBracket) {
      $mermaidErrors.Add("$($file.Name) [$firstDirective]: desbalance de corchetes [ ] ($openBracket abiertos vs $closeBracket cerrados)")
    }
    if ($openBrace -ne $closeBrace) {
      $mermaidErrors.Add("$($file.Name) [$firstDirective]: desbalance de llaves { } ($openBrace abiertas vs $closeBrace cerradas)")
    }
  }
}

$mermaidValid = ($mermaidErrors.Count -eq 0)
$mermaidDetails = if (-not $mermaidValid) { $mermaidErrors -join "; " } else { "Evaluados $mermaidBlockCount bloques en el vault" }
Register-Check "Mermaid" "Sintaxis y balance de diagramas Mermaid ($mermaidBlockCount bloques encontrados)" $mermaidValid $mermaidDetails

# -----------------------------------------------------------------
# 8. MANIFIESTOS DE AGENTES (AGENTS.md): ETIQUETADO Y GOBERNANZA
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 8. Verificacion de Manifiestos de Agentes (AGENTS.md) ---"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $DocsPath ".."))

function Test-AgentsManifestContent {
  param(
    [string]$manifestPath,
    [string]$content,
    [string]$rootPath
  )

  $lines = $content -split "`r?`n"
  $errors = [System.Collections.Generic.List[string]]::new()
  $rutaCount = 0
  $instruccionCount = 0

  # Conteo de encabezados vs marcas [ESTANDAR] / proyecto
  $headingCount = 0
  $markCount = 0
  $inCode = $false

  for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*```') {
      $inCode = -not $inCode
      continue
    }
    if ($inCode) { continue }

    if ($line -match '^#{2,3}\s+') {
      $headingCount++
    }
    if ($line -match '<!--\s*\[' + '(ESTANDAR|PROYECTO)' + '\]\s*-->') {
      $markCount++
    }
  }

  $headingsOk = ($headingCount -eq $markCount)
  if (-not $headingsOk) {
    $errors.Add( ("Desbalance de encabezados ({0}) y marcas [ESTANDAR] / proyecto ({1})" -f $headingCount, $markCount) )
  }

  # Deteccion de reglas prescriptivas y etiqueta verifica:
  $kwPattern = '(?i)\b(prohibid[oa]s?|prohibici[oo]n|obligatori[oa]s?|debe[sn]?|nunca|jam[aa]s|siempre|inviolable[s]?|inmutable[s]?)\b'
  $inCode = $false

  for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*```') {
      $inCode = -not $inCode
      continue
    }
    if ($inCode) { continue }
    if ($line -match '^#{1,6}\s+') { continue }
    if ($line -match '^\s*<!--.*?-->\s*$') { continue }
    if ($line -match '^\s*\|') { continue }

    if ($line -match $kwPattern) {
      $start = $i
      while ($start -gt 0) {
        $prev = $lines[$start]
        if ($prev -match '^\s*([-*]|\d+\.)\s+' -or $prev -match '^\s*>') {
          break
        }
        if ([string]::IsNullOrWhiteSpace($lines[$start - 1]) -or $lines[$start - 1] -match '^#{1,6}\s+') {
          break
        }
        $start--
      }

      $startIndent = 0
      if ($lines[$start] -match '^(\s*)') {
        $startIndent = $Matches[1].Length
      }

      $end = $i
      while ($end + 1 -lt $lines.Length) {
        $next = $lines[$end + 1]
        if ($next -match '^#{1,6}\s+' -or $next -match '^---$') {
          break
        }
        if ($next -match '^(\s*)([-*]|\d+\.)\s+') {
          $nextIndent = $Matches[1].Length
          if ($nextIndent -le $startIndent -and $end -ge $i) {
            break
          }
        }
        if ([string]::IsNullOrWhiteSpace($lines[$end]) -and [string]::IsNullOrWhiteSpace($next)) {
          break
        }
        $end++
      }

      $hasTag = $false
      for ($k = $start; $k -le $end; $k++) {
        if ($lines[$k] -match '<!--\s*verifica:\s*([^>]+)\s*-->') {
          $hasTag = $true
          break
        }
      }

      if (-not $hasTag) {
        $errors.Add( ("L{0}: Regla con palabra prescriptiva sin etiqueta verifica: en el mismo item: '{1}'" -f ($i + 1), $line.Trim()) )
      }
    }
  }

  # Existencia de rutas referenciadas
  $inCode = $false
  for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*```') {
      $inCode = -not $inCode
      continue
    }
    if ($inCode) { continue }

    if ($line -match '<!--\s*verifica:\s*([^>]+)\s*-->') {
      $inner = $Matches[1].Trim()
      $targets = $inner -split ','
      foreach ($rawT in $targets) {
        $t = $rawT.Trim()
        if (-not $t) { continue }
        if ($t -eq 'instruccion' -or $t -eq 'instruccion') {
          $instruccionCount++
        } else {
          $rutaCount++
          $parts = $t -split '#', 2
          $cleanPath = $parts[0].Trim()
          $anchor = if ($parts.Length -gt 1) { $parts[1].Trim() } else { "" }
          if ($rootPath) {
            $fullPath = Join-Path $rootPath $cleanPath
            $isRepoRoot = (Test-Path (Join-Path $rootPath ".git")) -or (Test-Path (Join-Path $rootPath "deno.json"))
            if ($cleanPath.StartsWith("docs/") -or $isRepoRoot) {
              if (-not (Test-Path $fullPath)) {
                $errors.Add( ("L{0}: Ruta de mecanismo inexistente en disco: '{1}'" -f ($i + 1), $cleanPath) )
              } elseif ($anchor) {
                $targetContent = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
                $escAnchor = [regex]::Escape($anchor)
                $anchorFound = $false
                if ($cleanPath -match 'doc-linter\.ps1$') {
                  $anchorFound = ($targetContent -match "Register-Check\s+`"$escAnchor`"")
                } elseif ($cleanPath -match 'deno\.json$') {
                  $anchorFound = ($targetContent -match "`"$escAnchor`"\s*:")
                } elseif ($cleanPath -match '\.ya?ml$') {
                  $anchorFound = ($targetContent -match "(?m)^\s*$escAnchor\s*:")
                } else {
                  $anchorFound = ($targetContent -match $escAnchor)
                }
                if (-not $anchorFound) {
                  $errors.Add( ("L{0}: Ancla de mecanismo '#{1}' no encontrada en '{2}'" -f ($i + 1), $anchor, $cleanPath) )
                }
              }
            }
          }
        }
      }
    }
  }

  return @{
    ManifestPath = $manifestPath
    HeadingsOk = $headingsOk
    HeadingCount = $headingCount
    MarkCount = $markCount
    Errors = $errors
    Passed = ($errors.Count -eq 0)
    RutaCount = $rutaCount
    InstruccionCount = $instruccionCount
  }
}

# Autoprueba sintetica en memoria
$synthTestsPassed = $true
$synthDetails = [System.Collections.Generic.List[string]]::new()

$synthMissingTag = @"
## Seccion Sintetica
<!-- [ESTANDAR] -->

- Esta regla esta estrictamente prohibida sin excepcion.
"@
$resSynthMissing = Test-AgentsManifestContent "synth-missing.md" $synthMissingTag ""
if ($resSynthMissing.Passed) {
  $synthTestsPassed = $false
  $synthDetails.Add("Fallo deteccion de regla obligatoria/prohibida sin etiqueta")
}

$synthValid = @"
## Seccion Sintetica
<!-- [ESTANDAR] -->

- Esta regla esta estrictamente prohibida sin excepcion.
  <!-- verifica: instruccion -->
"@
$resSynthValid = Test-AgentsManifestContent "synth-valid.md" $synthValid ""
if (-not $resSynthValid.Passed) {
  $synthTestsPassed = $false
  $synthDetails.Add("Falso positivo en regla valida con etiqueta instruccion")
}

$synthBadMark = @"
## Seccion Sintetica Sin Marca
- Regla informativa.
"@
$resSynthBadMark = Test-AgentsManifestContent "synth-bad-mark.md" $synthBadMark ""
if ($resSynthBadMark.HeadingsOk) {
  $synthTestsPassed = $false
  $synthDetails.Add("Fallo deteccion de encabezado sin marca [ESTANDAR] / proyecto")
}

$synthBadPath = @"
## Seccion Sintetica
<!-- [ESTANDAR] -->

- Esta regla exige un archivo.
  <!-- verifica: docs/inexistente/mecanismo_falso.ts -->
"@
$resSynthBadPath = Test-AgentsManifestContent "synth-bad-path.md" $synthBadPath $repoRoot
if ($resSynthBadPath.Passed) {
  $synthTestsPassed = $false
  $synthDetails.Add("Fallo deteccion de ruta de mecanismo inexistente")
}

$synthMsg = if ($synthTestsPassed) { "Cuatro escenarios sinteticos validados en memoria" } else { $synthDetails -join "; " }
Register-Check "Manifiestos" "Autoprueba sintetica del validador de manifiestos" $synthTestsPassed $synthMsg

# Verificacion de todos los archivos AGENTS.md descubiertos dinamicamente
$manifestSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

try {
  $gitTracked = & git -C $repoRoot ls-files "*AGENTS.md" 2>$null
  if ($gitTracked) {
    foreach ($line in ($gitTracked -split "`r?`n")) {
      $trim = $line.Trim().Replace('\', '/')
      if ($trim) { [void]$manifestSet.Add($trim) }
    }
  }
  $gitUntracked = & git -C $repoRoot ls-files --others --exclude-standard "*AGENTS.md" 2>$null
  if ($gitUntracked) {
    foreach ($line in ($gitUntracked -split "`r?`n")) {
      $trim = $line.Trim().Replace('\', '/')
      if ($trim) { [void]$manifestSet.Add($trim) }
    }
  }
} catch {}

if ($manifestSet.Count -eq 0) {
  Get-ChildItem -Path $repoRoot -Recurse -Filter "AGENTS.md" -File |
    Where-Object {
      $norm = $_.FullName.Replace('\', '/')
      $norm -notmatch '/(\.git|\.agents|node_modules|coverage|\.gemini|\.claude)/'
    } |
    ForEach-Object {
      $rel = $_.FullName.Substring($repoRoot.Length).TrimStart('\', '/').Replace('\', '/')
      [void]$manifestSet.Add($rel)
    }
}

$manifestList = @($manifestSet | Sort-Object)

foreach ($relPath in $manifestList) {
  $fullPath = Join-Path $repoRoot $relPath
  $exists = Test-Path $fullPath
  $parentDir = Split-Path $fullPath -Parent
  $exigirManifiesto = ($relPath -eq "docs/AGENTS.md") -or ($relPath -eq "AGENTS.md") -or (Test-Path $parentDir)

  if ($exigirManifiesto) {
    Register-Check "Manifiestos" "$relPath - Archivo existe en repositorio" $exists
  }

  if ($exists) {
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    $res = Test-AgentsManifestContent $relPath $content $repoRoot

    Register-Check "Manifiestos" "$relPath - Conteo de marcas [ESTANDAR] / proyecto coincide con encabezados" $res.HeadingsOk ("Encabezados: {0}, Marcas: {1}" -f $res.HeadingCount, $res.MarkCount)

    $rulesOk = ($res.Errors.Count -eq 0)
    $rulesDetail = if ($rulesOk) {
      ("Etiquetas conformes: {0} rutas, {1} instrucciones" -f $res.RutaCount, $res.InstruccionCount)
    } else {
      $res.Errors -join "; "
    }
    Register-Check "Manifiestos" "$relPath - Reglas etiquetadas y rutas de mecanismos validas" $rulesOk $rulesDetail
  }
}

# -----------------------------------------------------------------
# 9. PLANTILLAS OFICIALES (docs/_plantillas)
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n--- 9. Verificacion de Plantillas Oficiales (docs/_plantillas) ---"
$plantillasDir = Join-Path $DocsPath "_plantillas"

if (Test-Path $plantillasDir) {
  # 1. PLANTILLA-CU.md
  $cuTemplatePath = Join-Path $plantillasDir "PLANTILLA-CU.md"
  if (Test-Path $cuTemplatePath) {
    $cuTpl = [System.IO.File]::ReadAllText($cuTemplatePath, [System.Text.Encoding]::UTF8)
    $hasCuSec6 = $cuTpl -match '## 6\.\s+Contrato T.{1,2}cnico de Ingenier.{1,2}a'
    $has61 = $cuTpl -match '###?\s+6\.1'
    $has62 = $cuTpl -match '###?\s+6\.2'
    $has63 = $cuTpl -match '###?\s+6\.3'
    $has64 = $cuTpl -match '###?\s+6\.4'
    $cuTplOk = $hasCuSec6 -and $has61 -and $has62 -and $has63 -and $has64
    Register-Check "Plantillas" "PLANTILLA-CU.md cuenta con Seccion 6 y subsecciones 6.1 a 6.4" $cuTplOk "Sec6:$hasCuSec6 6.1:$has61 6.2:$has62 6.3:$has63 6.4:$has64"
  }

  # 2. PLANTILLA-ADR.md
  $adrTemplatePath = Join-Path $plantillasDir "PLANTILLA-ADR.md"
  if (Test-Path $adrTemplatePath) {
    $adrTpl = [System.IO.File]::ReadAllText($adrTemplatePath, [System.Text.Encoding]::UTF8)
    $hasAdrSummary = $adrTpl -match '## Resumen Ejecutivo de Negocio'
    $hasAdrEstado = $adrTpl -match '## Estado'
    $hasAdrContexto = $adrTpl -match '## Contexto'
    $hasAdrDecision = $adrTpl -match '## Decisi[oo]n'
    $hasAdrConsecuencias = $adrTpl -match '## Consecuencias'
    $adrTplOk = $hasAdrSummary -and $hasAdrEstado -and $hasAdrContexto -and $hasAdrDecision -and $hasAdrConsecuencias
    Register-Check "Plantillas" "PLANTILLA-ADR.md cuenta con Resumen Ejecutivo de Negocio y secciones canonicas" $adrTplOk "Resumen:$hasAdrSummary Estado:$hasAdrEstado Contexto:$hasAdrContexto Decision:$hasAdrDecision Consecuencias:$hasAdrConsecuencias"
  }

  # 3. PLANTILLA-DS-CU.md
  $dsTemplatePath = Join-Path $plantillasDir "PLANTILLA-DS-CU.md"
  if (Test-Path $dsTemplatePath) {
    $dsTpl = [System.IO.File]::ReadAllText($dsTemplatePath, [System.Text.Encoding]::UTF8)
    $hasDsContrato = $dsTpl -match '## Resumen del Contrato T.{1,2}cnico'
    $hasDsDiagrama = $dsTpl -match '## Diagramas de Secuencia'
    $dsTplOk = $hasDsContrato -and $hasDsDiagrama
    Register-Check "Plantillas" "PLANTILLA-DS-CU.md cuenta con contrato y diagramas de secuencia" $dsTplOk "Contrato:$hasDsContrato Diagramas:$hasDsDiagrama"
  }

  # 4. PLANTILLA-RN.md
  $rnTemplatePath = Join-Path $plantillasDir "PLANTILLA-RN.md"
  if (Test-Path $rnTemplatePath) {
    $rnTpl = [System.IO.File]::ReadAllText($rnTemplatePath, [System.Text.Encoding]::UTF8)
    $hasRnDef = $rnTpl -match '## Definici[oo]n y Alcance'
    $hasRnCrit = $rnTpl -match '## Criterios de Aceptaci[oo]n'
    $rnTplOk = $hasRnDef -and $hasRnCrit
    Register-Check "Plantillas" "PLANTILLA-RN.md cuenta con definicion y criterios de aceptacion" $rnTplOk "Definicion:$hasRnDef Criterios:$hasRnCrit"
  }

  # 5. PLANTILLA-PB.md
  $pbTemplatePath = Join-Path $plantillasDir "PLANTILLA-PB.md"
  if (Test-Path $pbTemplatePath) {
    $pbTpl = [System.IO.File]::ReadAllText($pbTemplatePath, [System.Text.Encoding]::UTF8)
    $hasPbDesc = $pbTpl -match '## Descripci[oo]n'
    $hasPbSec = $pbTpl -match '## Secuencia Narrativa del Proceso'
    $pbTplOk = $hasPbDesc -and $hasPbSec
    Register-Check "Plantillas" "PLANTILLA-PB.md cuenta con descripcion y secuencia narrativa" $pbTplOk "Descripcion:$hasPbDesc Secuencia:$hasPbSec"
  }

  # 6. PLANTILLA-Actor.md
  $actorTemplatePath = Join-Path $plantillasDir "PLANTILLA-Actor.md"
  if (Test-Path $actorTemplatePath) {
    $actorTpl = [System.IO.File]::ReadAllText($actorTemplatePath, [System.Text.Encoding]::UTF8)
    $hasActorObj = $actorTpl -match '## Objetivo'
    $hasActorCap = $actorTpl -match '## Capacidades y Casos de Uso Documentados'
    $actorTplOk = $hasActorObj -and $hasActorCap
    Register-Check "Plantillas" "PLANTILLA-Actor.md cuenta con objetivo y capacidades documentadas" $actorTplOk "Objetivo:$hasActorObj Capacidades:$hasActorCap"
  }
}

# -----------------------------------------------------------------
# RESUMEN Y RESULTADO FINAL
# [ESTANDAR]
# -----------------------------------------------------------------
Write-Host "`n================================================================="
Write-Host "RESUMEN DE AUDITORIA DOC-LINTER"
Write-Host "================================================================="
Write-Host "Total de comprobaciones : $TotalChecks"
Write-Host "Comprobaciones APROBADAS: $TotalPassed" -ForegroundColor Green
Write-Host "Comprobaciones FALLIDAS : $TotalFailed" -ForegroundColor $(if ($TotalFailed -gt 0) { "Red" } else { "Green" })
Write-Host "Advertencias            : $TotalWarnings" -ForegroundColor $(if ($TotalWarnings -gt 0) { "Yellow" } else { "Green" })

if ($TotalFailed -gt 0) {
  Write-Host "`n[DICTAMEN: FALLO BLOQUEANTE] Se encontraron $TotalFailed inconformidades:" -ForegroundColor Red
  foreach ($f in $Failures) {
    Write-Host "  * $f" -ForegroundColor Red
  }
  Write-Host "`nExit code: 1"
  exit 1
} else {
  Write-Host "`n[DICTAMEN: PASS AUDIT] Todas las comprobaciones se completaron satisfactoriamente." -ForegroundColor Green
  Write-Host "Gobernanza documental bimodal 100% conforme con el perfil Lego."
  Write-Host "Exit code: 0"
  exit 0
}
