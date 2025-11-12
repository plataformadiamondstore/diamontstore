# 🚀 INSTRUÇÕES: Deploy Manual no Render

## Data: 12/11/2025

---

## ⚠️ PROBLEMA

O Render ainda está usando código antigo que tenta conectar na porta 5432 (PostgreSQL direto), mesmo após múltiplos deploys.

**Erro nos logs**:
```
Erro ao salvar link do YouTube: Error: connect ENETUNREACH 2600:1f16:1cd0:3322:3b18:cdbc:603a:b53d:5432
```

---

## ✅ SOLUÇÃO: DEPLOY MANUAL NO RENDER

### Passo 1: Limpar Cache do Build

1. Acesse o **Dashboard do Render**: https://dashboard.render.com
2. Vá no seu serviço backend
3. Clique em **Settings** (Configurações)
4. Role até **Build & Deploy**
5. Clique em **Clear build cache** (Limpar cache de build)
6. Confirme a ação

### Passo 2: Fazer Deploy Manual

1. No mesmo painel, vá em **Manual Deploy**
2. Selecione **Deploy latest commit** (Deploy do último commit)
3. Ou selecione o commit específico: `e06bbdb`
4. Clique em **Deploy**

### Passo 3: Verificar Variáveis de Ambiente

1. Vá em **Environment** (Variáveis de Ambiente)
2. Verifique se estão configuradas:
   - ✅ `SUPABASE_URL` = `https://rslnzomohtvwvhymenjh.supabase.co`
   - ✅ `SUPABASE_SERVICE_KEY` = (chave completa do Supabase)
3. Se não estiverem, **ADICIONE** e faça redeploy

### Passo 4: Aguardar Deploy

1. Vá em **Deploys** (Deploys)
2. Aguarde o deploy concluir (pode levar 2-5 minutos)
3. Verifique se o status é **Live** (Ativo)

### Passo 5: Verificar Logs

1. Vá em **Logs** (Logs)
2. Faça uma requisição para salvar link do YouTube
3. Verifique se aparece:
   - ✅ `Usando APENAS Supabase Client (sem fallback SQL)...`
   - ❌ **NÃO** deve aparecer: `pg.`, `Client`, `connectionString`, `5432`

---

## 🔧 SE AINDA NÃO FUNCIONAR

### Opção 1: Recriar Serviço (Último Recurso)

1. **BACKUP**: Anote todas as variáveis de ambiente
2. Crie um novo serviço no Render
3. Configure as mesmas variáveis de ambiente
4. Faça deploy do código

### Opção 2: Verificar Código no Render

1. No Render, vá em **Shell** (se disponível)
2. Execute: `cat server/routes/admin.js | grep -A 5 "marketing/youtube"`
3. Verifique se o código está correto (sem SQL direto)

---

## 📋 CHECKLIST FINAL

- [ ] Cache do build limpo
- [ ] Deploy manual feito
- [ ] Variáveis de ambiente verificadas
- [ ] Deploy concluído com sucesso
- [ ] Logs verificados (sem SQL direto)
- [ ] Teste realizado (salvar link do YouTube)

---

**Status**: ⚠️ **REQUER AÇÃO MANUAL NO RENDER**

**Último commit**: `e06bbdb` - "fix: Força deploy limpo no Render"

