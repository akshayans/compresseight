[Setup]
AppName=compresseight
AppVersion=1.0
DefaultDirName={pf}\compresseight
DefaultGroupName=compresseight
OutputDir=.
OutputBaseFilename=compresseight-installer
Compression=lzma
SolidCompression=yes
SetupIconFile=icon.ico

[Files]
Source: "compresseight.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\compresseight"; Filename: "{app}\compresseight.exe"

[Registry]
Root: HKCR; Subkey: "*\shell\CompressEight"; ValueType: string; ValueName: ""; ValueData: "CompressEight"; Flags: uninsdeletekey
Root: HKCR; Subkey: "*\shell\CompressEight"; ValueType: string; ValueName: "Icon"; ValueData: "{app}\compresseight.exe"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "*\shell\CompressEight\command"; ValueType: string; ValueName: ""; ValueData: """{app}\compresseight.exe"" ""%1"""; Flags: uninsdeletekey



