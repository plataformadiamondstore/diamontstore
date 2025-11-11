# 📋 FLUXO COMPLETO DE STATUS DOS PEDIDOS

## 📌 Visão Geral

O sistema de pedidos utiliza uma **lógica de status por item**, onde cada produto dentro de um pedido tem seu próprio status independente. O status do pedido em si não é mais atualizado automaticamente - apenas os itens têm status.

---

## 🔄 Fluxo Completo de Status

### 1. **PEDIDO CRIADO** (Status Inicial)

**Quando:** Funcionário cria um novo pedido

**Status dos Itens:** `pendente` (ou `null`)

**Onde aparece:**
- ✅ Tela do funcionário (`/pedidos`) - mostra "Pendente"
- ✅ Tela do gestor (`/adm/gestor`) - aparece no card "Pendentes"
- ✅ Tela do admin (`/adm/dashboard`) - aparece na lista de pedidos

**Ações disponíveis:**
- Gestor pode aprovar ou rejeitar o pedido inteiro
- Admin pode aprovar/rejeitar/excluir itens individuais

---

### 2. **GESTOR APROVA O PEDIDO**

**Rota:** `PUT /admin/pedidos/:id/aprovar`

**O que acontece:**
1. Todos os itens com status `pendente` ou `null` são atualizados para `aguardando aprovação de estoque`
2. **Status do pedido NÃO é alterado** (fica como está)
3. Estoque ainda não é reduzido

**Status dos Itens:** `aguardando aprovação de estoque`

**Onde aparece:**
- ✅ Tela do funcionário - mostra "Verificando Estoque"
- ✅ Tela do gestor - aparece no card "Aguardando Aprovação"
- ✅ Tela do admin - aparece na lista com itens aguardando aprovação

**Ações disponíveis:**
- Admin pode aprovar/rejeitar/excluir itens individuais
- Gestor não pode mais aprovar (já foi aprovado)

---

### 3. **ADMIN APROVA ITEM(S)**

**Rota:** `PUT /admin/pedidos/:id/aprovar-admin` (todos os itens)  
**Rota:** `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` (item individual)

**O que acontece:**
1. Itens com status `aguardando aprovação de estoque` são atualizados para `Produto autorizado`
2. **Estoque é reduzido** automaticamente:
   - `novoEstoque = estoqueAtual - quantidadeDoItem`
   - Se `novoEstoque <= 0`, produto fica `ativo = false`
3. **Status do pedido NÃO é alterado** (fica como está)

**Status dos Itens:** `Produto autorizado`

**Onde aparece:**
- ✅ Tela do funcionário - mostra "Produto autorizado"
- ✅ Tela do gestor - aparece no card "Aprovados" (se todos os itens foram autorizados)
- ✅ Tela do admin - item mostra status "AUTORIZADO" (verde)

**Ações disponíveis:**
- Botão "Imprimir" aparece quando há pelo menos um item autorizado
- Item pode ser excluído (estoque é devolvido se estava autorizado)

---

### 4. **ADMIN REJEITA ITEM**

**Rota:** `PUT /admin/pedidos/:pedidoId/itens/:itemId/rejeitar`

**O que acontece:**
1. Item é atualizado para status `rejeitado`
2. Estoque **NÃO é reduzido**
3. **Status do pedido NÃO é alterado**

**Status dos Itens:** `rejeitado`

**Onde aparece:**
- ✅ Tela do funcionário - mostra "Sem estoque" (vermelho) ⚠️ **Exibido como "Sem estoque"**
- ✅ Tela do gestor - aparece no card "Sem estoque" (renomeado de "Rejeitados")
- ✅ Tela do admin - item mostra status "REJEITADO" (vermelho)

---

### 5. **ADMIN EXCLUI ITEM**

**Rota:** `DELETE /admin/pedidos/:pedidoId/itens/:itemId`

**O que acontece:**
1. Se o item estava com status `Produto autorizado`:
   - **Estoque é devolvido**: `novoEstoque = estoqueAtual + quantidadeDoItem`
   - Produto volta a ficar `ativo = true` se estoque > 0
2. Item é removido do pedido
3. **Status do pedido NÃO é alterado**

---

## 📊 Cards de Filtro no Gestor

Os cards são calculados baseados nos **status dos itens**, não do pedido:

### **Pendentes**
- Pedidos que têm pelo menos um item com status `pendente` ou `null`

### **Aguardando Aprovação**
- Pedidos que têm pelo menos um item com status:
  - `aguardando aprovação de estoque`
  - `verificando estoque`

### **Aprovados**
- Pedidos que têm pelo menos um item com status:
  - `Produto autorizado`
  - `aprovado`

### **Sem estoque** (anteriormente "Rejeitados")
- Pedidos que têm pelo menos um item com status `rejeitado`
- **Card renomeado:** "Rejeitados" → "Sem estoque"
- **Filtro inteligente:** Ao expandir pedido, mostra apenas produtos rejeitados (sem estoque)

### **Produto Sem Estoque**
- Pedidos que têm pelo menos um item com status `produto sem estoque`

**Layout dos Cards:**
- Todos os 5 cards ficam em uma única linha (grid-cols-5)
- Cards: Todos Pedidos | Pendentes | Aguardando Aprovação | Aprovados | Sem estoque

**Filtros Inteligentes:**
- **Card "Sem estoque":** Ao expandir pedido, mostra apenas produtos com status `rejeitado`
- **Card "Aprovados":** Ao expandir pedido, mostra apenas produtos aprovados (oculta rejeitados)
- **Sem filtro:** Mostra todos os produtos do pedido

---

## 🎨 Exibição de Status

### Tela do Funcionário (`/pedidos`)

**Status exibidos por item:**
- `pendente` → "Pendente" (amarelo)
- `verificando estoque` → "Verificando Estoque" (azul)
- `aguardando aprovação de estoque` → "Verificando Estoque" (azul)
- `Produto autorizado` → "Produto autorizado" (verde)
- `rejeitado` → "Sem estoque" (vermelho) ⚠️ **Exibido como "Sem estoque" ao invés de "Rejeitado"**
- `produto sem estoque` → "Produto Sem Estoque" (laranja)

**Observação:** Status do pedido não é mais exibido, apenas dos itens.

### Tela do Gestor (`/adm/gestor`)

**Status exibidos por item:**
- Mesmos status da tela do funcionário
- Badge colorido ao lado de cada produto
- `rejeitado` → "Sem estoque" (vermelho) ⚠️ **Exibido como "Sem estoque" ao invés de "Rejeitado"**

**Cards de filtro (5 cards em linha única):**
- **Todos Pedidos:** Mostra todos os pedidos
- **Pendentes:** Pedidos com itens pendentes
- **Aguardando Aprovação:** Pedidos com itens aguardando aprovação
- **Aprovados:** Pedidos com itens aprovados
- **Sem estoque:** Pedidos com itens rejeitados (renomeado de "Rejeitados")
- Baseados nos status dos itens
- Um pedido pode aparecer em múltiplos cards se tiver itens com status diferentes

**Filtros Inteligentes ao Expandir Pedido:**
- **Card "Sem estoque" ativo:** Mostra apenas produtos rejeitados (sem estoque)
- **Card "Aprovados" ativo:** Mostra apenas produtos aprovados (oculta rejeitados)
- **Outros filtros ou sem filtro:** Mostra todos os produtos do pedido

### Tela do Admin (`/adm/dashboard`)

**Status exibidos por item:**
- `pendente` → "PENDENTE" (amarelo)
- `verificando estoque` → "VERIFICANDO ESTOQUE" (azul)
- `aguardando aprovação de estoque` → "AGUARDANDO APROVAÇÃO" (azul)
- `Produto autorizado` → "AUTORIZADO" (verde)
- `rejeitado` → "REJEITADO" (vermelho)
- `produto sem estoque` → "SEM ESTOQUE" (laranja)

**Botões de ação:**
- **Aprovar**: Aparece para itens com status `pendente`, `verificando estoque` ou `aguardando aprovação de estoque`
- **Rejeitar**: Aparece para itens com status `pendente`, `verificando estoque` ou `aguardando aprovação de estoque`
- **Excluir**: Aparece para itens com status `pendente`, `verificando estoque` ou `aguardando aprovação de estoque`

---

## 🔧 Detalhes Técnicos

### Backend - Rotas de Aprovação

#### 1. Gestor Aprova Pedido (`PUT /admin/pedidos/:id/aprovar`)

```javascript
// Atualiza TODOS os itens pendentes para "aguardando aprovação de estoque"
await supabase
  .from('pedido_itens')
  .update({ status: 'aguardando aprovação de estoque' })
  .eq('pedido_id', req.params.id)
  .in('status', ['pendente', null]);

// NÃO atualiza status do pedido
```

#### 2. Admin Aprova Todos os Itens (`PUT /admin/pedidos/:id/aprovar-admin`)

```javascript
// Atualiza itens "aguardando aprovação de estoque" para "Produto autorizado"
await supabase
  .from('pedido_itens')
  .update({ status: 'Produto autorizado' })
  .eq('pedido_id', req.params.id)
  .eq('status', 'aguardando aprovação de estoque');

// Reduz estoque de cada produto
for (const item of itens) {
  const novoEstoque = Math.max(0, estoqueAtual - quantidade);
  await supabase
    .from('produtos')
    .update({ estoque: novoEstoque, ativo: novoEstoque > 0 })
    .eq('id', item.produto_id);
}

// NÃO atualiza status do pedido
```

#### 3. Admin Aprova Item Individual (`PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar`)

```javascript
// Determina novo status baseado no status atual
let novoStatus;
if (statusAtual === 'pendente' || !statusAtual) {
  novoStatus = 'aguardando aprovação de estoque';
} else if (statusAtual === 'aguardando aprovação de estoque') {
  novoStatus = 'Produto autorizado';
} else {
  novoStatus = 'Produto autorizado';
}

// Atualiza item
await supabase
  .from('pedido_itens')
  .update({ status: novoStatus })
  .eq('id', itemId);

// Se mudou para "Produto autorizado", reduz estoque
if (novoStatus === 'Produto autorizado') {
  // Reduz estoque...
}

// NÃO atualiza status do pedido
```

#### 4. Admin Exclui Item (`DELETE /admin/pedidos/:pedidoId/itens/:itemId`)

```javascript
// Se item estava autorizado, devolve estoque
if (itemAtual.status === 'Produto autorizado') {
  const novoEstoque = estoqueAtual + quantidade;
  await supabase
    .from('produtos')
    .update({ estoque: novoEstoque, ativo: novoEstoque > 0 })
    .eq('id', itemAtual.produto_id);
}

// Remove item
await supabase
  .from('pedido_itens')
  .delete()
  .eq('id', itemId);
```

### Frontend - Filtros e Exibição

#### ManagerDashboard.jsx

**Filtro de status baseado em itens:**
```javascript
const pedidosAprovados = todosPedidos.filter(p => {
  if (!p.pedido_itens || p.pedido_itens.length === 0) return false;
  return p.pedido_itens.some(item => 
    item.status === 'Produto autorizado' || item.status === 'aprovado'
  );
});
```

**Exibição de status por item:**
```javascript
{pedido.pedido_itens?.map((item) => {
  const itemStatus = item.status || 'pendente';
  return (
    <div>
      <span className={getStatusColor(itemStatus)}>
        {getStatusText(itemStatus)}
      </span>
    </div>
  );
})}
```

**Filtro inteligente de itens ao expandir pedido:**
```javascript
{pedido.pedido_itens
  ?.filter(item => {
    // Se o filtro estiver ativo para "rejeitado", mostrar apenas itens rejeitados
    if (filters.status === 'rejeitado') {
      return item.status === 'rejeitado';
    }
    // Se o filtro estiver ativo para "aprovado", mostrar apenas itens aprovados (não mostrar rejeitados)
    if (filters.status === 'aprovado') {
      return item.status === 'Produto autorizado' || item.status === 'aprovado';
    }
    // Caso contrário, mostrar todos os itens
    return true;
  })
  ?.map((item) => {
    // Renderizar item...
  })}
```

#### Orders.jsx (Funcionário)

**Exibição de status por item:**
```javascript
{order.pedido_itens?.map((item) => {
  const itemStatus = item.status || 'pendente';
  return (
    <span className={getStatusColor(itemStatus)}>
      {getStatusText(itemStatus)}
    </span>
  );
})}
```

---

## 📝 Status Possíveis dos Itens

| Status | Descrição | Cor | Quando Ocorre |
|--------|-----------|-----|---------------|
| `pendente` | Item aguardando aprovação inicial | Amarelo | Pedido criado |
| `verificando estoque` | Item sendo verificado | Azul | (Legado - não usado mais) |
| `aguardando aprovação de estoque` | Aprovado pelo gestor, aguardando admin | Azul | Gestor aprovou |
| `Produto autorizado` | Item aprovado e estoque reduzido | Verde | Admin aprovou |
| `aprovado` | (Legado - não usado mais) | Verde | (Legado) |
| `rejeitado` | Item rejeitado (exibido como "Sem estoque") | Vermelho | Admin rejeitou |
| `produto sem estoque` | Produto sem estoque disponível | Laranja | Sistema detectou falta |

---

## ⚠️ Regras Importantes

### 1. Status do Pedido vs Status dos Itens

- **Status do pedido** não é mais atualizado automaticamente
- Apenas os **itens** têm status
- Filtros e exibição são baseados nos status dos itens

### 2. Redução de Estoque

- Estoque só é reduzido quando item muda para `Produto autorizado`
- Se item é excluído e estava autorizado, estoque é devolvido
- Produto fica `ativo = false` quando estoque chega a 0

### 3. Botões de Ação

- **Aprovar/Rejeitar/Excluir** aparecem apenas por item
- Não há mais botões de ação no nível do pedido
- Botões aparecem apenas para itens com status:
  - `pendente`
  - `verificando estoque`
  - `aguardando aprovação de estoque`

### 4. Normalização de Dados

- Função `normalizarDadosPedido()` trata arrays/objetos/null do Supabase
- Sempre usar esta função ao acessar `funcionarios`, `empresas`, `clubes`

### 5. Exibição de Status "Rejeitado"

- Status `rejeitado` é exibido como "Sem estoque" nas telas do funcionário e gestor
- Card "Rejeitados" foi renomeado para "Sem estoque" na tela do gestor
- Na tela do admin, continua mostrando "REJEITADO"

### 6. Filtros Inteligentes

- Quando um filtro de status está ativo, ao expandir um pedido, mostra apenas os itens relevantes:
  - **Filtro "Sem estoque":** Mostra apenas produtos rejeitados
  - **Filtro "Aprovados":** Mostra apenas produtos aprovados (oculta rejeitados)
  - **Sem filtro:** Mostra todos os produtos do pedido

### 7. Layout dos Cards

- Todos os 5 cards de filtro ficam em uma única linha (grid-cols-5)
- Layout responsivo mantido

### 8. Impressão de Pedidos

- **Removido:** Campo "Status" do pedido
- **Removido:** Coluna "Subtotal" na tabela de produtos
- **Mantido:** Produto, SKU, Variação, Quantidade, Preço Unit., Total do pedido

---

## 🔄 Diagrama de Fluxo

```
PEDIDO CRIADO
    ↓
[Itens: pendente]
    ↓
GESTOR APROVA
    ↓
[Itens: aguardando aprovação de estoque]
    ↓
ADMIN APROVA
    ↓
[Itens: Produto autorizado] + Estoque reduzido
    ↓
FINALIZADO
```

**Alternativas:**
- ADMIN REJEITA → [Itens: rejeitado] (sem reduzir estoque)
- ADMIN EXCLUI → Item removido (estoque devolvido se estava autorizado)

---

## 📚 Arquivos Modificados

### Backend
- `server/routes/admin.js`
  - Rota `PUT /admin/pedidos/:id/aprovar` (Gestor)
  - Rota `PUT /admin/pedidos/:id/aprovar-admin` (Admin - todos)
  - Rota `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` (Admin - item)
  - Rota `PUT /admin/pedidos/:pedidoId/itens/:itemId/rejeitar`
  - Rota `DELETE /admin/pedidos/:pedidoId/itens/:itemId`
  - Rota `GET /admin/pedidos` (filtro por empresa_id)

### Frontend
- `client/src/pages/admin/ManagerDashboard.jsx`
  - Filtros baseados em status dos itens
  - Exibição de status por item
  - Função de normalização de dados
  - Cards de filtro atualizados (5 cards em linha única)
  - Filtros inteligentes (mostra apenas itens relevantes ao expandir)
  - Card "Rejeitados" renomeado para "Sem estoque"
  - Status "rejeitado" exibido como "Sem estoque"
  - Impressão sem status do pedido e sem subtotal

- `client/src/pages/admin/AdminDashboard.jsx`
  - Botões de ação apenas por item
  - Exibição de status por item
  - Remoção de status do pedido

- `client/src/pages/Orders.jsx`
  - Exibição de status por item
  - Remoção de status do pedido
  - Status "rejeitado" exibido como "Sem estoque"

---

## ✅ Checklist de Implementação

- [x] Status gerenciado por item, não por pedido
- [x] Gestor aprova itens para "aguardando aprovação de estoque"
- [x] Admin aprova itens para "Produto autorizado"
- [x] Estoque reduzido apenas quando item é autorizado
- [x] Estoque devolvido quando item autorizado é excluído
- [x] Filtros baseados em status dos itens
- [x] Exibição de status por item em todas as telas
- [x] Botões de ação apenas por item
- [x] Remoção de status do pedido
- [x] Função de normalização de dados implementada
- [x] Documentação completa criada
- [x] Cards de filtro em linha única (5 colunas)
- [x] Filtros inteligentes ao expandir pedidos
- [x] Card "Rejeitados" renomeado para "Sem estoque"
- [x] Status "rejeitado" exibido como "Sem estoque" (funcionário e gestor)
- [x] Impressão sem status do pedido e sem subtotal

---

## 🎨 Layout e Interface

### Tela do Gestor (`/adm/gestor`)

**Cards de Filtro (5 cards em linha única):**
```
┌──────────────┬──────────┬─────────────────────┬───────────┬─────────────┐
│ Todos Pedidos│ Pendentes│ Aguardando Aprovação│ Aprovados │ Sem estoque │
│      2       │    0     │         0           │     2     │      0      │
└──────────────┴──────────┴─────────────────────┴───────────┴─────────────┘
```

**Comportamento dos Filtros:**
- **Todos Pedidos:** Mostra todos os pedidos com todos os produtos
- **Pendentes:** Mostra pedidos com itens pendentes, exibe todos os produtos ao expandir
- **Aguardando Aprovação:** Mostra pedidos aguardando, exibe todos os produtos ao expandir
- **Aprovados:** Mostra pedidos aprovados, ao expandir mostra **apenas produtos aprovados** (oculta rejeitados)
- **Sem estoque:** Mostra pedidos rejeitados, ao expandir mostra **apenas produtos rejeitados**

**Exibição de Itens ao Expandir:**
- Cada produto mostra: Nome, SKU, Variação, Quantidade, Preço Unit., Status
- Status exibido com badge colorido ao lado de cada produto
- Filtro ativo determina quais produtos são exibidos

### Impressão de Pedidos

**Campos exibidos:**
- Funcionário
- Empresa
- Cadastro Empresa (se houver)
- Clube
- Cadastro Clube (se houver)
- Data e hora
- **Tabela de produtos:**
  - Produto
  - SKU
  - Variação
  - Quantidade
  - Preço Unit.
- Total do pedido

**Campos removidos:**
- ❌ Status do pedido
- ❌ Subtotal por item

---

**Data de Criação:** 2025-01-27  
**Última Atualização:** 2025-01-27  
**Versão:** 2.0

