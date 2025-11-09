# 🚀 GUIA COMPLETO: CONFIGURAR BACKEND NO RENDER

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de que:
- ✅ Seu código está no GitHub no repositório `slothempresas/slothempresas`
- ✅ O branch principal é `master`
- ✅ Você tem acesso ao Render (https://dashboard.render.com)
- ✅ Você tem as credenciais do Supabase (SUPABASE_URL e SUPABASE_SERVICE_KEY)

## 🔧 PASSO 1: CONFIGURAR O REPOSITÓRIO NO RENDER

### 1.1. Criar Novo Serviço Web

1. Acesse https://dashboard.render.com
2. Clique em **"+ Novo"** (canto superior direito)
3. Selecione **"Implantar um serviço web"** (Web Service)
4. Na tela de configuração:
   - **Nome**: `sloth-empresas-backend` (ou outro nome de sua preferência)
   - **Região**: Escolha a mais próxima (ex: `Oregon` para EUA)
   - **Branch**: `master`
   - **Root Directory**: Deixe vazio (o Render vai usar a raiz)
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Escolha o plano (Starter é suficiente para começar)

### 1.2. Conectar ao GitHub

1. Se ainda não conectou seu GitHub ao Render:
   - Clique em **"Conectar conta"** ou **"Connect GitHub"**
   - Autorize o Render a acessar seus repositórios
   - Selecione o repositório: `slothempresas/slothempresas`

2. Se já conectou:
   - Selecione o repositório na lista
   - Confirme que o branch é `master`

## 🔐 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 2.1. Acessar Configurações de Ambiente

1. No dashboard do serviço criado, vá em **"Environment"** (Ambiente)
2. Clique em **"Add Environment Variable"** (Adicionar Variável de Ambiente)

### 2.2. Adicionar Variáveis Obrigatórias

Adicione as seguintes variáveis (uma por vez):

#### 1. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Sync**: Não precisa sincronizar

#### 2. PORT
- **Key**: `PORT`
- **Value**: `10000` (o Render define automaticamente, mas você pode usar 10000 como padrão)
- **Sync**: Não precisa sincronizar
- **Nota**: O Render define a porta automaticamente via `process.env.PORT`, mas o código já está preparado para isso

#### 3. SUPABASE_URL
- **Key**: `SUPABASE_URL`
- **Value**: Cole a URL do seu Supabase (ex: `https://rslnzomohtvwvhymenjh.supabase.co`)
- **Sync**: ❌ **NÃO sincronizar** (é uma informação sensível)

#### 4. SUPABASE_SERVICE_KEY
- **Key**: `SUPABASE_SERVICE_KEY`
- **Value**: Cole a Service Key do Supabase (começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **Sync**: ❌ **NUNCA sincronizar** (é uma chave secreta)

#### 5. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Cole o JWT_SECRET que você usa localmente (ex: `sloth_empresas_secret_key_2025_secure_random_string`)
- **Sync**: ❌ **NÃO sincronizar** (é uma informação sensível)

### 2.3. Verificar Variáveis

Após adicionar todas, você deve ter:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://rslnzomohtvwvhymenjh.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=sloth_empresas_secret_key_2025_secure_random_string
```

## 🚀 PASSO 3: IMPLANTAR O SERVIÇO

### 3.1. Deploy Manual

1. Após configurar tudo, clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o build e deploy (pode levar alguns minutos)
3. Acompanhe os logs em tempo real

### 3.2. Deploy Automático (Recomendado)

O Render faz deploy automático sempre que você faz push para o branch `master`:
1. Faça push do seu código: `git push origin master`
2. O Render detecta automaticamente
3. Inicia o build e deploy automaticamente

## ✅ PASSO 4: VERIFICAR SE ESTÁ FUNCIONANDO

### 4.1. Verificar Health Check

Após o deploy, acesse:
```
https://seu-servico.onrender.com/api/health
```

Você deve receber:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 4.2. Verificar Rota Raiz

Acesse:
```
https://seu-servico.onrender.com/
```

Você deve receber informações sobre a API:
```json
{
  "message": "Sloth Empresas API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "products": "/api/products",
    "cart": "/api/cart",
    "orders": "/api/orders",
    "admin": "/api/admin"
  }
}
```

### 4.3. Verificar Logs

1. No dashboard do Render, vá em **"Logs"**
2. Verifique se há erros
3. Os logs devem mostrar: `✅ Server running on port 10000`

## 🔍 PASSO 5: CONFIGURAR DOMÍNIO PERSONALIZADO (OPCIONAL)

1. No dashboard do serviço, vá em **"Settings"**
2. Role até **"Custom Domains"**
3. Adicione seu domínio personalizado (se tiver)
4. Configure o DNS conforme as instruções do Render

## 📝 ESTRUTURA DO ARQUIVO render.yaml

O arquivo `render.yaml` na raiz do projeto já está configurado com:

```yaml
services:
  - type: web
    name: sloth-empresas-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

**Nota**: As variáveis marcadas com `sync: false` precisam ser configuradas manualmente no dashboard do Render.

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### 1. Erro: "Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias"

**Solução**: 
- Verifique se adicionou todas as variáveis de ambiente no dashboard do Render
- Certifique-se de que os nomes estão exatamente como: `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`
- Faça um novo deploy após adicionar as variáveis

### 2. Erro: "Cannot find module"

**Solução**:
- Verifique se o `buildCommand` está correto: `cd server && npm install`
- Verifique se o `package.json` está em `server/package.json`
- Verifique os logs do build no Render

### 3. Serviço não inicia

**Solução**:
- Verifique os logs no dashboard do Render
- Certifique-se de que o `startCommand` está correto: `cd server && npm start`
- Verifique se a porta está sendo lida corretamente (o Render define `process.env.PORT` automaticamente)

### 4. CORS errors no frontend

**Solução**:
- O backend já está configurado para permitir todas as origens
- Certifique-se de atualizar a URL da API no frontend para apontar para o Render
- Exemplo: `https://seu-servico.onrender.com/api`

### 5. Timeout no primeiro request

**Solução**:
- O Render "dorme" serviços gratuitos após inatividade
- O primeiro request após dormir pode demorar ~30 segundos
- Considere usar um plano pago para evitar isso, ou configure um "health check" periódico

## 🔄 ATUALIZAR O SERVIÇO

Sempre que fizer alterações no código:

1. Faça commit das alterações:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   git push origin master
   ```

2. O Render detecta automaticamente e faz o deploy

3. Ou faça deploy manual no dashboard do Render

## 📚 RECURSOS ÚTEIS

- **Documentação do Render**: https://render.com/docs
- **Dashboard**: https://dashboard.render.com
- **Logs em tempo real**: Disponível no dashboard do serviço
- **Métricas**: Disponível no dashboard do serviço

## 🔐 SEGURANÇA

⚠️ **IMPORTANTE**: 
- Nunca commite arquivos `.env` no Git
- Nunca compartilhe suas chaves do Supabase
- Use variáveis de ambiente no Render para informações sensíveis
- Revise o `.gitignore` para garantir que arquivos sensíveis não sejam commitados

## 📝 CHECKLIST FINAL

Antes de considerar o deploy completo:

- [ ] Código está no GitHub no branch `master`
- [ ] Arquivo `render.yaml` está na raiz do repositório
- [ ] Serviço criado no Render
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build Command: `cd server && npm install`
- [ ] Start Command: `cd server && npm start`
- [ ] Health check funcionando: `/api/health`
- [ ] Rota raiz funcionando: `/`
- [ ] Logs sem erros críticos
- [ ] Frontend atualizado com a URL do Render (se aplicável)

---

**Última atualização**: 2025-01-XX  
**Projeto**: Sloth Empresas  
**Backend**: Node.js/Express  
**Deploy**: Render.com

