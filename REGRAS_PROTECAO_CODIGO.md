# 🔒 REGRAS DE PROTEÇÃO DO CÓDIGO

## ⚠️ ATENÇÃO: CÓDIGO PROTEGIDO

**NENHUMA FUNCIONALIDADE PODE SER ALTERADA OU DELETADA SEM AUTORIZAÇÃO EXPLÍCITA DO RESPONSÁVEL DO PROJETO.**

---

## 🚫 FUNCIONALIDADES PROTEGIDAS

### 1. FLUXO DE STATUS DOS PEDIDOS

**PROTEÇÃO:** Ver documento `PROTECAO_FLUXO_STATUS_PEDIDOS.md`

**REGRA:** Status é gerenciado por item, não por pedido. **NUNCA** alterar este fluxo sem autorização.

**CÓDIGO PROTEGIDO:**
- `server/routes/admin.js` - Rotas de aprovação/rejeição
- `client/src/pages/admin/ManagerDashboard.jsx` - Filtros e exibição
- `client/src/pages/admin/AdminDashboard.jsx` - Exibição de status
- `client/src/pages/Orders.jsx` - Exibição de status

**NÃO ALTERAR:**
- ❌ Status do pedido não deve ser atualizado automaticamente
- ❌ Filtros devem ser baseados em status dos itens
- ❌ Exibição deve ser por item, não por pedido
- ❌ Botões de ação apenas por item

---

### 2. REDUÇÃO E DEVOLUÇÃO DE ESTOQUE

**PROTEÇÃO:** Ver documento `INVENTARIO_CODIGO_PROTEGIDO.md`

**REGRA:** Estoque só é reduzido quando item é autorizado. Se item autorizado for excluído, estoque deve ser devolvido.

**CÓDIGO PROTEGIDO:**
- `server/routes/admin.js` - Linha ~1768-1797 (redução de estoque)
- `server/routes/admin.js` - Linha ~1885-1904 (devolução de estoque)

**NÃO ALTERAR:**
- ❌ Lógica de redução de estoque ao aprovar item
- ❌ Lógica de devolução de estoque ao excluir item autorizado
- ❌ Cálculo de `ativo` baseado em estoque

---

### 3. NORMALIZAÇÃO DE DADOS

**REGRA:** Dados do Supabase podem vir como array ou objeto. Sempre usar função de normalização.

**CÓDIGO PROTEGIDO:**
- `client/src/pages/admin/ManagerDashboard.jsx` - Função `normalizarDadosPedido()` (linha ~352-389)
- `client/src/pages/admin/AdminDashboard.jsx` - Função `normalizarFuncionario()` (se existir)

**NÃO ALTERAR:**
- ❌ Função de normalização sem testar todos os casos
- ❌ Acesso direto a `pedido.funcionarios` sem normalizar
- ❌ Acesso direto a `funcionario.empresas` ou `funcionario.clubes` sem normalizar

---

### 4. EXIBIÇÃO DE STATUS "REJEITADO" COMO "SEM ESTOQUE"

**REGRA:** Nas telas do funcionário e gestor, status "rejeitado" deve aparecer como "Sem estoque".

**CÓDIGO PROTEGIDO:**
- `client/src/pages/Orders.jsx` - Função `getStatusText()` (linha ~66-67)
- `client/src/pages/admin/ManagerDashboard.jsx` - Função `getStatusText()` (linha ~321-322)

**NÃO ALTERAR:**
- ❌ Texto "Sem estoque" para status rejeitado nas telas do funcionário e gestor
- ❌ Pode alterar na tela do admin se necessário, mas não nas outras

---

### 5. IMPRESSÃO DE PEDIDOS

**REGRA:** Impressão não deve mostrar status do pedido nem subtotal por item.

**CÓDIGO PROTEGIDO:**
- `client/src/pages/admin/ManagerDashboard.jsx` - Função `handlePrint()` (linha ~147-247)

**NÃO ALTERAR:**
- ❌ Adicionar campo "Status" na impressão
- ❌ Adicionar coluna "Subtotal" na tabela de impressão
- ✅ Pode manter: Produto, SKU, Variação, Quantidade, Preço Unit., Total

---

### 6. FILTROS E CARDS DE STATUS

**REGRA:** Cards de filtro devem ser calculados baseados nos status dos itens, não do pedido.

**CÓDIGO PROTEGIDO:**
- `client/src/pages/admin/ManagerDashboard.jsx` - Cálculo de contadores (linha ~393-418)
- `client/src/pages/admin/ManagerDashboard.jsx` - Grid de cards (linha ~524)

**NÃO ALTERAR:**
- ❌ Voltar a calcular baseado em `pedido.status`
- ❌ Remover cards de filtro
- ❌ Alterar layout de 5 colunas para outro formato sem autorização

---

### 7. BOTÕES DE AÇÃO

**REGRA:** Botões Aprovar/Rejeitar/Excluir aparecem apenas por item, não por pedido (exceto gestor que pode aprovar pedido inteiro).

**CÓDIGO PROTEGIDO:**
- `client/src/pages/admin/AdminDashboard.jsx` - Botões por item (linha ~3668-3714)
- `client/src/pages/admin/ManagerDashboard.jsx` - Botão aprovar pedido (linha ~669-686)

**NÃO ALTERAR:**
- ❌ Adicionar botões de ação no nível do pedido em AdminDashboard
- ❌ Remover botões de ação por item
- ❌ Alterar condições de exibição dos botões sem autorização

---

### 8. CADASTRO DE EMPRESA

**REGRA:** Código de cadastro de empresa não deve ser gerado automaticamente. Só salvar se fornecido.

**CÓDIGO PROTEGIDO:**
- `server/routes/admin.js` - Rota `POST /admin/empresas` (linha ~64-68)

**NÃO ALTERAR:**
- ❌ Voltar a gerar código automaticamente
- ❌ Exibir código quando for null ou vazio

---

## 📋 CHECKLIST ANTES DE QUALQUER ALTERAÇÃO

Antes de modificar qualquer código relacionado às funcionalidades protegidas, verifique:

- [ ] A alteração foi autorizada pelo responsável do projeto?
- [ ] A alteração não quebra o fluxo de status dos pedidos?
- [ ] A alteração não afeta a lógica de estoque?
- [ ] A alteração não remove funcionalidades existentes?
- [ ] A alteração foi testada em todas as telas afetadas?
- [ ] A documentação foi atualizada se necessário?

**Se qualquer resposta for "NÃO", a alteração NÃO deve ser feita.**

---

## 🔒 GARANTIAS DE PROTEÇÃO

### 1. Documentação de Proteção

Os seguintes documentos garantem a proteção do código:

- `PROTECAO_FLUXO_STATUS_PEDIDOS.md` - Proteção do fluxo de status
- `INVENTARIO_CODIGO_PROTEGIDO.md` - Proteção do código de inventário
- `REGRAS_PROTECAO_CODIGO.md` - Este documento (regras gerais)

### 2. Comentários no Código

Código crítico possui comentários de proteção:

```javascript
// 🔒 CÓDIGO PROTEGIDO - NUNCA REMOVER
// NÃO atualizar status do pedido - status fica apenas nos itens
// NUNCA alterar sem autorização
```

### 3. Versionamento

Todas as alterações devem ser commitadas com mensagens descritivas e documentadas.

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `FLUXO_STATUS_PEDIDOS.md` - Documentação completa do fluxo
- `PROTECAO_FLUXO_STATUS_PEDIDOS.md` - Proteção específica do fluxo
- `SOLUCAO_PROBLEMAS_PEDIDOS_GESTOR.md` - Soluções de problemas anteriores
- `INVENTARIO_CODIGO_PROTEGIDO.md` - Proteção do inventário

---

## ⚠️ PROCEDIMENTO PARA ALTERAÇÕES

Se uma alteração for necessária em código protegido:

1. **Solicitar autorização** ao responsável do projeto
2. **Documentar a mudança** proposta
3. **Explicar o motivo** da alteração
4. **Listar impactos** em outras funcionalidades
5. **Aguardar aprovação** antes de implementar
6. **Atualizar documentação** após implementação
7. **Testar completamente** antes de fazer commit

---

## 🚨 ALERTAS

**NUNCA:**
- ❌ Remover código protegido sem autorização
- ❌ Alterar fluxo de status sem autorização
- ❌ Modificar lógica de estoque sem autorização
- ❌ Deletar funcionalidades sem autorização
- ❌ Fazer commit de código que quebra funcionalidades existentes

**SEMPRE:**
- ✅ Verificar documentação antes de alterar código protegido
- ✅ Testar alterações em todas as telas afetadas
- ✅ Atualizar documentação quando necessário
- ✅ Fazer commits descritivos e organizados

---

**Data de Criação:** 2025-01-27  
**Última Atualização:** 2025-01-27  
**Versão:** 1.0  
**Status:** 🔒 PROTEGIDO

