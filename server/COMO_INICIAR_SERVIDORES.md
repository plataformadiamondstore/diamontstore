# 🚀 GUIA COMPLETO: COMO INICIAR OS SERVIDORES

## 📋 ESTRUTURA DO PROJETO (Atualizado em 09/11/2025)

- **Repositório Git**: `C:\server\` (raiz do projeto)
- **Backend**: `C:\server\server\` (Node.js/Express)
- **Frontend**: `C:\server\client\` (React/Vite)

**⚠️ IMPORTANTE**: Após reorganização do repositório, os caminhos mudaram:
- Backend agora está em `C:\server\server\` (não mais em `C:\server\`)
- Frontend agora está em `C:\server\client\` (não mais em `C:\client\`)

## ✅ PRÉ-REQUISITOS

### 1. Arquivo `.env` no Backend

O arquivo `.env` deve existir em `C:\server\server\.env` com as seguintes variáveis:

```env
PORT=3000
SUPABASE_URL=https://rslnzomohtvwvhymenjh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=sloth_empresas_secret_key_2025_secure_random_string
```

**⚠️ IMPORTANTE**: Sem este arquivo, o servidor não iniciará e mostrará erro sobre variáveis de ambiente obrigatórias.

### 2. Dependências Instaladas

Certifique-se de que as dependências estão instaladas:

**Backend:**
```bash
cd C:\server\server
npm install
```

**Frontend:**
```bash
cd C:\server\client
npm install
```

## 🔧 CONFIGURAÇÕES DE HOT RELOAD

### Backend - Nodemon

Arquivo `nodemon.json` criado em `C:\server\server\nodemon.json`:

```json
{
  "watch": ["routes", "index.js", "*.js"],
  "ext": "js,json",
  "ignore": ["node_modules", "uploads", "*.test.js"],
  "exec": "node index.js",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": 1000
}
```

**Funcionalidade**: Monitora mudanças em arquivos `.js` e reinicia automaticamente o servidor.

### Frontend - Vite HMR

Arquivo `vite.config.js` em `C:\server\client\vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**Funcionalidade**: Hot Module Replacement (HMR) habilitado para atualização em tempo real sem recarregar a página.

## 🚀 COMO INICIAR OS SERVIDORES

### Método 1: PowerShell (Recomendado)

**Terminal 1 - Backend:**
```powershell
cd C:\server\server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\server\client
npm install
npm run dev
```

### Método 2: Janelas Minimizadas (Automático)

**Backend:**
```powershell
cd C:\server\server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\server\server; npm run dev" -WindowStyle Minimized
```

**Frontend:**
```powershell
cd C:\server\client
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\server\client; npm run dev" -WindowStyle Minimized
```

### Método 3: Abrir Navegador Automaticamente

Após iniciar os servidores, aguarde alguns segundos e execute:

```powershell
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
```

## 📍 URLS DOS SERVIDORES

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 🔍 VERIFICAÇÃO

### Verificar se os servidores estão rodando:

**Backend:**
```powershell
try { 
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3
  Write-Host "✅ Backend rodando: Status $($response.StatusCode)"
} catch { 
  Write-Host "❌ Backend não está respondendo"
}
```

**Frontend:**
```powershell
try { 
  $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
  Write-Host "✅ Frontend rodando: Status $($response.StatusCode)"
} catch { 
  Write-Host "❌ Frontend não está respondendo"
}
```

### Verificar processos Node rodando:

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, Id, StartTime | Format-Table
```

### Verificar portas em uso:

```powershell
Get-NetTCPConnection -LocalPort 3000,5173 -ErrorAction SilentlyContinue | Select-Object LocalPort, State, OwningProcess | Format-Table
```

## 🛑 PARAR OS SERVIDORES

### Parar todos os processos Node:

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### Parar servidor específico:

1. Identifique o PID do processo:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

2. Pare o processo específico:
```powershell
Stop-Process -Id <PID> -Force
```

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### 1. Erro: "Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias"

**Solução**: Verifique se o arquivo `.env` existe em `C:\server\server\.env` e contém as variáveis necessárias.

### 2. Porta já em uso

**Solução**: 
- Pare os processos Node rodando: `Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force`
- Ou altere a porta no arquivo `.env` (PORT=3001) ou `vite.config.js` (port: 5174)

### 3. Servidor não atualiza após mudanças

**Solução**: 
- Verifique se o `nodemon.json` está configurado corretamente
- Verifique se está usando `npm run dev` e não `npm start`
- Reinicie o servidor

### 4. CORS errors no frontend

**Solução**: O backend já está configurado para permitir todas as origens. Verifique se o backend está rodando na porta 3000.

## 📝 SCRIPTS DISPONÍVEIS

### Backend (`package.json`):
- `npm run dev` - Inicia com nodemon (hot reload)
- `npm start` - Inicia sem hot reload
- `npm run create-tables` - Cria tabelas no Supabase

### Frontend (`package.json`):
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## 🔄 ATUALIZAÇÕES REALIZADAS

### Data: 09/11/2025

1. ✅ Criado arquivo `nodemon.json` para hot reload do backend
2. ✅ Atualizado `vite.config.js` com configurações de HMR explícitas
3. ✅ Verificado e confirmado arquivo `.env` existente
4. ✅ Implementado funcionalidade de expandir/colapsar produtos no painel de gestor
5. ✅ Configurado hot reload para ambos os servidores

## 📚 ARQUIVOS IMPORTANTES

- `C:\server\server\.env` - Variáveis de ambiente (NÃO COMMITAR)
- `C:\server\server\nodemon.json` - Configuração do nodemon
- `C:\server\client\vite.config.js` - Configuração do Vite
- `C:\server\server\package.json` - Scripts e dependências do backend
- `C:\server\client\package.json` - Scripts e dependências do frontend

## 🔄 ATUALIZAÇÕES DE ESTRUTURA

### Data: 09/11/2025 - Reorganização do Repositório

**Mudanças importantes:**
- ✅ Repositório reorganizado com subpastas `server/` e `client/`
- ✅ Backend movido de `C:\server\` para `C:\server\server\`
- ✅ Frontend movido de `C:\client\` para `C:\server\client\`
- ✅ Todos os caminhos de comandos atualizados neste documento

**Comandos atualizados:**
```powershell
# Backend
cd C:\server\server
npm install
npm run dev

# Frontend
cd C:\server\client
npm install
npm run dev
```

---

**Última atualização**: 09/11/2025  
**Reorganização**: 09/11/2025 - Estrutura com subpastas


