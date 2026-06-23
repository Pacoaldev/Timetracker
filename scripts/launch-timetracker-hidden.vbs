Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectRoot = fso.GetParentFolderName(scriptDir)
batPath = fso.BuildPath(scriptDir, "launch-timetracker-silent.bat")

shell.CurrentDirectory = projectRoot
shell.Run "cmd /c """ & batPath & """", 0, False
