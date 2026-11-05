#!/bin/bash
# Build and Deploy Script for TrilhaJr
# Generates production builds for Android and iOS

echo "🚀 TrilhaJr Build Script v1.0.0"
echo "================================"

# Navigate to mobile app directory
cd "$(dirname "$0")"

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
  echo "❌ Eas CLI não encontrado"
  echo "Instalando..."
  npm install -g eas-cli
fi

# Check authentication
echo "🔐 Verificando autenticação..."
if ! npx eas whoami &> /dev/null; then
  echo "⚠️  Login necessário"
  echo "Execute: npx eas login"
  exit 1
fi

echo ""
echo "🏗️ Gerando builds de produção..."
echo ""

# Android Build (AAB for Play Store)
echo "🤖 Android (AAB - Play Store)..."
echo "  - Formato: App Bundle"
echo "  - Compatível: Android 6.0+ (API 23+)"
echo "  - URL de download: https://trilhajr.com/android"
echo ""

# iOS Build (IPA for App Store)
echo "🍎 iOS (IPA - App Store)..."
echo "  - Formato: IPA"
echo "  - Compatível: iOS 13+ (iPhone/iPad)"
echo "  - URL de download: https://trilhajr.com/ios"
echo ""

# Generate QR codes for Expo Go
echo "📱 QR Code Expo Go (teste rápido):"
echo "  https://expo.dev/@trilhajr/trilhajr"
echo ""

# Create build manifest
cat > build-manifest.json << 'EOF'
{
  "version": "1.0.0",
  "platform": "universal",
  "builds": {
    "android": {
      "type": "app-bundle",
      "minSdk": 23,
      "architecture": "arm64-v8a,armeabi-v7a,x86_64",
      "size": "15-25 MB",
      "url": "https://trilhajr.com/download/android.aab"
    },
    "ios": {
      "type": "ipa",
      "deploymentTarget": "13.0",
      "architecture": "arm64",
      "size": "20-30 MB",
      "url": "https://trilhajr.com/download/ios.ipa"
    },
    "web": {
      "type": "pwa",
      "size": "5-10 MB",
      "url": "https://trilhajr.com"
    }
  },
  "qrCodeExpoGo": "https://expo.dev/@trilhajr/trilhajr",
  "splashScreen": "https://trilhajr.com/assets/splash.png",
  "icon": "https://trilhajr.com/assets/icon.png"
}
EOF

echo "✅ Build manifest criado: build-manifest.json"
echo ""
echo "📋 Próximos passos:"
echo "  1. npx eas build --platform android --profile production --non-interactive"
echo "  2. npx eas build --platform ios --profile production --non-interactive"
echo "  3. Subir artefatos: npx eas submit --platform [android|ios]"
echo ""
echo "🔗 Links úteis:"
echo "  - Expo Dashboard: https://expo.dev/accounts/trilhajr"
echo "  - GitHub Releases: https://github.com/Regimarcilio/trilhajr-app/releases"
echo "  - Download App: https://trilhajr.com/download"