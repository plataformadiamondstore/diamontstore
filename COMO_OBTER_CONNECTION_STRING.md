# 📋 COMO OBTER A CONNECTION STRING DO SUPABASE

## Passo a Passo em Português

### Passo 1: Acessar o Supabase
1. Acesse https://supabase.com
2. Faça login na sua conta
3. Clique no seu projeto: **rslnzomohtvwvhymenjh**

### Passo 2: Ir para Configurações do Banco
1. No menu lateral esquerdo, procure por **"Configurações"** ou **"Settings"** (ícone de engrenagem ⚙️)
2. Clique em **"Configurações"**

### Passo 3: Acessar Database
1. No menu de configurações, procure por **"Database"** ou **"Banco de Dados"**
2. Clique em **"Database"**

### Passo 4: Encontrar Connection String
1. Role a página para baixo até encontrar a seção **"Connection string"** ou **"String de conexão"**
2. Você verá algumas opções:
   - **URI**
   - **Session mode**
   - **Transaction mode**
   - **Connection pooling**

### Passo 5: Copiar a Connection String
1. Clique na aba **"URI"** (primeira opção)
2. Você verá algo assim:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
   ```
3. **IMPORTANTE**: Você precisa substituir `[YOUR-PASSWORD]` pela senha do banco de dados
4. A senha é a que você criou quando fez o projeto no Supabase
5. Se você esqueceu a senha:
   - Na mesma página de Database, procure por **"Database password"** ou **"Senha do banco"**
   - Você pode ver a senha ou resetá-la

### Passo 6: Formato Final
A Connection String final deve ficar assim:
```
postgresql://postgres:SUA_SENHA_AQUI@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
```

**Exemplo:**
```
postgresql://postgres:MinhaSenha123@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
```

---

## ⚠️ ATENÇÃO
- Não compartilhe essa string com ninguém
- Ela contém a senha do banco de dados
- Mantenha em segredo

---

## 📝 Próximo Passo
Depois de obter a Connection String, me envie ela para eu finalizar o script de criação das tabelas.

