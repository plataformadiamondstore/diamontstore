# 🔒 PROTEÇÃO DO FLUXO DE STATUS DOS PEDIDOS

## ⚠️ CÓDIGO PROTEGIDO - NUNCA ALTERAR

Este documento define as regras **CRÍTICAS** e **IMUTÁVEIS** do fluxo de status dos pedidos. **QUALQUER ALTERAÇÃO NESTE FLUXO DEVE SER APROVADA ANTES DE SER IMPLEMENTADA**.

---

## 🚫 REGRAS IMUTÁVEIS

### 1. STATUS É POR ITEM, NÃO POR PEDIDO

**REGRA:** O status do pedido (`pedidos.status`) **NUNCA** deve ser atualizado automaticamente.

**IMPLEMENTAÇÃO:**
- ✅ Apenas os itens (`pedido_itens.status`) têm status
- ❌ **NUNCA** atualizar `pedidos.status` nas rotas de aprovação/rejeição
- ✅ Filtros e exibição são baseados nos status dos itens

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO - Atualizar apenas itens
await supabase
  .from('pedido_itens')
  .update({ status: 'aguardando aprovação de estoque' })
  .eq('pedido_id', req.params.id);

// ❌ ERRADO - NUNCA fazer isso
await supabase
  .from('pedidos')
  .update({ status: 'aguardando aprovação de estoque' })
  .eq('id', req.params.id);
```

**LOCALIZAÇÃO:**
- `server/routes/admin.js` - Todas as rotas de aprovação/rejeição
- Comentário: `// NÃO atualizar status do pedido - status fica apenas nos itens`

---

### 2. FLUXO DE APROVAÇÃO DO GESTOR

**REGRA:** Gestor aprova itens pendentes para `aguardando aprovação de estoque`.

**IMPLEMENTAÇÃO:**
- Rota: `PUT /admin/pedidos/:id/aprovar`
- Atualiza apenas itens com status `pendente` ou `null`
- **NÃO reduz estoque**
- **NÃO atualiza status do pedido**

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
router.put('/pedidos/:id/aprovar', async (req, res) => {
  // Atualizar apenas itens pendentes
  await supabase
    .from('pedido_itens')
    .update({ status: 'aguardando aprovação de estoque' })
    .eq('pedido_id', req.params.id)
    .in('status', ['pendente', null]);
  
  // NÃO atualizar status do pedido
  // NÃO reduzir estoque
});
```

**LOCALIZAÇÃO:**
- `server/routes/admin.js` linha ~1551-1594

---

### 3. FLUXO DE APROVAÇÃO DO ADMIN

**REGRA:** Admin aprova itens para `Produto autorizado` e reduz estoque.

**IMPLEMENTAÇÃO:**
- Rota: `PUT /admin/pedidos/:id/aprovar-admin` (todos)
- Rota: `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` (individual)
- Atualiza itens de `aguardando aprovação de estoque` para `Produto autorizado`
- **Reduz estoque automaticamente**
- **NÃO atualiza status do pedido**

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
if (novoStatus === 'Produto autorizado' && itemAtual.produto_id) {
  // Reduzir estoque
  const novoEstoque = Math.max(0, (produto.estoque || 0) - (itemAtual.quantidade || 0));
  await supabase
    .from('produtos')
    .update({ 
      estoque: novoEstoque,
      ativo: novoEstoque > 0
    })
    .eq('id', itemAtual.produto_id);
}
```

**LOCALIZAÇÃO:**
- `server/routes/admin.js` linha ~1597-1650 (aprovar-admin)
- `server/routes/admin.js` linha ~1733-1804 (aprovar item individual)

---

### 4. EXCLUSÃO DE ITENS

**REGRA:** Se item autorizado for excluído, estoque deve ser devolvido.

**IMPLEMENTAÇÃO:**
- Rota: `DELETE /admin/pedidos/:pedidoId/itens/:itemId`
- Verifica se item estava `Produto autorizado`
- **Devolve estoque** se estava autorizado
- Remove item do pedido

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
if (itemAtual.status === 'Produto autorizado' && itemAtual.produto_id) {
  // Devolver estoque
  const novoEstoque = (produto.estoque || 0) + (itemAtual.quantidade || 0);
  await supabase
    .from('produtos')
    .update({ 
      estoque: novoEstoque,
      ativo: novoEstoque > 0
    })
    .eq('id', itemAtual.produto_id);
}
```

**LOCALIZAÇÃO:**
- `server/routes/admin.js` linha ~1871-1924

---

### 5. FILTROS BASEADOS EM ITENS

**REGRA:** Filtros e contadores são calculados baseados nos status dos itens, não do pedido.

**IMPLEMENTAÇÃO:**
- Cards de filtro verificam `pedido.pedido_itens[].status`
- Um pedido pode aparecer em múltiplos cards se tiver itens com status diferentes

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
const pedidosAprovados = todosPedidos.filter(p => {
  if (!p.pedido_itens || p.pedido_itens.length === 0) return false;
  return p.pedido_itens.some(item => 
    item.status === 'Produto autorizado' || item.status === 'aprovado'
  );
});
```

**LOCALIZAÇÃO:**
- `client/src/pages/admin/ManagerDashboard.jsx` linha ~393-418

---

### 6. EXIBIÇÃO DE STATUS POR ITEM

**REGRA:** Status é exibido por item, não por pedido.

**IMPLEMENTAÇÃO:**
- Cada item mostra seu próprio status com badge colorido
- Status do pedido não é mais exibido
- Funções `getStatusColor()` e `getStatusText()` formatam status dos itens

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
{pedido.pedido_itens?.map((item) => {
  const itemStatus = item.status || 'pendente';
  return (
    <span className={getStatusColor(itemStatus)}>
      {getStatusText(itemStatus)}
    </span>
  );
})}
```

**LOCALIZAÇÃO:**
- `client/src/pages/admin/ManagerDashboard.jsx` linha ~640-656
- `client/src/pages/admin/AdminDashboard.jsx` linha ~3651-3655
- `client/src/pages/Orders.jsx` linha ~172-174

---

### 7. BOTÕES DE AÇÃO APENAS POR ITEM

**REGRA:** Botões Aprovar/Rejeitar/Excluir aparecem apenas por item, não por pedido.

**IMPLEMENTAÇÃO:**
- Botões aparecem ao lado de cada item individual
- Condição: item com status `pendente`, `verificando estoque` ou `aguardando aprovação de estoque`
- **NÃO há botões de ação no nível do pedido** (exceto gestor que pode aprovar pedido inteiro)

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO - Botões por item
{(itemStatus === 'pendente' || itemStatus === 'verificando estoque' || itemStatus === 'aguardando aprovação de estoque') && (
  <div className="flex gap-2">
    <button onClick={() => aprovarItem(item.id)}>Aprovar</button>
    <button onClick={() => rejeitarItem(item.id)}>Rejeitar</button>
    <button onClick={() => excluirItem(item.id)}>Excluir</button>
  </div>
)}
```

**LOCALIZAÇÃO:**
- `client/src/pages/admin/AdminDashboard.jsx` linha ~3668-3714

---

### 8. GESTOR APROVA PEDIDO INTEIRO

**REGRA:** Gestor pode aprovar pedido inteiro, mas verifica itens pendentes.

**IMPLEMENTAÇÃO:**
- Botão aparece se houver itens pendentes
- Condição: `pedido.pedido_itens?.some(item => !item.status || item.status === 'pendente' || item.status === 'verificando estoque')`
- **NÃO verifica status do pedido**

**CÓDIGO PROTEGIDO:**
```javascript
// ✅ CORRETO
{pedido.pedido_itens?.some(item => 
  !item.status || item.status === 'pendente' || item.status === 'verificando estoque'
) && (
  <button onClick={() => handleAprovar(pedido.id)}>Aprovar</button>
)}
```

**LOCALIZAÇÃO:**
- `client/src/pages/admin/ManagerDashboard.jsx` linha ~669-686

---

## 📋 STATUS POSSÍVEIS DOS ITENS

| Status | Descrição | Quando Ocorre | Pode Aprovar? |
|--------|-----------|---------------|---------------|
| `pendente` | Item aguardando aprovação | Pedido criado | ✅ Sim |
| `verificando estoque` | (Legado) | (Legado) | ✅ Sim |
| `aguardando aprovação de estoque` | Aprovado pelo gestor | Gestor aprovou | ✅ Sim (Admin) |
| `Produto autorizado` | Aprovado e estoque reduzido | Admin aprovou | ❌ Não |
| `rejeitado` | Item rejeitado | Admin rejeitou | ❌ Não |
| `produto sem estoque` | Sem estoque disponível | Sistema detectou | ❌ Não |

---

## 🔄 FLUXO COMPLETO (NUNCA ALTERAR)

```
1. PEDIDO CRIADO
   └─ Itens: pendente
   
2. GESTOR APROVA
   └─ Itens: aguardando aprovação de estoque
   └─ Estoque: NÃO reduzido
   └─ Status pedido: NÃO alterado
   
3. ADMIN APROVA
   └─ Itens: Produto autorizado
   └─ Estoque: REDUZIDO
   └─ Status pedido: NÃO alterado
   
4. FINALIZADO
```

**Alternativas:**
- Admin rejeita → Itens: rejeitado (sem reduzir estoque)
- Admin exclui → Item removido (estoque devolvido se estava autorizado)

---

## ⚠️ CHECKLIST ANTES DE QUALQUER ALTERAÇÃO

Antes de modificar qualquer código relacionado a status de pedidos, verifique:

- [ ] Status do pedido não será atualizado automaticamente?
- [ ] Apenas itens serão atualizados?
- [ ] Estoque será reduzido apenas quando item for autorizado?
- [ ] Estoque será devolvido se item autorizado for excluído?
- [ ] Filtros continuam baseados em status dos itens?
- [ ] Exibição continua por item?
- [ ] Botões de ação continuam apenas por item?

**Se qualquer resposta for "NÃO", a alteração NÃO deve ser feita sem aprovação.**

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `FLUXO_STATUS_PEDIDOS.md` - Documentação completa do fluxo
- `SOLUCAO_PROBLEMAS_PEDIDOS_GESTOR.md` - Solução de problemas anteriores
- `INVENTARIO_CODIGO_PROTEGIDO.md` - Proteção do código de inventário

---

## 🔒 GARANTIAS

Este fluxo foi implementado após múltiplas iterações e correções. **QUALQUER ALTERAÇÃO DEVE:**

1. Manter status por item (não por pedido)
2. Manter redução de estoque apenas na autorização
3. Manter devolução de estoque na exclusão de itens autorizados
4. Manter filtros baseados em itens
5. Manter exibição por item
6. Manter botões de ação apenas por item

**Se estas garantias não forem mantidas, o sistema pode quebrar completamente.**

---

**Data de Criação:** 2025-01-27  
**Última Atualização:** 2025-01-27  
**Versão:** 1.0  
**Status:** 🔒 PROTEGIDO

