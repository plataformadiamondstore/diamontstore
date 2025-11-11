# 🔒 INVENTÁRIO DE CÓDIGO PROTEGIDO - NUNCA DELETAR

**ESTE ARQUIVO É UMA TRAVA DE SEGURANÇA CRÍTICA**
**QUALQUER CÓDIGO LISTADO AQUI NÃO PODE SER REMOVIDO SEM AUTORIZAÇÃO EXPLÍCITA DO USUÁRIO**

## ⚠️ REGRA ABSOLUTA

**SE VOCÊ (ASSISTENTE) ESTIVER PRESTES A REMOVER QUALQUER CÓDIGO LISTADO AQUI:**
1. **PARE IMEDIATAMENTE**
2. **PERGUNTE AO USUÁRIO PRIMEIRO**
3. **AGUARDE AUTORIZAÇÃO EXPLÍCITA**
4. **SE HOUVER DÚVIDA → NÃO REMOVA**

---

## 📋 FUNCIONALIDADES CRÍTICAS PROTEGIDAS

### 1. SISTEMA DE ESTOQUE
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

#### Frontend (`client/src/pages/admin/AdminDashboard.jsx`):
- ✅ Campo `estoque` no `produtoForm` (linha ~54)
- ✅ Campo `estoque` no `editProdutoForm` (linha ~78)
- ✅ Validação de estoque obrigatório (linha ~833)
- ✅ Envio de estoque no formulário (linha ~869)
- ✅ Exibição de estoque no card de produtos (linha ~2313-2314)
- ✅ Campo de estoque no formulário de edição (linha ~2628)
- ✅ Campo de estoque no formulário de criação (linha ~3152)

#### Backend (`server/routes/admin.js`):
- ✅ Lógica de redução de estoque ao aprovar item (linha ~1633)
- ✅ Atualização de `ativo` baseado em estoque (linha ~1634-1641)

#### Banco de Dados:
- ✅ Coluna `estoque` na tabela `produtos`

---

### 2. BOTÃO ON/OFF PARA DESATIVAR PRODUTOS
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

#### Frontend (`client/src/pages/admin/AdminDashboard.jsx`):
- ✅ Função `handleToggleAtivo` (linha ~1035-1050)
- ✅ Botão toggle no card de produtos (linha ~2321)
- ✅ Badge "DESABILITADO" quando `ativo = false`

#### Backend (`server/routes/admin.js`):
- ✅ Rota `PUT /admin/produtos/:id/toggle-ativo` (linha ~1412-1434)
- ✅ Rota `GET /admin/produtos` que retorna TODOS produtos (linha ~1339-1409)

---

### 3. LAYOUT DA TELA DE EDIÇÃO DE PRODUTOS
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

**Ordem obrigatória:**
1. Imagens no topo
2. Card de upload abaixo das imagens
3. Campos do formulário abaixo do upload
4. Seção de variações com botões

**Localização**: `client/src/pages/admin/AdminDashboard.jsx` (seção de edição)

---

### 4. SISTEMA DE STATUS DE PEDIDOS POR ITEM
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

#### Frontend (`client/src/pages/admin/AdminDashboard.jsx`):
- ✅ Botões de aprovar/rejeitar por item (linha ~3701-3730)
- ✅ Exibição de status por item com badges coloridos
- ✅ Status "verificando estoque" (intermediário)
- ✅ Status "produto sem estoque"

#### Backend (`server/routes/admin.js`):
- ✅ Rota `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` (linha ~1585-1651)
- ✅ Rota `PUT /admin/pedidos/:pedidoId/itens/:itemId/rejeitar` (linha ~1653-1682)
- ✅ Lógica de transição de status:
  - `pendente` → `verificando estoque` → `aprovado`
  - `verificando estoque` → `produto sem estoque` (rejeitar)

#### Banco de Dados:
- ✅ Coluna `status` na tabela `pedido_itens`

---

### 5. CAMPOS OBRIGATÓRIOS DE PRODUTOS
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

Todos estes campos DEVEM estar presentes e validados:

1. ✅ **Nome** - obrigatório
2. ✅ **Preço** - obrigatório
3. ✅ **SKU** - obrigatório
4. ✅ **EAN** - obrigatório
5. ✅ **Categoria** - obrigatória
6. ✅ **Marca** - obrigatória
7. ✅ **Estoque** - obrigatório
8. ✅ **Descrição** - obrigatória
9. ✅ **Mínimo 3 imagens** - obrigatório
10. ✅ **Variações** - opcional

**Localização**: `client/src/pages/admin/AdminDashboard.jsx` (validações e formulários)

---

### 6. FUNCIONALIDADES DE IMPRESSÃO DE PEDIDOS
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

#### Frontend (`client/src/pages/admin/AdminDashboard.jsx`):
- ✅ Função `handleImprimirPorProduto` (linha ~580+)
- ✅ Cálculo de `valorTotalPedido` (linha ~595)
- ✅ Cálculo de `subtotal` por item (linha ~609)
- ✅ Colunas na tabela de impressão:
  - Produto
  - SKU
  - Variação
  - Quantidade
  - **Preço Unit.** (linha ~728)
  - **Subtotal** (linha ~729)

**IMPORTANTE**: As colunas de Preço Unit. e Subtotal DEVEM estar presentes na impressão.

---

### 7. TELAS DO SISTEMA
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

Todas estas telas DEVEM existir:

1. ✅ `/` - Login (funcionário) - `client/src/pages/Login.jsx`
2. ✅ `/produtos` - Lista de produtos - `client/src/pages/Products.jsx`
3. ✅ `/carrinho` - Carrinho de compras - `client/src/pages/Cart.jsx`
4. ✅ `/pedidos` - Pedidos do funcionário - `client/src/pages/Orders.jsx`
5. ✅ `/adm` - Login admin/gestor - `client/src/pages/admin/AdminLogin.jsx`
6. ✅ `/adm/dashboard` - Dashboard admin - `client/src/pages/admin/AdminDashboard.jsx`
7. ✅ `/adm/gestor` - Dashboard gestor - `client/src/pages/admin/ManagerDashboard.jsx`

**Localização**: `client/src/App.jsx` (rotas)

---

### 8. ROTAS DA API DO BACKEND
**Status**: 🔴 CRÍTICO - NUNCA REMOVER

Todas estas rotas DEVEM existir:

#### `server/routes/auth.js`:
- ✅ `POST /auth/employee` - Login funcionário
- ✅ `POST /auth/admin` - Login admin/gestor

#### `server/routes/products.js`:
- ✅ `GET /products` - Listar produtos (com filtro `ativo = true`)

#### `server/routes/cart.js`:
- ✅ `GET /cart` - Listar carrinho
- ✅ `POST /cart` - Adicionar ao carrinho
- ✅ `DELETE /cart/:id` - Remover do carrinho

#### `server/routes/orders.js`:
- ✅ `POST /orders` - Criar pedido
- ✅ `GET /orders` - Listar pedidos do funcionário

#### `server/routes/admin.js`:
- ✅ `GET /admin/pedidos` - Listar pedidos (admin)
- ✅ `PUT /admin/pedidos/:id/aprovar` - Aprovar pedido
- ✅ `PUT /admin/pedidos/:id/rejeitar` - Rejeitar pedido
- ✅ `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` - Aprovar item
- ✅ `PUT /admin/pedidos/:pedidoId/itens/:itemId/rejeitar` - Rejeitar item
- ✅ `GET /admin/produtos` - Listar TODOS produtos (incluindo desabilitados)
- ✅ `POST /admin/produtos` - Criar produto
- ✅ `PUT /admin/produtos/:id` - Editar produto
- ✅ `PUT /admin/produtos/:id/toggle-ativo` - Toggle ativo/inativo
- ✅ `DELETE /admin/produtos/:id` - Deletar produto
- ✅ `GET /admin/cadastros/categorias` - Listar categorias
- ✅ `POST /admin/cadastros/categorias` - Criar categoria
- ✅ `DELETE /admin/cadastros/categorias/:id` - Deletar categoria
- ✅ `GET /admin/cadastros/marcas` - Listar marcas
- ✅ `POST /admin/cadastros/marcas` - Criar marca
- ✅ `DELETE /admin/cadastros/marcas/:id` - Deletar marca
- ✅ `GET /admin/cadastros/tamanhos` - Listar tamanhos
- ✅ `POST /admin/cadastros/tamanhos` - Criar tamanho
- ✅ `DELETE /admin/cadastros/tamanhos/:id` - Deletar tamanho

---

## 🔍 COMO VERIFICAR SE ALGO FOI REMOVIDO

### Antes de qualquer commit:
1. Execute: `node scripts/verificar-codigo-protegido.js`
2. Verifique se todas as funcionalidades estão presentes
3. Se algo estiver faltando → **NÃO FAÇA COMMIT**

### Verificação manual:
1. Abra este arquivo
2. Verifique cada item listado
3. Confirme que o código ainda existe
4. Se algo estiver faltando → **RESTAURE DO GIT**

---

## 📝 HISTÓRICO DE PERDAS (PARA REFERÊNCIA)

**NUNCA REPITA ESTES ERROS:**

- ❌ Remoção de campos de formulário sem autorização
- ❌ Remoção de validações sem autorização
- ❌ Remoção de rotas da API sem autorização
- ❌ Remoção de funcionalidades de estoque sem autorização
- ❌ Remoção de botões e controles sem autorização

---

## 🚨 ALERTA FINAL

**SE VOCÊ ESTÁ LENDO ISSO E ESTÁ PRESTES A REMOVER CÓDIGO:**

1. **PARE AGORA**
2. **LEIA ESTE ARQUIVO COMPLETO**
3. **VERIFIQUE SE O CÓDIGO ESTÁ NESTA LISTA**
4. **SE ESTIVER → NÃO REMOVA**
5. **PERGUNTE AO USUÁRIO PRIMEIRO**
6. **AGUARDE AUTORIZAÇÃO EXPLÍCITA**

**LEMBRE-SE: O USUÁRIO JÁ PERDEU MUITAS FUNCIONALIDADES POR REMOÇÕES NÃO AUTORIZADAS.**

---

**ÚLTIMA ATUALIZAÇÃO**: 2025-01-27
**VERSÃO**: 2.0
**STATUS**: 🔴 ATIVO - PROTEÇÃO MÁXIMA

