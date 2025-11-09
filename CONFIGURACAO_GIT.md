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

## 📝 NOTAS IMPORTANTES

- ⚠️ **NUNCA** fazer push para repositórios do nirvana ou qualquer outro projeto
- ⚠️ **SEMPRE** verificar o remote antes de fazer push
- ⚠️ **SEMPRE** usar as credenciais `slothempresas` para este projeto
- ⚠️ Este documento deve ser consultado sempre que houver dúvidas sobre a configuração do Git

## 🔗 LINKS ÚTEIS

- Repositório: https://github.com/slothempresas/slothempresas
- Documentação Git: https://git-scm.com/doc

---

**Última atualização**: 09/11/2025  
**Projeto**: Sloth Empresas  
**Mantido por**: slothempresas

