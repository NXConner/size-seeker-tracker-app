# Size Seeker Tracker - APK Build Script
Write-Host "🚀 Starting APK build process..." -ForegroundColor Green

# Step 1: Install Capacitor dependencies
Write-Host "📦 Installing Capacitor dependencies..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli @capacitor/android

# Step 2: Build the web app
Write-Host "🔨 Building web application..." -ForegroundColor Yellow
npm run build

# Step 3: Initialize Capacitor (if not already done)
if (-not (Test-Path "capacitor.config.ts")) {
    Write-Host "⚙️ Initializing Capacitor..." -ForegroundColor Yellow
    npx cap init "Size Seeker Tracker" "com.sizeseeker.tracker" --web-dir=dist
}

# Step 4: Add Android platform (if not already done)
if (-not (Test-Path "android")) {
    Write-Host "📱 Adding Android platform..." -ForegroundColor Yellow
    npx cap add android
}

# Step 5: Sync web code to Android
Write-Host "🔄 Syncing web code to Android..." -ForegroundColor Yellow
npx cap sync android

# Step 6: Open Android Studio
Write-Host "🎯 Opening Android Studio..." -ForegroundColor Yellow
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for Android Studio to open" -ForegroundColor White
Write-Host "   2. Wait for project sync to complete" -ForegroundColor White
Write-Host "   3. Go to Build → Build Bundle(s) / APK(s) → Build APK(s)" -ForegroundColor White
Write-Host "   4. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White

npx cap open android

Write-Host "✅ Build process initiated!" -ForegroundColor Green
Write-Host "📱 APK will be ready in Android Studio" -ForegroundColor Green 