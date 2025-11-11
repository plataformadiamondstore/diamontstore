# 🛡️ REGRAS DE SEGURANÇA DO CÓDIGO - NUNCA REMOVER FUNCIONALIDADES

## ⚠️ REGRA PRINCIPAL - ABSOLUTAMENTE PROIBIDO

**NUNCA, EM HIPÓTESE ALGUMA, REMOVER OU ALTERAR FUNCIONALIDADES QUE FORAM SOLICITADAS PELO USUÁRIO SEM EXPLÍCITA AUTORIZAÇÃO.**

## 📋 CHECKLIST OBRIGATÓRIO ANTES DE QUALQUER ALTERAÇÃO

### ✅ ANTES DE REMOVER QUALQUER CÓDIGO:

1. **Verificar se a funcionalidade foi solicitada pelo usuário**
   - Se SIM → **NÃO REMOVER**
   - Se NÃO → Verificar próximo item

2. **Verificar histórico de commits e conversas**
   - Buscar no histórico do Git
   - Verificar mensagens anteriores do usuário
   - Confirmar se foi implementado por solicitação

3. **Solicitar autorização explícita**
   - Se houver qualquer dúvida → **NÃO REMOVER**
   - Perguntar ao usuário antes de remover
   - Aguardar confirmação explícita

4. **Documentar a remoção**
   - Se autorizado, documentar o motivo
   - Registrar no commit message
   - Atualizar este documento

## 🚫 FUNCIONALIDADES PROTEGIDAS (NUNCA REMOVER)

### Sistema de Estoque
- ✅ Campo `estoque` nos formulários de criação/edição de produtos
- ✅ Exibição de estoque no card de produtos (ao lado das variações)
- ✅ Lógica de redução de estoque ao aprovar itens/pedidos
- ✅ Desabilitação automática quando estoque = 0
- ✅ Reabilitação automática quando estoque > 0
- ✅ Validação obrigatória de estoque no cadastro

### Botão ON/OFF para Desativar Produtos
- ✅ Função `handleToggleAtivo` no frontend
- ✅ Botão toggle ON/OFF no card de produtos
- ✅ Badge "DESABILITADO" quando `ativo = false`
- ✅ Rota `PUT /admin/produtos/:id/toggle-ativo` no backend
- ✅ Rota `GET /admin/produtos` que retorna TODOS os produtos (incluindo desabilitados)
- ✅ Produtos desabilitados não aparecem na aplicação principal (filtro `ativo = true`)

### Layout da Tela de Edição de Produtos
- ✅ Imagens no topo do formulário
- ✅ Card de upload abaixo das imagens (compacto)
- ✅ Campos do formulário abaixo do upload
- ✅ Seção de variações com botões (igual ao cadastro)
- ✅ Label "Variações" (sem "(opcional)")

### Sistema de Status de Pedidos
- ✅ Status "verificando estoque" (intermediário)
- ✅ Status "produto sem estoque"
- ✅ Botões de aprovar/rejeitar por item
- ✅ Lógica de transição de status:
  - `pendente` → `verificando estoque` → `aprovado`
  - `verificando estoque` → `produto sem estoque` (rejeitar)

### Campos Obrigatórios de Produtos
- ✅ Nome (obrigatório)
- ✅ Preço (obrigatório)
- ✅ SKU (obrigatório)
- ✅ EAN (obrigatório)
- ✅ Categoria (obrigatória)
- ✅ Marca (obrigatória)
- ✅ Estoque (obrigatório)
- ✅ Descrição (obrigatória)
- ✅ Mínimo 3 imagens (obrigatório)
- ✅ Variações (opcional)

### Exibição de Dados
- ✅ Estoque no card de produtos (canto direito, ao lado das variações)
- ✅ Status por item nos pedidos
- ✅ Botões de aprovar/rejeitar por item
- ✅ Badges de status coloridos

## 📝 PROCESSO DE ALTERAÇÃO DE CÓDIGO

### Quando fazer alterações:

1. **Adicionar novas funcionalidades** ✅
   - Sempre permitido
   - Seguir padrões existentes

2. **Corrigir bugs** ✅
   - Sempre permitido
   - Documentar o bug corrigido

3. **Melhorar performance** ✅
   - Permitido, mas:
   - NUNCA remover funcionalidades para melhorar performance
   - Otimizar sem remover

4. **Refatorar código** ⚠️
   - Permitido, mas:
   - Manter TODAS as funcionalidades
   - Testar que nada foi quebrado
   - Verificar se todas as features ainda funcionam

5. **Remover código** ❌
   - **SOMENTE com autorização explícita do usuário**
   - Documentar no commit
   - Atualizar este documento

## 🔍 VERIFICAÇÃO ANTES DE COMMIT

Antes de fazer commit, verificar:

- [ ] Nenhuma funcionalidade foi removida sem autorização
- [ ] Todos os campos obrigatórios ainda estão presentes
- [ ] Todas as validações ainda estão funcionando
- [ ] Layouts solicitados ainda estão corretos
- [ ] Lógicas de negócio ainda estão implementadas
- [ ] Campos de formulário não foram removidos
- [ ] Exibições visuais não foram alteradas sem solicitação

## 📚 HISTÓRICO DE FUNCIONALIDADES IMPLEMENTADAS

### Estoque
- **Data**: Implementado anteriormente
- **Status**: ✅ ATIVO - NUNCA REMOVER
- **Localização**: 
  - `client/src/pages/admin/AdminDashboard.jsx` (formulários e exibição)
  - `server/routes/admin.js` (lógica de redução)
  - Tabela `produtos` (coluna `estoque`)

### Layout de Edição
- **Data**: Implementado anteriormente
- **Status**: ✅ ATIVO - NUNCA REMOVER
- **Ordem**: Imagens → Upload → Campos → Variações

### Status por Item
- **Data**: Implementado recentemente
- **Status**: ✅ ATIVO - NUNCA REMOVER
- **Localização**:
  - `server/routes/admin.js` (rotas de aprovar/rejeitar item)
  - `client/src/pages/admin/AdminDashboard.jsx` (botões por item)
  - Tabela `pedido_itens` (coluna `status`)

## 🚨 ALERTAS

Se você (assistente) estiver prestes a:
- Remover um campo de formulário
- Remover uma validação
- Remover uma exibição visual
- Remover uma lógica de negócio
- Alterar um layout que foi solicitado

**PARE IMEDIATAMENTE E:**
1. Verifique este documento
2. Verifique o histórico do Git
3. Pergunte ao usuário antes de prosseguir

## 📞 CONTATO EM CASO DE DÚVIDA

Se houver qualquer dúvida sobre remover ou alterar código:
- **NÃO REMOVA**
- Pergunte ao usuário
- Documente a dúvida
- Aguarde confirmação explícita

---

**ÚLTIMA ATUALIZAÇÃO**: Agora
**VERSÃO**: 1.0
**STATUS**: ATIVO - SEGUIR SEMPRE

