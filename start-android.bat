@echo off
echo ====================================================
echo Starting NSRIT School App on Android Emulator...
echo ====================================================

echo [1/3] Setting up adb port forwarding...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:9099 tcp:9099
adb reverse tcp:9399 tcp:9399

echo [2/3] Starting Metro Bundler in a new window...
start cmd /k "npx react-native start"

echo [3/3] Launching application on emulator...
adb shell monkey -p com.nsritschoolapp -c android.intent.category.LAUNCHER 1

echo ====================================================
echo Done! The app should now load on the emulator.
echo ====================================================
pause
