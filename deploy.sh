#!/bin/bash

# Script de deploy para a Vercel (Monorepo)
# Certifique-se de ter o Vercel CLI instalado: npm i -g vercel

echo "🚀 Iniciando deploy do projeto O Templo para a Vercel..."

# 1. Deploy do Frontend (React + Vite)
echo "----------------------------------------"
echo "📦 Fazendo deploy do Frontend..."
cd frontend
vercel --prod
cd ..

# 2. Deploy do Backend (Next.js + Prisma)
echo "----------------------------------------"
echo "⚙️ Fazendo deploy do Backend..."
cd backend
# Gera os artefatos do Prisma antes do deploy para garantir que a build funcione
npx prisma generate
vercel --prod
cd ..

echo "----------------------------------------"
echo "✅ Deploy concluído com sucesso!"
echo "Lembre-se: no painel da Vercel, você deve ter dois projetos criados."
echo "Um apontando para a pasta 'frontend' e outro para a pasta 'backend'."
