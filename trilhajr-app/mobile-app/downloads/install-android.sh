#!/bin/bash
# ====================================================
# 🤖 INSTALAR NO ANDROID - RecrutadorNow v1.0.0
# ====================================================

echo "📱 RecrutadorNow - Instalação Android"
echo "====================================="
echo ""

# URL do APK
APK_URL="https://github.com/Regimarcilio/trilhajr-app/releases/download/v1.0.0/recrutadornow-android.apk"
APK_FILE="recrutadornow.apk"

echo "⏬ Baixando RecrutadorNow..."

# Baixar usando curl ou wget
if command -v curl &> /dev/null; then
    curl -L -o "$APK_FILE" "$APK_URL"
elif command -v wget &> /dev/null; then
    wget -O "$APK_FILE" "$APK_URL"
else
    echo "❌ Erro: curl ou wget necessário"
    echo "Instale: sudo apt install curl wget"
    exit 1
fi

echo ""
echo "✅ Download concluído: $APK_FILE"

# Opção de instalação via ADB
if command -v adb &> /dev/null; then
    echo ""
    echo "🔧 Instalação via ADB:"
    echo "   Execute: adb install $APK_FILE"
    echo "   (ou conecte o Android e pressione Enter)"
    read -t 5 -p "Pressione Enter para instalar..." || true
    
    if adb devices | grep -q "device$"; then
        adb install -r "$APK_FILE"
        echo "✅ Instalado com sucesso!"
    else
        echo "⚠️  Nenhum dispositivo ADB conectado"
    fi
else
    echo ""
    echo "📱 Instalação manual:"
    echo "   1. Acesse: $APK_URL no seu celular"
    echo "   2. Habilite 'Apps desconhecidos'"
    echo "   3. Abra e instale o arquivo"
fi

echo ""
echo "🎉 PRONTO! Abra o RecrutadorNow no seu celular"
echo ""
echo "📱 Teste grátis ou pague R$ 4,90"
echo "💳 Aceitamos Pix, Cartão e Boleto"
echo ""

# Limpar
rm -f "$APK_FILE" 2>/dev/null