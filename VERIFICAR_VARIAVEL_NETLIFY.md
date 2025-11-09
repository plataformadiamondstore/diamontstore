# ✅ VARIÁVEL JÁ EXISTE - VERIFICAR VALOR

A variável `VITE_API_URL` já está configurada no Netlify! Agora precisamos verificar se o **valor está correto**.

## 🔍 VERIFICAR VALOR DA VARIÁVEL

1. No Netlify, vá em **"Site settings"** → **"Environment variables"**
2. Procure por `VITE_API_URL` na lista
3. **Clique nela** para ver/editar
4. **Me diga qual é o valor atual:**
   - [ ] `https://api.slothempresas.com.br` ✅ (correto)
   - [ ] `https://slothempresas.com.br` ❌ (errado - falta "api.")
   - [ ] `https://api.slothempresas.com.br/api` ⚠️ (pode funcionar, mas não é ideal)
   - [ ] Outro: _______________

## ✅ SE O VALOR ESTIVER ERRADO

1. Clique na variável `VITE_API_URL`
2. Edite o **Value** para: `https://api.slothempresas.com.br`
3. **NÃO** adicione `/api` no final (o código adiciona automaticamente)
4. Salve
5. Faça um novo deploy: **"Deploys"** → **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ SE O VALOR ESTIVER CORRETO

Se o valor já está como `https://api.slothempresas.com.br`:

1. **Forçar novo deploy** mesmo assim:
   - **"Deploys"** → **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Aguarde concluir

2. **Limpar cache do navegador**:
   - Abra em aba anônima: `Ctrl + Shift + N`
   - Ou limpe o cache: `Ctrl + Shift + Delete`

3. **Verificar no Console** (F12):
   - Deve aparecer: `✅ Usando VITE_API_URL: https://api.slothempresas.com.br/api`
   - Deve aparecer: `baseURL: "https://api.slothempresas.com.br/api"`

## 🔍 VERIFICAÇÕES ADICIONAIS

Se mesmo com a variável correta não funcionar:

1. **Verificar Build logs**:
   - No Netlify, clique no último deploy
   - Veja os **Build logs**
   - Procure por `VITE_API_URL` nos logs
   - Me diga se aparece algum erro

2. **Verificar se a variável está no escopo correto**:
   - A variável deve estar em **"All scopes"** ou pelo menos em **"Production"**

3. **Verificar se o deploy está usando a variável**:
   - Nos Build logs, deve aparecer algo como: `VITE_API_URL=https://api.slothempresas.com.br`

---

**Me diga qual é o valor atual da variável `VITE_API_URL` no Netlify!**

