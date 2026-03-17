# export-to-docx.ps1
# Place this file in your `server` folder and run:
#   .\export-to-docx.ps1

param(
    [string]$RootPath = ".",
    [string]$OutputName = "server-codebase.docx"
)

Write-Host "=== Backend Code Exporter ===" -ForegroundColor Cyan

# ── 1. Install docx locally if not already present ───────────────────────────
$resolvedRoot = (Resolve-Path $RootPath).Path
$docxModule = Join-Path $resolvedRoot "node_modules\docx"

if (-not (Test-Path $docxModule)) {
    Write-Host "Installing 'docx' package locally..." -ForegroundColor Yellow
    Push-Location $resolvedRoot
    npm install docx --no-save
    Pop-Location
} else {
    Write-Host "'docx' package found." -ForegroundColor Green
}

# ── 2. Collect ONLY .ts files inside src\ ────────────────────────────────────
$srcPath = Join-Path $resolvedRoot "src"

if (-not (Test-Path $srcPath)) {
    Write-Host "ERROR: No 'src' folder found at $srcPath" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts" -File | Sort-Object FullName

Write-Host "Found $($files.Count) TypeScript files inside src\" -ForegroundColor Green

# ── 3. Write Node.js generator (embed all file data directly) ─────────────────
$outputPath = Join-Path $resolvedRoot $OutputName
$tempJs = Join-Path $resolvedRoot "~temp-gen-docx.js"

# Build JS array of file objects directly — avoids JSON encoding issues
$jsFileArray = "const files = [`n"
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($resolvedRoot + "\", "").Replace("\", "\\")
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($null -eq $content) { $content = "" }
    # Escape backticks, backslashes, and dollar signs for JS template literal
    $escaped = $content -replace '\\', '\\' -replace '`', '\`' -replace '\$\{', '\${'
    $jsFileArray += "  { path: ``$relativePath``, content: ``$escaped`` },`n"
}
$jsFileArray += "];`n"

$jsCode = @"
const path = require('path');
const fs = require('fs');

const docxPath = path.join(__dirname, 'node_modules', 'docx');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak
} = require(docxPath);

$jsFileArray

const outPath = process.argv[2];
const children = [];

// Cover Page
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 2880, after: 480 },
  children: [new TextRun({ text: 'Backend Server', bold: true, size: 64, font: 'Arial', color: '1F497D' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 240 },
  children: [new TextRun({ text: 'Full Source Code - /src', size: 36, font: 'Arial', color: '2E75B6' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 160 },
  children: [new TextRun({ text: 'Generated: ' + new Date().toLocaleString(), size: 22, font: 'Arial', color: '888888' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 720 },
  children: [new TextRun({ text: 'Total files: ' + files.length, size: 22, font: 'Arial', color: '888888' })]
}));

// Table of Contents
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(new Paragraph({
  spacing: { before: 480, after: 320 },
  children: [new TextRun({ text: 'Table of Contents', bold: true, size: 36, font: 'Arial', color: '1F497D' })]
}));
files.forEach((f, i) => {
  children.push(new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [new TextRun({ text: (i + 1) + '.  ' + f.path, size: 18, font: 'Courier New', color: '1F497D' })]
  }));
});

// File Contents
files.forEach((f, i) => {
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({ text: (i + 1) + '  ', bold: true, size: 13, font: 'Arial', color: '888888' }),
      new TextRun({ text: f.path, bold: true, size: 24, font: 'Courier New', color: '2E75B6' })
    ]
  }));
  children.push(new Paragraph({
    spacing: { before: 0, after: 160 },
    border: { bottom: { style: 'single', size: 6, color: '2E75B6', space: 1 } },
    children: [new TextRun({ text: '' })]
  }));
  const lines = (f.content || '').split('\n');
  lines.forEach(line => {
    children.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 220 },
      children: [new TextRun({ text: line.length > 0 ? line : ' ', font: 'Courier New', size: 16, color: '1A1A1A' })]
    }));
  });
});

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('SUCCESS: ' + outPath);
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
"@

[System.IO.File]::WriteAllText($tempJs, $jsCode, [System.Text.Encoding]::UTF8)

# ── 4. Run Node.js ────────────────────────────────────────────────────────────
Write-Host "`nGenerating Word document..." -ForegroundColor Cyan
node $tempJs $outputPath

# ── 5. Cleanup ────────────────────────────────────────────────────────────────
Remove-Item $tempJs -ErrorAction SilentlyContinue

# ── 6. Result ─────────────────────────────────────────────────────────────────
if (Test-Path $outputPath) {
    $size = [math]::Round((Get-Item $outputPath).Length / 1KB, 1)
    Write-Host "`n✅ Done! File saved: $outputPath ($size KB)" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed. Check errors above." -ForegroundColor Red
}