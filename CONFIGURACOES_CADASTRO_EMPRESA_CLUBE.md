# 📋 CONFIGURAÇÕES - CADASTRO EMPRESA E CLUBE

## 📅 Data: 2024
## 🎯 Objetivo
Configurar a exibição correta dos campos `cadastro_empresa` e `cadastro_clube` vinculados aos funcionários, evitando a exibição de códigos gerados automaticamente pelas tabelas `empresas` e `clubes`.

---

## 🔍 PROBLEMA IDENTIFICADO

### Situação Anterior
- O campo "Cadastro Empresa" estava exibindo o código gerado automaticamente da tabela `empresas` (`empresas.cadastro_empresa`)
- O campo "Clube" estava exibindo o nome do clube da tabela `clubes` (`clubes.nome`)
- Na lista de empresas em `adm/dashboard`, o código gerado automaticamente estava sendo exibido abaixo do nome da empresa

### Problema
- Os códigos gerados automaticamente (ex: `TESTE2754074`, `ATLETICOSOSO525294`) não são relevantes para o usuário
- O usuário precisa ver os cadastros vinculados diretamente aos funcionários (`funcionarios.cadastro_empresa` e `funcionarios.cadastro_clube`)

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Lista de Empresas em `adm/dashboard`

**Arquivo:** `client/src/pages/admin/AdminDashboard.jsx`  
**Linha:** 2013

**Antes:**
```javascript
<div>
  <p className="text-xs text-gray-500 mb-1">Empresa</p>
  <p className="font-semibold text-gray-900">{empresa.nome}</p>
  <p className="text-sm text-gray-600">{empresa.cadastro_empresa}</p>  // ← Código gerado automaticamente
</div>
```

**Depois:**
```javascript
<div>
  <p className="text-xs text-gray-500 mb-1">Empresa</p>
  <p className="font-semibold text-gray-900">{empresa.nome}</p>
</div>
```

**Resultado:** O código gerado automaticamente não é mais exibido na lista de empresas.

---

### 2. Campo "Cadastro Empresa" em Pedidos (`adm/dashboard`)

**Arquivo:** `client/src/pages/admin/AdminDashboard.jsx`  
**Linha:** 3615

**Antes:**
```javascript
<strong>Cadastro Empresa:</strong> {pedido.funcionarios?.empresas?.cadastro_empresa || pedido.funcionarios?.cadastro_empresa || 'N/A'}
```

**Depois:**
```javascript
<strong>Cadastro Empresa:</strong> {pedido.funcionarios?.cadastro_empresa || 'N/A'}
```

**Resultado:** Exibe apenas o `cadastro_empresa` vinculado ao funcionário, não o código da tabela empresas.

---

### 3. Campo "Clube" em Pedidos (`adm/dashboard`)

**Arquivo:** `client/src/pages/admin/AdminDashboard.jsx`  
**Linha:** 3618

**Antes:**
```javascript
<strong>Clube:</strong> {pedido.funcionarios?.clubes?.nome ? String(pedido.funcionarios.clubes.nome).trim() : 'N/A'}
```

**Depois:**
```javascript
<strong>Clube:</strong> {pedido.funcionarios?.cadastro_clube || 'N/A'}
```

**Resultado:** Exibe o `cadastro_clube` vinculado ao funcionário na linha "Clube".

---

### 4. Função de Impressão de Pedidos

**Arquivo:** `client/src/pages/admin/AdminDashboard.jsx`  
**Linha:** 704

**Antes:**
```javascript
cadastroEmpresa: pedido.funcionarios?.empresas?.cadastro_empresa || 'N/A',
```

**Depois:**
```javascript
cadastroEmpresa: pedido.funcionarios?.cadastro_empresa || 'N/A',
```

**Resultado:** A impressão também usa o `cadastro_empresa` do funcionário.

---

## 📊 ESTRUTURA DE DADOS

### Tabela `funcionarios`
```sql
- nome_completo
- cadastro_empresa      ← Cadastro vinculado ao funcionário (EXIBIDO)
- cadastro_clube        ← Cadastro vinculado ao funcionário (EXIBIDO)
- empresa_id
- clube_id
```

### Tabela `empresas`
```sql
- id
- nome
- cadastro_empresa      ← Código gerado automaticamente (NÃO EXIBIDO)
```

### Tabela `clubes`
```sql
- id
- nome
- cadastro_clube        ← Código gerado automaticamente (NÃO EXIBIDO na linha "Clube")
```

---

## 🔄 QUERY DO BACKEND

**Arquivo:** `server/routes/admin.js`  
**Linha:** 1505-1512

A query do Supabase busca os dados necessários:

```javascript
funcionarios (
  nome_completo,
  cadastro_empresa,      // ← Usado para exibição
  cadastro_clube,        // ← Usado para exibição
  empresa_id,
  clube_id,
  empresas (id, nome, cadastro_empresa),  // cadastro_empresa aqui NÃO é usado
  clubes (nome, cadastro_clube)          // cadastro_clube aqui NÃO é usado na linha "Clube"
)
```

---

## 📍 LOCAIS DE EXIBIÇÃO

### `adm/dashboard` - Pedidos

1. **Funcionário:** `pedido.funcionarios?.nome_completo || 'N/A'`
2. **Empresa:** `pedido.funcionarios?.empresas?.nome || 'N/A'`
3. **Cadastro Empresa:** `pedido.funcionarios?.cadastro_empresa || 'N/A'` ✅
4. **Clube:** `pedido.funcionarios?.cadastro_clube || 'N/A'` ✅
5. **Cadastro Clube:** `pedido.funcionarios?.clubes?.cadastro_clube || 'N/A'`

### `adm/dashboard` - Lista de Empresas

- **Empresa:** Apenas o nome (`empresa.nome`)
- **Código gerado:** Removido da exibição ✅

### `adm/gestor` - Pedidos

Mantida a lógica original com fallback:
- **Cadastro Empresa:** `pedido.funcionarios?.empresas?.cadastro_empresa || pedido.funcionarios?.cadastro_empresa || 'N/A'`
- **Clube:** `pedido.funcionarios?.clubes?.nome || 'N/A'`

---

## 🎯 REGRAS DE NEGÓCIO

1. **Cadastro Empresa em Pedidos:**
   - ✅ Exibe `funcionarios.cadastro_empresa` (cadastro vinculado ao funcionário)
   - ❌ NÃO exibe `empresas.cadastro_empresa` (código gerado automaticamente)

2. **Clube em Pedidos:**
   - ✅ Exibe `funcionarios.cadastro_clube` (cadastro vinculado ao funcionário)
   - ❌ NÃO exibe `clubes.nome` (nome do clube da tabela)

3. **Lista de Empresas:**
   - ✅ Exibe apenas o nome da empresa
   - ❌ NÃO exibe o código gerado automaticamente

4. **Cadastro Clube em Pedidos:**
   - Mantido: `pedido.funcionarios?.clubes?.cadastro_clube` (código do clube, se disponível)

---

## 🔧 ARQUIVOS MODIFICADOS

1. `client/src/pages/admin/AdminDashboard.jsx`
   - Linha 2013: Removida exibição do código gerado na lista de empresas
   - Linha 3615: Alterado para usar `cadastro_empresa` do funcionário
   - Linha 3618: Alterado para usar `cadastro_clube` do funcionário
   - Linha 704: Alterado para usar `cadastro_empresa` do funcionário na impressão

2. `client/src/pages/admin/ManagerDashboard.jsx`
   - Mantida lógica original (não modificada)

3. `server/routes/admin.js`
   - Query mantida para buscar todos os campos necessários

---

## ✅ VALIDAÇÕES

### Campos Obrigatórios
- `funcionarios.cadastro_empresa` - Campo obrigatório, sempre deve ter valor
- `funcionarios.cadastro_clube` - Campo obrigatório, sempre deve ter valor

### Fallback
- Se `cadastro_empresa` ou `cadastro_clube` não estiverem disponíveis, exibe `'N/A'`

---

## 📝 NOTAS IMPORTANTES

1. **Diferença entre `adm/dashboard` e `adm/gestor`:**
   - `adm/dashboard`: Usa apenas `funcionarios.cadastro_empresa` e `funcionarios.cadastro_clube`
   - `adm/gestor`: Mantém fallback para `empresas.cadastro_empresa` e `clubes.nome`

2. **Códigos Gerados Automaticamente:**
   - São gerados no backend quando uma empresa/clube é criada sem cadastro
   - Formato: `NOMENORMALIZADO + TIMESTAMP`
   - Exemplo: `TESTE2754074`, `ATLETICOSOSO525294`
   - **NÃO devem ser exibidos para o usuário**

3. **Cadastros Vinculados aos Funcionários:**
   - São preenchidos manualmente ou via upload de Excel
   - São os valores relevantes para o usuário
   - **DEVEM ser exibidos**

---

## 🚀 COMMIT GIT

**Commit:** `1205123`  
**Mensagem:** "Correção: Exibir cadastro_empresa e cadastro_clube vinculados ao funcionário em vez de códigos gerados automaticamente"

**Arquivos commitados:**
- `client/src/pages/admin/AdminDashboard.jsx`
- `client/src/pages/admin/ManagerDashboard.jsx`
- `server/routes/admin.js`

---

## 🔍 TESTES RECOMENDADOS

1. ✅ Verificar se "Cadastro Empresa" em pedidos mostra o cadastro do funcionário
2. ✅ Verificar se "Clube" em pedidos mostra o cadastro do funcionário
3. ✅ Verificar se a lista de empresas não mostra códigos gerados
4. ✅ Verificar se a impressão de pedidos usa os cadastros corretos
5. ✅ Comparar com `adm/gestor` para garantir consistência

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas:
1. Verificar se os dados estão sendo retornados corretamente pela API
2. Verificar se os campos `funcionarios.cadastro_empresa` e `funcionarios.cadastro_clube` estão preenchidos
3. Verificar o console do navegador para erros
4. Verificar os logs do backend

---

**Documento criado em:** 2024  
**Última atualização:** 2024  
**Versão:** 1.0

