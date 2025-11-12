# 🚀 GUIA: Migração para Supabase Storage

## Data: 12/11/2025

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Scripts de Migração

#### `server/scripts/migrate-images-to-supabase.js`
- Cria bucket `produtos` no Supabase Storage (se não existir)
- Migra todas as imagens locais para o Supabase Storage
- Gera arquivo `migration-urls.json` com mapeamento de URLs

#### `server/scripts/update-image-urls.js`
- Atualiza URLs no banco de dados
- Usa o arquivo `migration-urls.json` gerado pela migração
- Atualiza tabela `produto_imagens` com novas URLs do Supabase

### 2. Código de Upload Atualizado

#### `server/routes/admin.js`
- ✅ Multer configurado para usar `memoryStorage` (upload direto ao Supabase)
- ✅ Função `uploadImageToSupabase()` criada
- ✅ Rotas POST e PUT atualizadas para usar Supabase Storage
- ✅ Novas imagens são automaticamente salvas no Supabase Storage

#### `server/routes/products.js`
- ✅ Função `fixImageUrl()` atualizada para reconhecer URLs do Supabase
- ✅ URLs do Supabase são retornadas como estão (não precisam correção)

---

## 📋 COMO EXECUTAR A MIGRAÇÃO

### Passo 1: Executar Migração de Imagens

```bash
cd C:\server\server
node scripts/migrate-images-to-supabase.js
```

**O que este script faz:**
1. Verifica se o bucket `produtos` existe no Supabase Storage
2. Cria o bucket se não existir (público, 5MB limite, tipos de imagem permitidos)
3. Migra todas as imagens de `uploads/produtos/` para o Supabase Storage
4. Gera arquivo `migration-urls.json` com mapeamento de URLs

**Resultado esperado:**
```
✅ Bucket "produtos" criado com sucesso!
📸 Encontradas 31 imagens para migrar
[1/31] Migrando: 025529ec74a06c91318b530148269e94...
   ✅ Upload concluído: https://rslnzomohtvwvhymenjh.supabase.co/storage/v1/object/public/produtos/...
...
📊 RESUMO DA MIGRAÇÃO:
   ✅ Sucesso: 31
   ❌ Falhas: 0
```

### Passo 2: Atualizar URLs no Banco de Dados

```bash
cd C:\server\server
node scripts/update-image-urls.js
```

**O que este script faz:**
1. Lê o arquivo `migration-urls.json` gerado na migração
2. Busca todas as imagens na tabela `produto_imagens`
3. Atualiza as URLs antigas com as novas URLs do Supabase Storage

**Resultado esperado:**
```
📸 Encontradas 31 imagens no banco de dados
[1/31] Atualizando: 025529ec74a06c91318b530148269e94...
   Antiga: http://localhost:3000/uploads/produtos/025529ec74a06c91318b530148269e94
   Nova: https://rslnzomohtvwvhymenjh.supabase.co/storage/v1/object/public/produtos/...
   ✅ Atualizado com sucesso
...
📊 RESUMO DA ATUALIZAÇÃO:
   ✅ Atualizadas: 31
```

---

## 🔧 CONFIGURAÇÃO DO SUPABASE STORAGE

### Bucket `produtos`

**Configurações:**
- **Nome**: `produtos`
- **Público**: Sim (para URLs públicas)
- **Limite de arquivo**: 5MB
- **Tipos permitidos**: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

**Criar manualmente (se necessário):**
1. Acesse o dashboard do Supabase
2. Vá em **Storage** → **Buckets**
3. Clique em **New bucket**
4. Nome: `produtos`
5. Marque **Public bucket**
6. Salve

---

## ✅ VERIFICAÇÕES PÓS-MIGRAÇÃO

### 1. Verificar Bucket no Supabase
- Dashboard Supabase → Storage → Buckets
- Verificar se bucket `produtos` existe
- Verificar se há imagens no bucket

### 2. Verificar URLs no Banco
```sql
SELECT id, produto_id, url_imagem 
FROM produto_imagens 
LIMIT 5;
```

**URLs devem começar com:**
```
https://rslnzomohtvwvhymenjh.supabase.co/storage/v1/object/public/produtos/...
```

### 3. Testar Upload de Nova Imagem
1. Acesse o painel admin
2. Crie ou edite um produto
3. Faça upload de uma nova imagem
4. Verifique se a imagem aparece no Supabase Storage
5. Verifique se a URL no banco está correta

### 4. Verificar no Site
1. Acesse o site (Netlify)
2. Vá na página de produtos
3. Verifique se as imagens aparecem corretamente
4. Abra o DevTools (F12) → Network
5. Verifique se as imagens são carregadas do Supabase Storage

---

## 🎯 VANTAGENS DA MIGRAÇÃO

✅ **Imagens sempre disponíveis**
- Não dependem do servidor backend
- Não são perdidas em redeploy

✅ **CDN do Supabase**
- Imagens carregam mais rápido
- Distribuição global

✅ **Escalável**
- Suporta milhares de imagens
- Sem limitações de espaço do servidor

✅ **URLs públicas estáveis**
- URLs não mudam
- Fáceis de gerenciar

✅ **Novos uploads automáticos**
- Todas as novas imagens vão para o Supabase Storage
- Não precisa mais fazer upload manual

---

## ⚠️ NOTAS IMPORTANTES

1. **Backup**: As imagens locais não são deletadas automaticamente
   - Mantenha um backup antes de deletar
   - Após confirmar que tudo funciona, pode deletar `uploads/produtos/`

2. **Bucket Público**: O bucket `produtos` é público
   - Qualquer pessoa com a URL pode acessar
   - Isso é necessário para exibir imagens no site

3. **Limite de 5MB**: Configurado no bucket
   - Imagens maiores que 5MB serão rejeitadas
   - Ajuste se necessário

4. **Nomes de Arquivo**: Novos uploads usam formato:
   ```
   {produto_id}_{timestamp}_{random}.{ext}
   ```
   - Exemplo: `123_1699876543210_abc123def.jpg`

---

## 🐛 TROUBLESHOOTING

### Erro: "Bucket não encontrado"
**Solução**: Execute o script de migração novamente (ele cria o bucket automaticamente)

### Erro: "Permission denied"
**Solução**: Verifique se `SUPABASE_SERVICE_KEY` está configurada corretamente no `.env`

### Imagens não aparecem no site
**Verificações**:
1. URLs no banco estão corretas?
2. Bucket está público?
3. Console do navegador mostra erros?
4. Imagens existem no Supabase Storage?

### Upload de nova imagem falha
**Verificações**:
1. Arquivo é menor que 5MB?
2. Tipo de arquivo é permitido (jpg, png, gif, webp)?
3. `SUPABASE_SERVICE_KEY` está configurada?

---

## 📝 PRÓXIMOS PASSOS

Após a migração:

1. ✅ Executar scripts de migração
2. ✅ Verificar imagens no Supabase Storage
3. ✅ Testar upload de nova imagem
4. ✅ Verificar se imagens aparecem no site
5. ✅ (Opcional) Deletar imagens locais após confirmar funcionamento

---

**Status**: ✅ Implementação Completa
**Próxima Ação**: Executar scripts de migração

