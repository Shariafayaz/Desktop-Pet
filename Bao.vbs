Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\cse\Antigravity folder\pet"
WshShell.Run "cmd /c npm start", 0, False
