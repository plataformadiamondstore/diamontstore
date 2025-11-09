# 🔥 SOLUÇÃO DEFINITIVA - ADICIONAR VARIÁVEL DE AMBIENTE NO NETLIFY

O problema pode ser que o código não está detectando produção corretamente. Vamos **FORÇAR** a URL correta adicionando a variável de ambiente diretamente no Netlify.

## ✅ SOLUÇÃO: ADICIONAR VITE_API_URL NO NETLIFY

### PASSO 1: Adicionar Variável de Ambiente

1. Acesse o **dashboard do Netlify**
2. Vá no seu site
3. Clique em **"Site settings"** (Configurações do site)
4. Vá em **"Environment variables"** (Variáveis de ambiente)
5. Clique em **"Add variable"** (Adicionar variável)
6. Adicione:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://api.slothempresas.com.br`
   - **Scopes**: Selecione **"All scopes"** (Todos os escopos)
7. Clique em **"Save"** (Salvar)

### PASSO 2: Forçar Novo Deploy

1. Ainda no Netlify, vá em **"Deploys"**
2. Clique em **"Trigger deploy"** (Disparar deploy)
3. Selecione **"Clear cache and deploy site"** (Limpar cache e fazer deploy)
4. Aguarde o deploy concluir (5-10 minutos)

### PASSO 3: Limpar Cache do Navegador

1. **Abra em aba anônima**: `Ctrl + Shift + N`
2. Ou limpe o cache: `Ctrl + Shift + Delete` → Limpar tudo

### PASSO 4: Verificar se Funcionou

1. Abra o site em aba anônima
2. Abra o **Console** (F12)
3. Deve aparecer:
   ```
   ✅ Usando VITE_API_URL: https://api.slothempresas.com.br/api
   🔧 API Configurada: {
     VITE_API_URL: "https://api.slothempresas.com.br",
     baseURL: "https://api.slothempresas.com.br/api",
     "URL completa exemplo": "https://api.slothempresas.com.br/api/auth/employee"
   }
   ```

## 🔍 VERIFICAÇÕES ADICIONAIS

Se ainda não funcionar, verifique:

### 1. Versão no Código-Fonte
- Clique com botão direito → "Ver código-fonte"
- Procure por: `<meta name="version" content="2025-01-27-v6-API-FIX"/>`
- Se não aparecer `v6-API-FIX`, o deploy não atualizou

### 2. Console do Navegador
- Abra o Console (F12)
- Me diga o que aparece:
  - Qual versão aparece?
  - Qual baseURL aparece?
  - Aparece algum erro?

### 3. Network Tab
- Vá na aba "Network" (Rede)
- Tente fazer login
- Clique na requisição `auth/employee`
- Me diga qual é a **URL completa** da requisição

## ⚠️ SE AINDA NÃO FUNCIONAR

Se mesmo com a variável de ambiente não funcionar, pode ser que:

1. **O código antigo ainda está em cache** - Tente deletar o site e recriar
2. **O Netlify não está aplicando as variáveis** - Verifique os Build logs
3. **Há algum problema com o build** - Veja os logs de build

---

**Adicione a variável `VITE_API_URL = https://api.slothempresas.com.br` no Netlify e faça um novo deploy!**

