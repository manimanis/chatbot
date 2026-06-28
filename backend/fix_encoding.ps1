$ErrorActionPreference = 'SilentlyContinue'
$src = 'c:\xampp-school\htdocs\chatbot\backend\chat.php'
$tmp = 'c:\xampp-school\htdocs\chatbot\backend\chat.tmp'
$content = Get-Content $src -Raw
$content = $content.TrimStart([char]0xFEFF)
$content = $content -replace 'ï»¿', ''
$content = $content -replace 'Ã©', [char]0x00E9
$content = $content -replace 'Ã¨', [char]0x00E8
$content = $content -replace 'Ãª', [char]0x00EA
$content = $content -replace 'Ã§', [char]0x00E7
$content = $content -replace 'Ã ', [char]0x00E0
$content = $content -replace 'Ã¹', [char]0x00F9
$content = $content -replace 'Ã»', [char]0x00FB
$content = $content -replace 'Ã®', [char]0x00EE
$content = $content -replace 'Ã´', [char]0x00F4
$content = $content -replace 'Ã«', [char]0x00EB
$content = $content -replace 'Ã€', [char]0x00C0
$content = $content -replace 'ÃŠ', [char]0x00CA
$content = $content -replace 'Ã‡', [char]0x00C7
$content = $content -replace 'Ã™', [char]0x00D9
$content = $content -replace 'Ã›', [char]0x00DB
$content = $content -replace 'ÃŽ', [char]0x00CE
$content = $content -replace 'Ã”', [char]0x00D4
$content = $content -replace 'â€™', [char]0x2019
$content = $content -replace 'â€¦', [char]0x2026
$content = $content -replace 'â€“', [char]0x2013
$content = $content -replace 'â€”', [char]0x2014
[System.IO.File]::WriteAllText($tmp, $content, (New-Object System.Text.UTF8Encoding $false))
Move-Item $tmp $src -Force
Write-Host 'Done'
