# 🧪 GUIA DE TESTES - DEPLOY PRODUÇÃO

## ✅ URLs Configuradas

- **Backend (Render)**: `https://api.slothempresas.com.br`
- **Backend Alternativo**: `https://slothempresas.onrender.com`
- **Frontend (Netlify)**: `https://slothempresas.netlify.app` (ou seu domínio personalizado)

---

## 🔍 TESTE 1: Verificar Backend

### 1.1. Health Check
Acesse no navegador:
```
https://api.slothempresas.com.br/api/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 1.2. Rota Raiz
Acesse:
```
https://api.slothempresas.com.br/
```

**Resultado esperado:**
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

---

## 🌐 TESTE 2: Verificar Frontend

### 2.1. Acessar o Site
Acesse seu site no Netlify (URL que aparece no dashboard do Netlify)

**Resultado esperado:**
- Site carrega sem erros
- Página de login aparece

### 2.2. Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Verifique se há erros relacionados à API

**Resultado esperado:**
- Sem erros de CORS
- Sem erros de conexão com a API

### 2.3. Verificar Network Tab
1. No DevTools, vá na aba **Network**
2. Recarregue a página
3. Verifique as requisições

**Resultado esperado:**
- Requisições para `https://api.slothempresas.com.br/api/...`
- Status 200 ou 401 (se não estiver logado)

---

## 🔐 TESTE 3: Testar Login

### 3.1. Tentar Fazer Login
1. Acesse o site do frontend
2. Preencha os campos de login (empresa_numero e clube_numero)
3. Clique em entrar

**Resultado esperado:**
- Login funciona
- Redireciona para a página de produtos
- Ou mostra erro se credenciais inválidas

### 3.2. Verificar Requisição de Login
1. No DevTools → Network
2. Filtre por "auth" ou "employee"
3. Veja a requisição POST para `/api/auth/employee`

**Resultado esperado:**
- Requisição vai para `https://api.slothempresas.com.br/api/auth/employee`
- Status 200 (sucesso) ou 401 (erro)

---

## 📦 TESTE 4: Testar Produtos

### 4.1. Listar Produtos
1. Após fazer login, acesse a página de produtos
2. Verifique se os produtos aparecem

**Resultado esperado:**
- Produtos são carregados
- Imagens aparecem corretamente

### 4.2. Verificar Requisição de Produtos
1. No DevTools → Network
2. Filtre por "products"
3. Veja a requisição GET para `/api/products`

**Resultado esperado:**
- Requisição vai para `https://api.slothempresas.com.br/api/products`
- Status 200
- Retorna lista de produtos

---

## 🛒 TESTE 5: Testar Carrinho

### 5.1. Adicionar ao Carrinho
1. Adicione um produto ao carrinho
2. Verifique se aparece no carrinho

**Resultado esperado:**
- Produto é adicionado
- Carrinho atualiza

### 5.2. Verificar Requisições do Carrinho
1. No DevTools → Network
2. Filtre por "cart"
3. Veja as requisições

**Resultado esperado:**
- Requisições vão para `https://api.slothempresas.com.br/api/cart/...`
- Status 200 ou 201

---

## ⚠️ PROBLEMAS COMUNS

### Erro: CORS
**Sintoma**: Erro no console sobre CORS
**Solução**: Verificar se o backend está permitindo a origem do frontend

### Erro: 404 Not Found
**Sintoma**: Requisições retornam 404
**Solução**: Verificar se a URL da API está correta no Netlify (VITE_API_URL)

### Erro: Network Error
**Sintoma**: "Sem resposta do servidor"
**Solução**: 
- Verificar se o backend está rodando no Render
- Verificar se o domínio está correto
- Verificar logs do Render

### Erro: SSL Certificate
**Sintoma**: Erro de certificado SSL
**Solução**: Aguardar alguns minutos para o certificado ser emitido

---

## 📝 CHECKLIST FINAL

- [ ] Backend responde em `https://api.slothempresas.com.br/api/health`
- [ ] Frontend carrega sem erros
- [ ] Console do navegador sem erros críticos
- [ ] Login funciona
- [ ] Produtos são carregados
- [ ] Carrinho funciona
- [ ] Requisições vão para o domínio correto (`api.slothempresas.com.br`)

---

**Última atualização**: 2025-01-XX
**Status**: ✅ Deploy completo e funcionando

