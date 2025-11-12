# 🔍 DIAGNÓSTICO FINAL: Card do YouTube Não Aparece

## Data: 12/11/2025

---

## ✅ VERIFICAÇÕES REALIZADAS

### 1. API de Produção
- ❌ **Status**: Retorna link vazio
- ❌ **Resposta**: `{"youtube_link":""}`
- ✅ **API Local**: Funciona corretamente

### 2. Banco de Dados
- ✅ **Link configurado**: `https://www.youtube.com/watch?v=ypATdt9gobQ`
- ✅ **Tabela existe**: `configuracoes`
- ✅ **RLS desabilitado**: Não há bloqueio de políticas
- ✅ **Acesso direto funciona**: Query SQL retorna o link

### 3. Supabase Client (Local)
- ✅ **Funciona**: Consegue ler o link
- ✅ **Teste**: Script `test-supabase-youtube.js` confirma funcionamento

### 4. Código Frontend
- ✅ **Correto**: Renderiza card apenas se `youtubeEmbedUrl` tiver valor
- ✅ **Lógica**: Se API retorna vazio → `youtubeEmbedUrl` fica vazio → card não aparece

---

## 🚨 PROBLEMA IDENTIFICADO

**A API de produção não está conseguindo ler o link do banco de dados, mesmo com o link configurado.**

### Possíveis Causas no Render:

1. **Variáveis de Ambiente Diferentes**
   - `SUPABASE_URL` pode estar diferente
   - `SUPABASE_SERVICE_KEY` pode estar diferente ou incorreta
   - `DATABASE_URL` pode não estar configurada

2. **Supabase Client Falhando Silenciosamente**
   - Pode estar dando erro mas sendo capturado
   - Pode não ter permissão para acessar a tabela

3. **Problema de Deploy**
   - Código pode não estar atualizado no Render
   - Pode haver cache

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Melhoria na Rota (`server/index.js`)

**Mudanças**:
- ✅ Usa `maybeSingle()` em vez de `single()` (não dá erro se não encontrar)
- ✅ Se Supabase Client retornar vazio, tenta SQL direto
- ✅ Logs detalhados em cada etapa
- ✅ Fallback robusto

### 2. Scripts de Verificação

- ✅ `check-youtube-link-production.js` - Verifica link no banco
- ✅ `test-supabase-youtube.js` - Testa Supabase Client
- ✅ `check-rls-policies.js` - Verifica políticas RLS
- ✅ `set-youtube-link.js` - Configura link no banco

---

## 📋 PRÓXIMOS PASSOS

### Passo 1: Verificar Variáveis de Ambiente no Render

1. Acesse o dashboard do Render
2. Vá em **Environment** do serviço backend
3. Verifique se estão configuradas:
   - ✅ `SUPABASE_URL` = `https://rslnzomohtvwvhymenjh.supabase.co`
   - ✅ `SUPABASE_SERVICE_KEY` = (chave completa)
   - ✅ `DATABASE_URL` = (opcional, mas recomendado)

### Passo 2: Verificar Logs do Render

1. Acesse **Logs** do serviço backend
2. Faça uma requisição: `curl https://api.slothempresas.com.br/api/marketing/youtube`
3. Verifique os logs para ver:
   - Se Supabase Client está sendo usado
   - Se há erros
   - Se está caindo no fallback SQL
   - Qual connection string está sendo usada

### Passo 3: Testar Requisição Direta

```bash
curl https://api.slothempresas.com.br/api/marketing/youtube
```

Verificar resposta.

### Passo 4: Se Ainda Não Funcionar

**Opção A**: Configurar link diretamente no Render via SQL
- Acessar Supabase SQL Editor
- Executar: `UPDATE configuracoes SET valor = 'https://www.youtube.com/watch?v=ypATdt9gobQ' WHERE chave = 'youtube_link';`

**Opção B**: Usar apenas SQL direto (remover Supabase Client)
- Garantir que `DATABASE_URL` está configurada no Render
- Usar apenas conexão PostgreSQL direta

---

## 🎯 CONCLUSÃO

**Problema**: API de produção não consegue ler link do banco.

**Causa Provável**: Variáveis de ambiente diferentes ou Supabase Client não funcionando no Render.

**Solução Implementada**: 
- Rota melhorada com `maybeSingle()` e fallback robusto
- Logs detalhados para identificar problema exato

**Próxima Ação**: 
- Verificar variáveis de ambiente no Render
- Verificar logs após deploy
- Identificar causa exata

---

**Status**: ✅ **CÓDIGO MELHORADO - AGUARDANDO VERIFICAÇÃO NO RENDER**

