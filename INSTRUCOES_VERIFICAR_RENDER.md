# 📋 INSTRUÇÕES: Verificar Card do YouTube no Render

## Data: 12/11/2025

---

## 🎯 OBJETIVO

Verificar por que a API de produção retorna link vazio e corrigir o problema.

---

## ✅ VERIFICAÇÕES NECESSÁRIAS NO RENDER

### 1. Verificar Variáveis de Ambiente

**Acesse**: Dashboard Render → Seu Serviço → Environment

**Verificar se estão configuradas**:

| Variável | Valor Esperado | Status |
|----------|----------------|--------|
| `SUPABASE_URL` | `https://rslnzomohtvwvhymenjh.supabase.co` | ⚠️ Verificar |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave completa) | ⚠️ Verificar |
| `DATABASE_URL` | `postgresql://postgres:****@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres` | ⚠️ Verificar (opcional) |
| `NODE_ENV` | `production` | ⚠️ Verificar |

**⚠️ AÇÃO**: Se alguma estiver faltando ou incorreta, adicione/corrija.

---

### 2. Verificar Logs do Render

**Acesse**: Dashboard Render → Seu Serviço → Logs

**Fazer requisição de teste**:
```bash
curl https://api.slothempresas.com.br/api/marketing/youtube
```

**Verificar nos logs**:
- ✅ Se aparece: `🔍 GET /api/marketing/youtube - Buscando link do YouTube...`
- ✅ Se aparece: `Tentando buscar com Supabase Client...`
- ✅ Se aparece: `✅ Link encontrado via Supabase Client: ...`
- ❌ Se aparece erro: Qual erro? (copiar mensagem completa)
- ❌ Se cai no fallback: `Usando fallback SQL direto...`
- ❌ Se há erros de conexão

**Copiar logs completos** da requisição.

---

### 3. Testar API Diretamente

**No terminal ou navegador**:
```
https://api.slothempresas.com.br/api/marketing/youtube
```

**Verificar resposta**:
- Se retorna `{"youtube_link":"..."}` → Link encontrado ✅
- Se retorna `{"youtube_link":""}` → Link vazio ❌

---

## 🔧 SOLUÇÕES BASEADAS NOS RESULTADOS

### Se Supabase Client Falhar nos Logs:

**Solução**: Adicionar `DATABASE_URL` no Render e usar apenas SQL direto.

**Mudança no código**:
- Remover tentativa com Supabase Client
- Usar apenas SQL direto com `DATABASE_URL`

### Se SQL Direto Também Falhar:

**Verificar**:
1. `DATABASE_URL` está correta?
2. Senha do banco está correta?
3. Conexão SSL está configurada?

### Se Ambos Funcionarem mas Retornarem Vazio:

**Verificar**:
1. Link está realmente no banco? (executar script de verificação)
2. Tabela `configuracoes` existe?
3. Chave `youtube_link` existe?

---

## 📝 CHECKLIST DE VERIFICAÇÃO

- [ ] Variáveis de ambiente verificadas no Render
- [ ] Logs do Render verificados após requisição
- [ ] API testada diretamente (curl ou navegador)
- [ ] Resposta da API verificada
- [ ] Problema identificado nos logs
- [ ] Solução aplicada
- [ ] Teste novamente após correção

---

## 🚨 SE NADA FUNCIONAR

**Solução de Emergência**: Configurar link diretamente via Supabase SQL Editor

1. Acesse Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute:
```sql
-- Verificar se existe
SELECT * FROM configuracoes WHERE chave = 'youtube_link';

-- Inserir ou atualizar
INSERT INTO configuracoes (chave, valor)
VALUES ('youtube_link', 'https://www.youtube.com/watch?v=ypATdt9gobQ')
ON CONFLICT (chave) 
DO UPDATE SET valor = 'https://www.youtube.com/watch?v=ypATdt9gobQ', updated_at = NOW();
```

4. Teste novamente a API

---

**Status**: ⚠️ **AGUARDANDO VERIFICAÇÃO NO RENDER**

