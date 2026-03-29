@echo off
REM Push Notifications Setup Script for Windows
REM This script installs all required dependencies for push notifications

echo.
echo ================================================
echo   Push Notification Dependencies Installation
echo ================================================
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Installing packages...
echo.

echo [1/4] Installing @react-native-firebase/app...
call npm install @react-native-firebase/app
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [2/4] Installing @react-native-firebase/messaging...
call npm install @react-native-firebase/messaging
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo [3/3] Installing @notifee/react-native...
call npm install @notifee/react-native
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ================================================
echo   SUCCESS: All packages installed!
echo ================================================
echo.

echo NEXT STEPS:
echo.
echo 1. For Android:
echo    - Verify google-services.json is in android\app\
echo    - Run: npx expo run:android
echo.
echo 2. For iOS (on Mac):
echo    - Complete iOS setup (see IOS_CONFIGURATION_GUIDE.md)
echo    - Add GoogleService-Info.plist to Xcode
echo    - Run: npx expo run:ios --device
echo.
echo 3. Read the documentation:
echo    - README_PUSH_NOTIFICATIONS.md (Quick start guide)
echo    - PUSH_NOTIFICATIONS_SETUP.md (Complete setup)
echo    - IOS_CONFIGURATION_GUIDE.md (iOS configuration)
echo    - FCM_BACKEND_GUIDE.md (Backend integration)
echo.
echo Need help? Check troubleshooting in README_PUSH_NOTIFICATIONS.md
echo.
pause
exit /b 0

:error
echo.
echo ================================================
echo   ERROR: Installation failed!
echo ================================================
echo.
echo Please check the error messages above and try again.
echo If the problem persists, try:
echo   1. Delete node_modules folder
echo   2. Run: npm install
echo   3. Run this script again
echo.
pause
exit /b 1
