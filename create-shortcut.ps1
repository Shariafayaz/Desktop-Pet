$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Bao the Panda.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"d:\cse\Antigravity folder\pet\Bao.vbs`""
$shortcut.WorkingDirectory = "d:\cse\Antigravity folder\pet"
$shortcut.IconLocation = "d:\cse\Antigravity folder\pet\panda.ico,0"
$shortcut.Description = "Bao Desktop Panda Companion"
$shortcut.Save()
Write-Host "Desktop shortcut created at: $shortcutPath"
