# 🚀 CONFIGURAR DEPLOY AUTOMÁTICO NO RENDER

## Data: 12/11/2025

---

## ✅ CONFIGURAÇÃO REALIZADA

### Arquivo `render.yaml` Atualizado

- ✅ `autoDeploy: true` - Deploy automático habilitado
- ✅ `branch: main` - Branch principal configurada
- ✅ `repo` - Repositório configurado
- ✅ `healthCheckPath` - Health check configurado

---

## 📋 CONFIGURAÇÃO NO DASHBOARD DO RENDER

### Passo 1: Verificar Configuração do Serviço

1. Acesse o **Dashboard do Render**: https://dashboard.render.com
2. Vá no seu serviço backend
3. Clique em **Settings** (Configurações)

### Passo 2: Configurar Auto-Deploy

1. Role até **Build & Deploy**
2. Verifique se está configurado:
   - ✅ **Auto-Deploy**: `Yes` (Sim)
   - ✅ **Branch**: `main`
   - ✅ **Root Directory**: (deixe vazio ou `server` se necessário)

### Passo 3: Configurar Webhook (se necessário)

Se o Render não detectar automaticamente:

1. Vá em **Settings** → **Build & Deploy**
2. Role até **Webhook Service**
3. Copie a **Webhook URL** fornecida pelo Render
4. No GitHub:
   - Vá em **Settings** → **Webhooks**
   - Adicione a URL do Render
   - Selecione eventos: `push` e `pull_request`

### Passo 4: Configurar IPs Permitidos (Opcional)

Se você forneceu IPs para permitir acesso:

1. No Render, vá em **Settings** → **Security**
2. Adicione os IPs fornecidos:
   - `35.160.120.126`
   - `44.233.151.27`
   - `34.211.200.85`
   - `74.220.48.0/24`
   - `74.220.56.0/24`

---

## ✅ VERIFICAÇÃO

Após configurar:

1. Faça um commit no Git
2. O Render deve iniciar deploy automaticamente
3. Verifique em **Deploys** se o deploy iniciou automaticamente

---

## 🚨 SE NÃO FUNCIONAR

### Verificar Conexão GitHub

1. No Render, vá em **Settings** → **Connected Accounts**
2. Verifique se o GitHub está conectado
3. Se não estiver, conecte sua conta GitHub

### Verificar Permissões

1. No GitHub, verifique se o Render tem acesso ao repositório
2. Vá em **Settings** → **Integrations** → **Applications**
3. Verifique se o Render está autorizado

---

**Status**: ✅ **CONFIGURADO PARA DEPLOY AUTOMÁTICO**

**Próximo passo**: Verificar no Dashboard do Render se `autoDeploy` está habilitado

