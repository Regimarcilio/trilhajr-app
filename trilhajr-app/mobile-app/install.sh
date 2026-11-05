#!/bin/bash
# Install Script for TrilhaJr App
# Usage: ./install.sh [android|ios|web]

set -e

echo "🚀 Instalando TrilhaJr v1.0.0..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${BLUE}Instalando Node.js...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Navigate to app directory
cd "$(dirname "$0")/trilhajr-app/mobile-app"

# Install dependencies
echo -e "${BLUE}Instalando dependências...${NC}"
npm install --legacy-peer-deps

# Build for platform
build_app() {
  local platform=$1
  echo -e "${BLUE}Construindo para $platform...${NC}"
  
  case $platform in
    "android")
      if command -v eas &> /dev/null; then
        npx eas-cli build:configure
        echo -e "${GREEN}✅ Android build configurado!${NC}"
        echo "Para build real: npx eas build --platform android --profile production"
      else
        echo -e "${GREEN}✅ Android pronto para EAS Build!${NC}"
      fi
      ;;
    "ios")
      if command -v eas &> /dev/null; then
        npx eas-cli build:configure
        echo -e "${GREEN}✅ iOS build configurado!${NC}"
        echo "Para build real: npx eas build --platform ios --profile production"
      else
        echo -e "${GREEN}✅ iOS pronto para EAS Build!${NC}"
      fi
      ;;
    "web")
      npm run web
      echo -e "${GREEN}✅ Servidor web iniciado!${NC}"
      echo "Acesse: http://localhost:8081"
      ;;
    *)
      echo "Uso: $0 {android|ios|web}"
      exit 1
      ;;
  esac
}

# Main
case "${1:-all}" in
  "android")
    build_app "android"
    ;;
  "ios")
    build_app "ios"
    ;;
  "web")
    build_app "web"
    ;;
  "all"|*)
    echo -e "${GREEN}Instalação do TrilhaJr v1.0.0 concluída!${NC}"
    echo ""
    echo "📱 Para iniciar o app:"
    echo "  npm start                    # Expo Dev
 echo "  npm run android              # Android (emulador)
 echo "  npm run ios                  # iOS (simulador)
 echo "  npm run web                  # Web browser
 echo ""
 echo "📦 Para build de produção (EAS):"
 echo "  eas build --platform android --profile production  # Android AAB
 echo "  eas build --platform ios --profile production      # iOS IPA"
    
    echo ""
    echo "📋 Pré-requisitos para EAS Build:"
    echo "  1. Conta Expo (https://expo.dev/signup)"
    echo "  2. eas-cli: npm install -g eas-cli"
    echo "  3. eas login"
    echo "  4. eas credentials --platform [android|ios]"
    ;;
esac