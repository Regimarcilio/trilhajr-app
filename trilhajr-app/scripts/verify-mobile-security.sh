#!/bin/bash
# Script de verificação de segurança do mobile app
# Uso: ./scripts/verify-mobile-security.sh

set -e

echo "🔍 Verificando segurança do mobile app..."

# Verificar se keystore está no lugar certo
if [ -f "keystore.jks" ]; then
    echo "❌ ERRO: keystore.jks encontrado na raiz do projeto!"
    echo "   Mova para .secrets/ ou remova se não for necessário"
    exit 1
fi

# Verificar se .secrets existe
if [ ! -d ".secrets" ]; then
    echo "⚠️  Diretório .secrets não encontrado"
    echo "   Criando..."
    mkdir -p .secrets
fi

# Verificar se keystore está em .secrets
KESTORE_COUNT=$(find .secrets -name "*.jks" 2>/dev/null | wc -l)
if [ "$KESTORE_COUNT" -gt 0 ]; then
    echo "✅ Keystore encontrado em .secrets/"
else
    echo "⚠️  Nenhum keystore encontrado - app pode precisar de build sem assinatura"
fi

# Verificar se .env está sendo versionado
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "❌ ERRO: .env está sendo versionado!"
    echo "   Adicione .env ao .gitignore se não estiver lá"
    exit 1
else
    echo "✅ .env não está versionado"
fi

# Verificar variáveis de ambiente no app.json
echo "🔍 Verificando app.json..."
if grep -q "EXPO_PUBLIC_PAGSEGURO_TOKEN" app.json && ! grep -q "EXPO_PUBLIC_PAGSEGURO_TOKEN.*\"\"" app.json; then
    echo "⚠️  Aviso: EXPO_PUBLIC_PAGSEGURO_TOKEN pode estar com valor real em app.json"
fi

echo ""
echo "✅ Verificação de segurança concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure .env com valores reais (não teste em produção)"
echo "   2. Para build de produção, use EAS com secrets via dashboard"
echo "   3. Nunca commit valores reais de credenciais"