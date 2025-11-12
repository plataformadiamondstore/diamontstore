#!/bin/bash
# Script de build explícito para Netlify
# Força rebuild completo sem cache

set -e  # Parar em caso de erro

echo "=========================================="
echo "🔥 INICIANDO BUILD FORÇADO - SEM CACHE"
echo "=========================================="

echo "📦 Limpando cache do npm..."
npm cache clean --force

echo "🗑️ Removendo node_modules e dist..."
rm -rf node_modules
rm -rf dist
rm -rf .vite

echo "📥 Reinstalando dependências..."
npm install --no-cache

echo "🔨 Fazendo build com versão única..."
export VITE_BUILD_VERSION=$(date +%s)
npm run build

echo "✅ Build concluído!"
echo "📁 Verificando arquivos gerados..."
ls -la dist/

echo "=========================================="

