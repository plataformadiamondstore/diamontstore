# ❓ PERGUNTAS SOBRE CONFIGURAÇÃO DO NETLIFY

Preciso que você me diga **EXATAMENTE** como está configurado o Netlify para identificar o problema.

## 📋 INFORMAÇÕES NECESSÁRIAS

### 1. Configuração do Site

Acesse: **Netlify Dashboard → Seu Site → Site settings → Build & deploy**

Me diga:

1. **Base directory**: Qual está configurado?
   - [ ] Vazio (nada)
   - [ ] `client`
   - [ ] Outro: _______________

2. **Build command**: Qual está configurado?
   - [ ] `npm run build`
   - [ ] `cd client && npm run build`
   - [ ] Outro: _______________

3. **Publish directory**: Qual está configurado?
   - [ ] `dist`
   - [ ] `client/dist`
   - [ ] Outro: _______________

### 2. Variáveis de Ambiente

Acesse: **Netlify Dashboard → Seu Site → Site settings → Environment variables**

Me diga se existe a variável:
- [ ] `VITE_API_URL` = `https://api.slothempresas.com.br`
- [ ] Não existe

### 3. Último Deploy

Acesse: **Netlify Dashboard → Seu Site → Deploys**

Me diga:
1. O último deploy está **"Published"** (verde) ou **"Building"** ou **"Failed"**?
2. Quando foi o último deploy? (data/hora)
3. Nos **Build logs**, aparece algum erro?

### 4. Console do Navegador

Abra o site e pressione **F12** → **Console**

Me diga o que aparece:
1. Qual é a **versão** que aparece? (procure por "Verificando versão")
2. Qual é o **baseURL** da API? (procure por "API Configurada")
3. Aparece algum **erro**? Qual?

### 5. Código-Fonte

No navegador, clique com botão direito → **"Ver código-fonte"**

Procure por: `<meta name="version" content="..."/>`

Me diga qual versão aparece:
- [ ] `2025-01-27-v5-INLINE-STYLES`
- [ ] `2025-01-27-v4-FORCE`
- [ ] Outra: _______________

## 🔧 O QUE FOI FEITO AGORA (v5-INLINE-STYLES)

1. ✅ **Estilos inline críticos** - A cor de fundo agora está **hardcoded** no HTML, não depende do CSS
2. ✅ **Arquivo `_headers`** - Força o Netlify a não fazer cache
3. ✅ **Cache-busting no banner** - Adiciona timestamp na URL da imagem
4. ✅ **Múltiplos fallbacks** - Tenta vários caminhos para o banner

## 🎯 RESULTADO ESPERADO

Com os estilos inline, **mesmo que o CSS não carregue**, a cor de fundo deve aparecer correta:
- Cor: `#f3f4f6` para `#e5e7eb` (cinza claro)
- Banner deve tentar carregar de múltiplos caminhos
- Placeholder roxo se o banner não carregar

## ⚠️ PRÓXIMOS PASSOS

1. **Aguarde o deploy** (2-5 minutos após o push)
2. **Limpe o cache do navegador** completamente
3. **Abra em aba anônima** (`Ctrl + Shift + N`)
4. **Me diga as respostas das perguntas acima**

---

**Com essas informações, vou conseguir identificar exatamente onde está o problema!**

