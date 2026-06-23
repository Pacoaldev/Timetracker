Set shell = CreateObject("WScript.Shell")
Set exec = shell.Exec("cmd /c netstat -aon | findstr :5173 | findstr LISTENING")

Do While Not exec.StdOut.AtEndOfStream
  line = Trim(exec.StdOut.ReadLine())
  If Len(line) > 0 Then
    parts = Split(line)
    pid = parts(UBound(parts))
    On Error Resume Next
    shell.Run "taskkill /F /PID " & pid, 0, True
    On Error GoTo 0
  End If
Loop

shell.Popup "TimeTracker detenido.", 2, "TimeTracker", 64
