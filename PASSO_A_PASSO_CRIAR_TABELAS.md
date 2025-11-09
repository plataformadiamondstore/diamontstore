# 🚀 PASSO A PASSO: CRIAR TABELAS NO SUPABASE

## ✅ O QUE JÁ FOI FEITO
- ✅ Script de criação de tabelas criado
- ✅ Dependência `pg` adicionada ao package.json

## 📋 AGORA SIGA ESTES PASSOS:

### PASSO 1: Obter a Connection String do Supabase

1. **Acesse o Supabase:**
   - Vá em https://supabase.com
   - Faça login
   - Clique no seu projeto

2. **Vá em Configurações:**
   - No menu lateral, clique em **"Settings"** ou **"Configurações"** (ícone ⚙️)
   - Clique em **"Database"** ou **"Banco de Dados"**

3. **Copie a Connection String:**
   - Role a página até encontrar **"Connection string"**
   - Clique na aba **"URI"**
   - Você verá algo como:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
     ```
   - **SUBSTITUA** `[YOUR-PASSWORD]` pela senha do seu banco
   - Se não souber a senha, procure por **"Database password"** na mesma página

4. **Formato final deve ser:**
   ```
   postgresql://postgres:SUA_SENHA@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
   ```

---

### PASSO 2: Colar a Connection String no Script

1. **Abra o arquivo:**
   - Vá na pasta `server/scripts/`
   - Abra o arquivo `create-tables.js`

2. **Encontre a linha:**
   ```javascript
   const DATABASE_URL = 'COLE_A_CONNECTION_STRING_AQUI';
   ```

3. **Substitua por:**
   ```javascript
   const DATABASE_URL = 'postgresql://postgres:SUA_SENHA@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';
   ```
   (Cole a Connection String completa que você copiou)

4. **Salve o arquivo** (Ctrl+S)

---

### PASSO 3: Instalar a Dependência `pg`

Abra o terminal na pasta `server` e execute:

```bash
npm install
```

Isso vai instalar a biblioteca `pg` necessária para conectar ao PostgreSQL.

---

### PASSO 4: Executar o Script

Ainda no terminal, na pasta `server`, execute:

```bash
npm run create-tables
```

Ou:

```bash
node scripts/create-tables.js
```

---

### PASSO 5: Verificar o Resultado

O script vai mostrar:
- ✅ Quais tabelas foram criadas
- ❌ Quais deram erro
- 📊 Resumo final

**Você deve ver:**
```
🎉 SUCESSO! Todas as tabelas foram criadas!
✅ 8/8 tabelas existem
```

---

## ❌ SE DER ERRO:

### Erro: "password authentication failed"
- **Solução:** Verifique se a senha na Connection String está correta

### Erro: "getaddrinfo ENOTFOUND"
- **Solução:** Verifique se a URL do banco está correta

### Erro: "Cannot find module 'pg'"
- **Solução:** Execute `npm install` na pasta `server`

---

## ✅ PRÓXIMO PASSO

Depois que as tabelas forem criadas com sucesso, me avise e vamos para o próximo passo!

