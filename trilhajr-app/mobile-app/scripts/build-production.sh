#!/bin/bash
# RECRUITADOR NOW - Build Script v1.0.0
# Final production build for App Store & Play Store

set -e

echo "🚀 RECRUITADOR NOW - Build v1.0.0"
echo "=================================="

# Navigate to mobile app
cd "$(dirname "$0")"

# Update app.json for production
echo "🔧 Atualizando configurações..."
cat > app-prod.json << 'EOF'
{
  "expo": {
    "name": "RecrutadorNow",
    "slug": "recrutadornow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A8A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.recrutadornow.app",
      "bundleColor": "#1E3A8A",
      "package": "com.recrutadornow.app",
      "downloadUrl": "https://recrutadornow.com/download"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#1E3A8A",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png"
      },
      "package": "com.recrutadornow.app",
      "downloadUrl": "https://recrutadornow.com/download"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "recrutadornow-project-id"
      }
    }
  }
}
EOF

# Install EAS CLI if needed
if ! command -v eas &> /dev/null; then
  echo "📦 Instalando EAS CLI..."
  npm install -g eas-cli
fi

# Login check
echo "🔐 Verificando autenticação EAS..."
eas whoami || {
  echo "❌ Realizar login EAS primeiro:"
  echo "   npx eas login"
  exit 1
}

echo ""
echo "🏗️ Gerando builds de produção..."
echo ""

# Android Build (AAB)
echo "🤖 Android AAB (Google Play)..."
eas build --platform android --profile production --non-interactive

# iOS Build (IPA) 
echo ""
echo "🍎 iOS IPA (App Store)..."
eas build --platform ios --profile production --non-interactive

echo ""
echo "✅ BUILD COMPLETO!"
echo ""
echo "📱 Downloads:"
echo "   Android AAB: https://recrutadornow.com/download/recrutadornow.aab"
echo "   iOS IPA: https://recrutadornow.com/download/recrutadornow.ipa"
echo ""
echo "📦 Subir para lojas:"
echo "   npm run submit:android  # ou npx eas submit --platform android"
echo "   npm run submit:ios      # ou npx eas submit --platform ios"
echo ""
echo "📋 Configurações:"
echo "   Bundle ID: com.recrutadornow.app"
echo "   App Name: RecrutadorNow"
echo "   Version: 1.0.0"