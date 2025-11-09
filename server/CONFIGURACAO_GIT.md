# 🔒 CONFIGURAÇÃO GIT - PROJETO SLOTHEMPRESAS

## ⚠️ CONFIGURAÇÃO FIXA E OBRIGATÓRIA

Este documento define a configuração **FIXA** e **OBRIGATÓRIA** do Git para este projeto.

## 📋 INFORMAÇÕES DO REPOSITÓRIO

### Repositório GitHub
- **URL**: `https://github.com/slothempresas/slothempresas.git`
- **Organização**: `slothempresas`
- **Nome do Repositório**: `slothempresas`
- **Branch Principal**: `master`

### Credenciais do Projeto
- **Usuário Git**: `slothempresas`
- **Email Git**: `slothempresas@gmail.com`

## ✅ CONFIGURAÇÃO CORRETA

### Remote (Obrigatório)
```bash
git remote add origin https://github.com/slothempresas/slothempresas.git
```

**OU se já existe:**
```bash
git remote set-url origin https://github.com/slothempresas/slothempresas.git
```

### Usuário Local do Repositório
```bash
git config user.name "slothempresas"
git config user.email "slothempresas@gmail.com"
```

## 🚫 CONFIGURAÇÕES PROIBIDAS

### NÃO USAR:
- ❌ `nirvanamassagens2025` ou qualquer variação
- ❌ `nirvanamassagens2025@gmail.com`
- ❌ Qualquer outro repositório que não seja `slothempresas/slothempresas`
- ❌ Configurações globais do Git para este projeto

### Verificar e Remover Configurações Incorretas
```bash
# Verificar configurações globais incorretas
git config --global --list | Select-String -Pattern "nirvana"

# Remover se encontrar
git config --global --unset user.name
git config --global --unset user.email
```

## 🔍 COMANDOS DE VERIFICAÇÃO

### Verificar Remote Configurado
```bash
git remote -v
```

**Resultado esperado:**
```
origin	https://github.com/slothempresas/slothempresas.git (fetch)
origin	https://github.com/slothempresas/slothempresas.git (push)
```

### Verificar Usuário Configurado
```bash
git config user.name
git config user.email
```

**Resultado esperado:**
```
slothempresas
slothempresas@gmail.com
```

### Verificar Status do Repositório
```bash
git status
git log --oneline -5
```

## 📤 COMANDO DE PUSH PADRÃO

Sempre usar este comando para fazer push:

```bash
git push -u origin master
```

Ou se já foi configurado anteriormente:

```bash
git push origin master
```

## 🔄 PROCEDIMENTO DE CORREÇÃO (Se Algo Estiver Errado)

1. **Verificar Remote:**
   ```bash
   git remote -v
   ```

2. **Corrigir Remote se necessário:**
   ```bash
   git remote remove origin
   git remote add origin https://github.com/slothempresas/slothempresas.git
   ```

3. **Corrigir Usuário:**
   ```bash
   git config user.name "slothempresas"
   git config user.email "slothempresas@gmail.com"
   ```

4. **Remover Configurações Globais Incorretas:**
   ```bash
   git config --global --unset user.name
   git config --global --unset user.email
   ```

5. **Verificar:**
   ```bash
   git remote -v
   git config user.name
   git config user.email
   ```

6. **Fazer Push:**
   ```bash
   git push -u origin master
   ```

## 📁 ESTRUTURA DO REPOSITÓRIO (Reorganizado em 09/11/2025)

O repositório foi reorganizado com a seguinte estrutura:

```
.
├── server/          # Backend (Node.js/Express)
│   ├── routes/      # Rotas da API
│   ├── scripts/     # Scripts de configuração
│   ├── package.json
│   └── ...
│
├── client/          # Frontend (React/Vite)
│   ├── src/         # Código fonte React
│   ├── public/      # Arquivos estáticos
│   ├── package.json
│   └── ...
│
├── .gitignore      # Gitignore unificado na raiz
├── README.md        # Documentação do projeto
└── ...
```

### ⚠️ IMPORTANTE: Localização do Repositório Git

- **Repositório Git principal**: `C:\server\` (raiz do projeto)
- **Backend**: `C:\server\server\` (subpasta)
- **Frontend**: `C:\server\client\` (subpasta)
- **C:\client\**: Pode continuar como workspace local, mas o Git está em `C:\server\`

### 🔄 Como Trabalhar com a Nova Estrutura

#### Para fazer commits e push:

```bash
# Sempre trabalhar a partir da raiz do repositório
cd C:\server

# Verificar status
git status

# Adicionar alterações
git add .

# Fazer commit
git commit -m "Descrição das alterações"

# Fazer push
git push origin master
```

#### Para trabalhar no código:

```bash
# Backend
cd C:\server\server
# ou continuar usando C:\server\server como workspace

# Frontend
cd C:\server\client
# ou continuar usando C:\client como workspace (mas commits vêm de C:\server)
```

### 📝 Histórico de Reorganização

**Data**: 09/11/2025**

- ✅ Repositório reorganizado com subpastas `server/` e `client/`
- ✅ Todo histórico preservado (commits do server e client mantidos)
- ✅ `.gitignore` unificado na raiz
- ✅ `README.md` criado na raiz
- ✅ Estrutura sincronizada com repositório remoto

**Commits importantes:**
- `210f5a2` - Reorganização: estrutura com subpastas server/ e client/
- `1ff90e5` - Merge: reorganização da estrutura do projeto
- `942ebf0` - Merge: integração com remoto e reorganização completa
- `c0b437f` - Correção: estrutura duplicada e .gitignore unificado
- `d66312c` - Limpeza: remove package.json da raiz

## 📝 NOTAS IMPORTANTES

- ⚠️ **NUNCA** fazer push para repositórios do nirvana ou qualquer outro projeto
- ⚠️ **SEMPRE** verificar o remote antes de fazer push
- ⚠️ **SEMPRE** usar as credenciais `slothempresas` para este projeto
- ⚠️ **SEMPRE** trabalhar a partir de `C:\server\` para commits e push
- ⚠️ Este documento deve ser consultado sempre que houver dúvidas sobre a configuração do Git

## 🔗 LINKS ÚTEIS

- Repositório: https://github.com/slothempresas/slothempresas
- Documentação Git: https://git-scm.com/doc

---

**Última atualização**: 09/11/2025  
**Projeto**: Sloth Empresas  
**Mantido por**: slothempresas  
**Reorganização**: 09/11/2025 - Estrutura com subpastas server/ e client/


