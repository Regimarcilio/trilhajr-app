#!/bin/bash
# EAS Build Script for TrilhaJr
# Builds produção e gera artefatos APK/AAB e IPA

set -e

echo "🔧 Configurando build EAS para TrilhaJr..."

# Verificar se eas-cli está instalado
if ! command -v eas &> /dev/null; then
  echo "📦 Instalando EAS CLI..."
  npm install -g eas-cli
fi

# Login check
echo "🔐 Verificando autenticação EAS..."
eas whoami || {
  echo "❌ É necessário fazer login no EAS"
  echo "Execute: eas login"
  exit 1
}

# Configure eas.json if not exists
if [ ! -f "eas.json" ]; then
  cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {}
    }
  }
}
EOF
fi

echo ""
echo "🏗️ Iniciando builds..."
echo ""

# Build Android (AAB - App Bundle para Play Store)
echo "🤖 Android AAB (Play Store)..."
eas build --platform android --profile production --non-interactive &

# Build iOS (IPA)
echo "🍎 iOS IPA (App Store)..."
eas build --platform ios --profile production --non-interactive &

# Wait for builds to complete
wait

echo ""
echo "✅ Builds concluídos!"
echo ""
echo "📱 Downloads:"
echo "  Android: Verifique em https://console.expo.dev"
echo "  iOS: Verifique em https://console.expo.dev"
echo ""
echo "📦 Subir para lojas:"
echo "  Android: \`eas submit --platform android\`"
echo "  iOS: \`eas submit --platform ios\`"