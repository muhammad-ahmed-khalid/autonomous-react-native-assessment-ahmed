#!/bin/bash

# Push Notifications Setup Script
# This script installs all required dependencies for push notifications

echo "🚀 Installing Push Notification Dependencies..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

# Install packages
echo "📦 Installing @react-native-firebase/app..."
npm install @react-native-firebase/app

echo "📦 Installing @react-native-firebase/messaging..."
npm install @react-native-firebase/messaging

echo "📦 Installing @notifee/react-native..."
npm install @notifee/react-native

echo ""
echo "✅ All packages installed successfully!"
echo ""

# Check platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - Installing iOS pods..."
    cd ios
    if command -v pod &> /dev/null; then
        echo "Running pod install..."
        pod install
        cd ..
        echo "✅ iOS pods installed successfully!"
    else
        echo "⚠️  CocoaPods not found. Please install it: sudo gem install cocoapods"
        cd ..
    fi
else
    echo "🤖 Non-macOS platform - Skipping iOS pod install"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. For Android:"
echo "   - Verify google-services.json is in android/app/"
echo "   - Run: npx expo run:android"
echo ""
echo "2. For iOS:"
echo "   - Complete iOS setup (see IOS_CONFIGURATION_GUIDE.md)"
echo "   - Add GoogleService-Info.plist to Xcode"
echo "   - Run: npx expo run:ios --device"
echo ""
echo "3. Read the documentation:"
echo "   - README_PUSH_NOTIFICATIONS.md - Quick start guide"
echo "   - PUSH_NOTIFICATIONS_SETUP.md - Complete setup guide"
echo "   - IOS_CONFIGURATION_GUIDE.md - iOS specific configuration"
echo "   - FCM_BACKEND_GUIDE.md - Backend integration examples"
echo ""
echo "🔍 Need help? Check the troubleshooting section in README_PUSH_NOTIFICATIONS.md"
echo ""
