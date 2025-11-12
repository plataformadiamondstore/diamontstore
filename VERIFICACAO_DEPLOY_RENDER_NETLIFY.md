# 🔍 Verificação Completa - Deploy Render e Netlify

## Data de Verificação
28 de Janeiro de 2025

## 📋 Objetivo
Verificar se todas as configurações estão corretas para deploy no Render (backend) e Netlify (frontend) com domínio personalizado já configurado no DNS.

---

## 🎯 DOMÍNIOS CONFIGURADOS

### Domínios Esperados
- **Frontend**: `https://slothempresas.com.br` (ou domínio configurado no Netlify)
- **Backend API**: `https://api.slothempresas.com.br` (ou domínio configurado no Render)

**⚠️ IMPORTANTE**: Substitua pelos seus domínios reais se diferentes.

---

## 🖥️ PARTE 1: RENDER (BACKEND)

### ✅ 1.1. Arquivo render.yaml

**Localização**: `render.yaml` (raiz do repositório)

**Status**: ✅ Configurado

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

**Verificações**:
- [x] Arquivo existe na raiz
- [x] Build command correto: `cd server && npm install`
- [x] Start command correto: `cd server && npm start`
- [x] Variáveis de ambiente definidas (sync: false = configurar manualmente)

### ✅ 1.2. Variáveis de Ambiente no Render

**Acesse**: Dashboard do Render → Seu Serviço → Environment

**Variáveis OBRIGATÓRIAS**:

| Variável | Valor | Obrigatória | Status |
|----------|-------|-------------|--------|
| `NODE_ENV` | `production` | ✅ Sim | ⚠️ Verificar |
| `PORT` | `10000` (ou deixar Render definir) | ✅ Sim | ⚠️ Verificar |
| `SUPABASE_URL` | `https://rslnzomohtvwvhymenjh.supabase.co` | ✅ Sim | ⚠️ Verificar |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Sim | ⚠️ Verificar |
| `JWT_SECRET` | Sua chave secreta JWT | ✅ Sim | ⚠️ Verificar |
| `DATABASE_URL` | `postgresql://postgres:...@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres` | ⚠️ Opcional (fallback) | ⚠️ Verificar |

**⚠️ AÇÃO NECESSÁRIA**: 
1. Acesse o dashboard do Render
2. Verifique se TODAS as variáveis acima estão configuradas
3. Se faltar alguma, adicione manualmente

### ✅ 1.3. Configuração do Servidor (server/index.js)

**Verificações**:

#### Porta
```javascript
const PORT = process.env.PORT || 3000;
```
- ✅ Usa `process.env.PORT` (Render define automaticamente)
- ✅ Fallback para 3000 se não definido

#### Variáveis Obrigatórias
```javascript
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias!');
  process.exit(1);
}
```
- ✅ Validação implementada
- ✅ Servidor não inicia sem essas variáveis

#### CORS
```javascript
app.use(cors({
  origin: true, // Permitir todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
```
- ✅ CORS configurado para permitir todas as origens
- ✅ Credentials habilitado
- ✅ Métodos HTTP permitidos corretos
- ✅ Headers permitidos corretos

#### Health Check
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
```
- ✅ Endpoint `/api/health` implementado
- ✅ Retorna JSON com status

#### DATABASE_URL (Fallback)
```javascript
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
```
- ✅ Usa `process.env.DATABASE_URL` se disponível
- ✅ Fallback para connection string hardcoded (não ideal, mas funcional)

**⚠️ RECOMENDAÇÃO**: Adicionar `DATABASE_URL` como variável de ambiente no Render para melhor segurança.

### ✅ 1.4. Package.json do Servidor

**Localização**: `server/package.json`

**Verificações**:
- [x] Script `start` definido: `"start": "node index.js"`
- [x] Dependências corretas instaladas
- [x] Type: `"module"` (ES modules)

### ✅ 1.5. Domínio Personalizado no Render

**Ações Necessárias**:
1. Acesse o dashboard do Render
2. Vá em **Settings** → **Custom Domains**
3. Adicione seu domínio: `api.slothempresas.com.br` (ou seu domínio)
4. Configure o DNS conforme instruções do Render:
   - Tipo: `CNAME`
   - Nome: `api` (ou subdomínio desejado)
   - Valor: `seu-servico.onrender.com`

**⚠️ VERIFICAR**: Se o DNS já está configurado, verifique se está apontando corretamente.

---

## 🌐 PARTE 2: NETLIFY (FRONTEND)

### ✅ 2.1. Arquivo netlify.toml

**Localização**: `netlify.toml` (raiz do repositório) e `client/netlify.toml`

**Status**: ✅ Configurado (dois arquivos)

#### netlify.toml (Raiz)
```toml
[build]
  base = "client"
  command = "npm cache clean --force && rm -rf node_modules dist .vite && npm install && npm run build"
  publish = "client/dist"

[build.environment]
  NODE_VERSION = "18"
  CI = "true"
  FORCE_REBUILD = "true"
  NPM_FLAGS = "--no-cache"
```

#### client/netlify.toml
```toml
[build]
  base = "client"
  command = "chmod +x build.sh && ./build.sh"
  publish = "dist"
```

**⚠️ ATENÇÃO**: Há dois arquivos `netlify.toml`. O Netlify usa o da raiz por padrão.

**Verificações**:
- [x] Base directory: `client`
- [x] Build command configurado
- [x] Publish directory: `client/dist`
- [x] Node version: 18
- [x] Headers de cache configurados
- [x] Redirects configurados para SPA

### ✅ 2.2. Variáveis de Ambiente no Netlify

**Acesse**: Dashboard do Netlify → Seu Site → Site settings → Environment variables

**Variável OBRIGATÓRIA**:

| Variável | Valor | Obrigatória | Status |
|----------|-------|-------------|--------|
| `VITE_API_URL` | `https://api.slothempresas.com.br` | ✅ Sim | ⚠️ Verificar |

**⚠️ AÇÃO NECESSÁRIA**: 
1. Acesse o dashboard do Netlify
2. Vá em **Site settings** → **Environment variables**
3. Adicione/verifique:
   - Key: `VITE_API_URL`
   - Value: `https://api.slothempresas.com.br` (ou seu domínio de API)
   - **NÃO** incluir `/api` no final (o código adiciona automaticamente)

### ✅ 2.3. Configuração da API (client/src/services/api.js)

**Verificações**:

#### Detecção de Produção
```javascript
const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && 
                         hostname !== '127.0.0.1' && 
                         !hostname.includes('localhost');
    
    if (isProduction) {
      // Força api.slothempresas.com.br em produção
      const apiUrl = 'https://api.slothempresas.com.br/api';
      return apiUrl;
    }
  }
  
  // Desenvolvimento local
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  return '/api';
};
```

**Status**:
- ✅ Detecta produção automaticamente
- ✅ Força URL correta em produção (`api.slothempresas.com.br`)
- ✅ Usa `VITE_API_URL` se configurada
- ✅ Fallback para `/api` em desenvolvimento

**⚠️ IMPORTANTE**: O código força `api.slothempresas.com.br` em produção. Se seu domínio for diferente, atualize o código.

### ✅ 2.4. Package.json do Cliente

**Localização**: `client/package.json`

**Verificações**:
- [x] Script `build` definido: `"build": "vite build"`
- [x] Dependências corretas
- [x] Type: `"module"`

### ✅ 2.5. Vite Config (client/vite.config.js)

**Verificações**:
- [x] Build configurado com hash para cache-busting
- [x] Minificação habilitada
- [x] Sourcemaps desabilitados (produção)

### ✅ 2.6. Domínio Personalizado no Netlify

**Ações Necessárias**:
1. Acesse o dashboard do Netlify
2. Vá em **Site settings** → **Domain management**
3. Adicione seu domínio: `slothempresas.com.br` (ou seu domínio)
4. Configure o DNS conforme instruções do Netlify:
   - Tipo: `A` ou `CNAME`
   - Siga as instruções específicas do Netlify

**⚠️ VERIFICAR**: Se o DNS já está configurado, verifique se está apontando corretamente.

---

## 🔗 PARTE 3: CONFIGURAÇÃO DE DNS

### ✅ 3.1. Registros DNS Necessários

**Para o Backend (Render)**:
```
Tipo: CNAME
Nome: api (ou subdomínio desejado)
Valor: seu-servico.onrender.com
TTL: 3600 (ou padrão)
```

**Para o Frontend (Netlify)**:
```
Tipo: A ou CNAME (conforme instruções do Netlify)
Nome: @ (raiz) ou www
Valor: IP do Netlify ou CNAME fornecido
TTL: 3600 (ou padrão)
```

**⚠️ VERIFICAR**: 
1. Acesse seu provedor de DNS
2. Verifique se os registros acima estão configurados
3. Aguarde propagação (pode levar até 48 horas, geralmente menos)

### ✅ 3.2. Verificação de DNS

**Comandos para verificar**:

```bash
# Verificar DNS do backend
nslookup api.slothempresas.com.br

# Verificar DNS do frontend
nslookup slothempresas.com.br

# Verificar com dig (Linux/Mac)
dig api.slothempresas.com.br
dig slothempresas.com.br
```

**Resultado Esperado**:
- Backend deve apontar para um endereço do Render
- Frontend deve apontar para um endereço do Netlify

---

## 🧪 PARTE 4: TESTES DE VERIFICAÇÃO

### ✅ 4.1. Teste do Backend (Render)

#### Health Check
```bash
curl https://api.slothempresas.com.br/api/health
```

**Resposta Esperada**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### Rota Raiz
```bash
curl https://api.slothempresas.com.br/
```

**Resposta Esperada**:
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

**Checklist**:
- [ ] Health check responde corretamente
- [ ] Rota raiz retorna informações da API
- [ ] SSL/HTTPS funcionando (certificado válido)
- [ ] Sem erros de CORS

### ✅ 4.2. Teste do Frontend (Netlify)

#### Acessar Site
```
https://slothempresas.com.br
```

**Verificações**:
- [ ] Site carrega corretamente
- [ ] SSL/HTTPS funcionando (certificado válido)
- [ ] Console do navegador sem erros críticos
- [ ] API sendo chamada corretamente (verificar Network tab)

#### Verificar Console do Navegador
Abra o DevTools (F12) e verifique:
- [ ] Sem erros de CORS
- [ ] API URL correta sendo usada (`api.slothempresas.com.br`)
- [ ] Sem erros 404 ou 500

#### Verificar Network Tab
1. Abra DevTools → Network
2. Recarregue a página
3. Verifique requisições para a API:
   - [ ] Requisições para `api.slothempresas.com.br`
   - [ ] Status 200 ou 401 (não 404 ou 500)
   - [ ] Sem erros de CORS

### ✅ 4.3. Teste de Login

**Fluxo de Teste**:
1. Acesse `https://slothempresas.com.br`
2. Tente fazer login
3. Verifique:
   - [ ] Requisição enviada para `api.slothempresas.com.br/api/auth/employee`
   - [ ] Resposta recebida (sucesso ou erro de credenciais)
   - [ ] Sem erros de CORS
   - [ ] Redirecionamento funciona após login

---

## 📝 PARTE 5: CHECKLIST FINAL

### Backend (Render)
- [ ] Serviço criado no Render
- [ ] `render.yaml` na raiz do repositório
- [ ] Todas as variáveis de ambiente configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (ou deixar Render definir)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `DATABASE_URL` (recomendado)
- [ ] Build command: `cd server && npm install`
- [ ] Start command: `cd server && npm start`
- [ ] Health check funcionando: `https://api.slothempresas.com.br/api/health`
- [ ] Domínio personalizado configurado no Render
- [ ] DNS apontando corretamente para o Render
- [ ] SSL/HTTPS funcionando

### Frontend (Netlify)
- [ ] Site criado no Netlify
- [ ] `netlify.toml` na raiz (ou `client/netlify.toml`)
- [ ] Variável de ambiente configurada:
  - [ ] `VITE_API_URL=https://api.slothempresas.com.br`
- [ ] Build command configurado
- [ ] Publish directory: `client/dist`
- [ ] Site carregando corretamente
- [ ] Domínio personalizado configurado no Netlify
- [ ] DNS apontando corretamente para o Netlify
- [ ] SSL/HTTPS funcionando
- [ ] API sendo chamada corretamente (sem erros de CORS)

### Geral
- [ ] Código no GitHub no branch `master`
- [ ] Deploy automático configurado (ou manual)
- [ ] Logs sem erros críticos
- [ ] Testes de funcionalidade básica passando

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### 1. Erro: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa**: CORS não configurado corretamente no backend.

**Solução**: 
- Verificar se `cors` está habilitado no `server/index.js`
- Verificar se `origin: true` está configurado
- Verificar logs do Render para erros

### 2. Erro: "Failed to fetch" ou "Network Error"

**Causa**: URL da API incorreta ou backend não acessível.

**Solução**:
- Verificar `VITE_API_URL` no Netlify
- Verificar se o backend está rodando no Render
- Verificar DNS do domínio da API
- Verificar console do navegador para URL exata sendo usada

### 3. Erro: "404 Not Found" nas requisições da API

**Causa**: URL da API incorreta ou rota não existe.

**Solução**:
- Verificar se a URL inclui `/api` no final
- Verificar se as rotas estão corretas no backend
- Verificar logs do Render

### 4. Backend "dormindo" no Render (plano gratuito)

**Causa**: Render "dorme" serviços gratuitos após inatividade.

**Solução**:
- Primeiro request pode demorar ~30 segundos
- Considerar upgrade para plano pago
- Configurar health check periódico externo

### 5. Build falha no Netlify

**Causa**: Erro no build ou dependências faltando.

**Solução**:
- Verificar logs de build no Netlify
- Verificar se `package.json` está correto
- Verificar se todas as dependências estão instaladas
- Verificar Node version (deve ser 18)

### 6. Variáveis de ambiente não funcionam

**Causa**: Variáveis não configuradas ou nome incorreto.

**Solução**:
- Verificar se variáveis estão configuradas no dashboard
- Verificar se nomes estão exatamente corretos (case-sensitive)
- Fazer novo deploy após adicionar variáveis

---

## 🔄 PRÓXIMOS PASSOS APÓS VERIFICAÇÃO

1. **Se tudo estiver OK**:
   - Fazer deploy de teste
   - Testar funcionalidades principais
   - Monitorar logs por alguns dias

2. **Se houver problemas**:
   - Corrigir conforme seções acima
   - Fazer novo deploy
   - Testar novamente

3. **Otimizações futuras**:
   - Configurar health check periódico
   - Configurar monitoramento de erros
   - Configurar backup automático do banco

---

## 📚 RECURSOS ÚTEIS

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **Documentação Render**: https://render.com/docs
- **Documentação Netlify**: https://docs.netlify.com
- **Verificar DNS**: https://dnschecker.org

---

## 📝 NOTAS FINAIS

- Este documento deve ser atualizado sempre que houver mudanças nas configurações
- Verificar este checklist antes de cada deploy importante
- Manter backups das configurações de variáveis de ambiente

---

**Última Atualização**: 28 de Janeiro de 2025
**Versão**: 1.0
**Status**: ⚠️ Aguardando verificação manual das configurações

