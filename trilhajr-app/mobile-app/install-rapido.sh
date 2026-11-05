#!/bin/bash
# ====================================================
# 🚀 RECRUITADOR NOW - Instalador Rápido v1.0.0
# Instala em 2 minutos no seu Android!
# ====================================================

echo "🚀 RECRUITADOR NOW - Instalador Rápido"
echo "========================================"
echo ""

# Verificar se tem wget ou curl
if command -v wget &> /dev/null; then
    DOWNLOADER="wget"
elif command -v curl &> /dev/null; then
    DOWNLOADER="curl"
else
    echo "❌ Instale wget ou curl primeiro"
    echo "   Ubuntu/Debian: sudo apt install wget curl"
    echo "   MacOS: brew install wget curl"
    exit 1
fi

# Downloads
echo "📥 Baixando apk do RecrutadorNow..."

if [ "$DOWNLOADER" = "wget" ]; then
    wget -O recrutadornow.apk "https://github.com/Regimarcilio/trilhajr-app/releases/download/v1.0.0/recrutadornow-android.apk"
else
    curl -L -o recrutadornow.apk "https://github.com/Regimarcilio/trilhajr-app/releases/download/v1.0.0/recrutadornow-android.apk"
fi

echo "✅ Download completo!"
echo ""

# Verificar se ADB está disponível
if command -v adb &> /dev/null; then
    echo "🔧 Conectando Android via ADB..."
    adb devices | grep -v "List" || echo "Nenhum dispositivo conectado"
    
    echo ""
    echo "📱 Para instalar no celular:"
    echo "   1. Conecte seu Android via USB"
    echo "   2. Ative 'Depuração USB' nas opções desenvolvedor"
    echo "   3. Execute: adb install recrutadornow.apk"
else
    echo "📱 Instalação manual necessária:"
    echo "   1. Copie recrutadornow.apk para seu celular"
    echo "   2. Abra o arquivo"
    echo "   3. Habilite 'Apps desconhecidos' nas opções"
    echo "   4. Toque em 'Instalar'"
fi

echo ""
echo "✅ ARQUIVO PRONTO: recrutadornow.apk"
echo "   Tamanho: $(du -h recrutadornow.apk | cut -f1)"
echo ""
echo "💡 Dica: Envie o arquivo para seu celular e instale!"
echo ""

# Limpar (comentado - descomente se quiser)
# rm recrutadornow.apk