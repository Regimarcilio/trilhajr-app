#!/bin/bash
# Script de inicialização seguro do TrilhaJr Backend API
# Uso: ./scripts/init-backend.sh [dev|production]

set -e

ENVIRONMENT=${1:-dev}
echo "🚀 Inicializando TrilhaJr Backend API em modo: $ENVIRONMENT"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copie .env.example para .env e preencha os valores:"
    echo "   cp .env.example .env"
    exit 1
fi

# Carregar variáveis de ambiente
export $(cat .env | grep -v '^#' | xargs)

# Validar variáveis críticas
echo "🔍 Validando variáveis de ambiente..."

REQUIRED_VARS=("JWT_SECRET" "PAGSEGURO_EMAIL" "PAGSEGURO_TOKEN")
MISSING=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING+=("$var")
        echo "  ❌ $var: não configurado"
    else
        echo "  ✅ $var: configurado"
    fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
    echo ""
    echo "❌ Erro: Variáveis obrigatórias não configuradas: ${MISSING[*]}"
    echo "Por favor, configure no arquivo .env antes de continuar"
    exit 1
fi

# Validar que não é usado placeholder
for var in "${REQUIRED_VARS[@]}"; do
    value="${!var}"
    if [[ "$value" == *"placeholder"* ]] || [[ "$value" == *"seu-"* ]]; then
        echo ""
        echo "❌ Erro: $var contém valor placeholder ($value)"
        echo "Por favor, use valores reais no .env"
        exit 1
    fi
done

echo "✅ Todas as variáveis validadas com sucesso"

# Para ambiente de produção, fazer checks adicionais
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🛡️  Verificações de segurança para produção:"
    
    if [ "$PAGSEGURO_MODE" != "production" ]; then
        echo "  ⚠️  Aviso: PAGSEGURO_MODE não está em 'production'"
    fi
    
    if [ "$NODE_ENV" != "production" ]; then
        echo "  ⚠️  Aviso: NODE_ENV não está em 'production'"
    fi
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependências..."
    npm install
fi

# Build
echo ""
echo "🔨 Compilando TypeScript..."
npm run build

echo ""
echo "✅ Inicialização concluída com sucesso!"
echo "Para iniciar o servidor: npm start"