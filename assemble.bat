@echo off
REM Assembly script for App.jsx parts (Windows)

echo.
echo === Assembling App.jsx from 5 parts ===
echo.

REM Check if all parts exist
for %%i in (1 2 3 4 5) do (
  if not exist "App_Part%%i.jsx" (
    echo ERROR: App_Part%%i.jsx not found!
    exit /b 1
  )
)

REM Assemble the parts
type App_Part1.jsx App_Part2.jsx App_Part3.jsx App_Part4.jsx App_Part5.jsx > App.jsx

REM Verify assembly
if exist "App.jsx" (
  echo.
  echo === Assembly complete! ===
  echo Output: App.jsx
  for %%A in (App.jsx) do echo File size: %%~zA bytes
  echo.
  echo Your assembled App.jsx is ready to use!
  echo.
) else (
  echo.
  echo ERROR: Assembly failed!
  exit /b 1
)
