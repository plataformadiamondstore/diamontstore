#!/bin/bash
# Script de build forçado para Netlify
# Este script força um rebuild completo sem cache

echo "🔥 FORÇANDO REBUILD COMPLETO SEM CACHE"
echo "======================================"

# Limpar cache do npm
echo "📦 Limpando cache do npm..."
npm cache clean --force

# Remover node_modules e reinstalar
echo "🗑️ Removendo node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Reinstalar dependências
echo "📥 Reinstalando dependências..."
npm install

# Limpar dist anterior
echo "🧹 Limpando build anterior..."
rm -rf dist

# Build forçado
echo "🔨 Fazendo build..."
npm run build

echo "✅ Build concluído!"

