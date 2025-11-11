# 🛡️ COMO USAR O SISTEMA DE PROTEÇÃO DE CÓDIGO

Este guia explica como usar o sistema de proteção que foi criado para evitar remoções acidentais de código.

## 📋 O QUE FOI CRIADO

1. **`INVENTARIO_CODIGO_PROTEGIDO.md`** - Lista completa de todo código protegido
2. **`scripts/verificar-codigo-protegido.js`** - Script que verifica se código protegido está presente
3. **`scripts/pre-commit`** - Hook do Git para verificação automática antes de commits
4. **`REGRAS_SEGURANCA_CODIGO.md`** - Regras atualizadas com proteções mais rígidas
5. **Comentários de proteção** - Marcadores no código crítico

## 🚀 COMO USAR

### Verificação Manual (Recomendado)

Antes de fazer qualquer commit, execute:

```bash
node scripts/verificar-codigo-protegido.js
```

**Se o script mostrar erros:**
- ❌ **NÃO FAÇA COMMIT**
- Restaure os arquivos do Git: `git restore <arquivo>`
- Verifique o que foi removido
- Se foi intencional, atualize o inventário

**Se o script passar:**
- ✅ Pode fazer commit normalmente

### Verificação Automática (Opcional)

Para verificação automática antes de cada commit:

#### Windows (PowerShell):
```powershell
# Criar diretório de hooks se não existir
if (!(Test-Path .git\hooks)) { New-Item -ItemType Directory -Path .git\hooks }

# Copiar hook
Copy-Item scripts\pre-commit .git\hooks\pre-commit

# Tornar executável (se necessário)
# No Windows, geralmente não é necessário
```

#### Linux/Mac:
```bash
# Criar hook
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Agora, toda vez que você fizer `git commit`, o script será executado automaticamente.**

## 📖 COMO FUNCIONA

### 1. Inventário de Código Protegido

O arquivo `INVENTARIO_CODIGO_PROTEGIDO.md` lista:
- Todas as funcionalidades críticas
- Onde cada funcionalidade está localizada
- O que verificar em cada arquivo

**Se você (assistente) estiver prestes a remover código:**
1. Leia este arquivo primeiro
2. Verifique se o código está na lista
3. Se estiver → **NÃO REMOVA**
4. Pergunte ao usuário primeiro

### 2. Script de Verificação

O script `verificar-codigo-protegido.js` verifica:
- ✅ Se arquivos críticos existem
- ✅ Se funções críticas estão presentes
- ✅ Se rotas da API existem
- ✅ Se telas do sistema existem
- ✅ Se campos obrigatórios estão presentes

**O script retorna:**
- ✅ Sucesso: Tudo está OK
- ❌ Falha: Algo foi removido (lista o que está faltando)

### 3. Comentários de Proteção

Código crítico agora tem comentários como:
```javascript
// 🔒 CÓDIGO PROTEGIDO - NUNCA REMOVER
// Esta função é crítica para...
// Ver: INVENTARIO_CODIGO_PROTEGIDO.md
```

**Estes comentários servem como aviso visual para não remover o código.**

## ⚠️ O QUE FAZER SE ALGO FOR REMOVIDO

### Se você (assistente) removeu código por engano:

1. **Pare imediatamente**
2. **Restaure do Git:**
   ```bash
   git restore <arquivo>
   ```
3. **Execute verificação:**
   ```bash
   node scripts/verificar-codigo-protegido.js
   ```
4. **Confirme que tudo está OK**
5. **Peça desculpas ao usuário**

### Se o usuário quiser remover algo protegido:

1. **Verifique se está no inventário**
2. **Pergunte ao usuário se tem certeza**
3. **Se confirmado:**
   - Remova o código
   - Atualize `INVENTARIO_CODIGO_PROTEGIDO.md`
   - Documente no commit message
   - Execute verificação para confirmar

## 🔍 FUNCIONALIDADES PROTEGIDAS

As seguintes funcionalidades estão protegidas:

1. ✅ Sistema de Estoque
2. ✅ Botão ON/OFF para desativar produtos
3. ✅ Layout da tela de edição de produtos
4. ✅ Sistema de status de pedidos por item
5. ✅ Campos obrigatórios de produtos
6. ✅ Função de impressão de pedidos
7. ✅ Todas as telas do sistema
8. ✅ Todas as rotas da API

**Para lista completa, veja `INVENTARIO_CODIGO_PROTEGIDO.md`**

## 📝 ATUALIZANDO O INVENTÁRIO

Se você adicionar novas funcionalidades críticas:

1. Adicione ao `INVENTARIO_CODIGO_PROTEGIDO.md`
2. Adicione verificação no `scripts/verificar-codigo-protegido.js`
3. Adicione comentários de proteção no código
4. Documente no commit

## 🚨 ALERTAS IMPORTANTES

- ⚠️ **NUNCA remova código sem verificar o inventário primeiro**
- ⚠️ **NUNCA remova código sem perguntar ao usuário**
- ⚠️ **SEMPRE execute o script antes de commitar**
- ⚠️ **Se o script falhar, NÃO faça commit**

## 📞 EM CASO DE DÚVIDA

Se houver qualquer dúvida:
1. **NÃO REMOVA**
2. Pergunte ao usuário
3. Leia `INVENTARIO_CODIGO_PROTEGIDO.md`
4. Leia `REGRAS_SEGURANCA_CODIGO.md`
5. Aguarde confirmação explícita

---

**ÚLTIMA ATUALIZAÇÃO**: 2025-01-27
**VERSÃO**: 1.0

