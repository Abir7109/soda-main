' SODA Local Agent - Hidden launcher (no console window)
' Uses the VBS script's own location to find local_agent.py

Dim fso, scriptDir, scriptPath
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetFile(WScript.ScriptFullName).ParentFolder.Path
scriptPath = scriptDir & "\backend\local_agent.py"

CreateObject("WScript.Shell").Run "py -3.11 """ & scriptPath & """", 0, False
