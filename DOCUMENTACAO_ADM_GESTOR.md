# 📋 DOCUMENTAÇÃO COMPLETA - MANAGER DASHBOARD (adm/gestor)

## 📌 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estrutura da Interface](#estrutura-da-interface)
3. [Cabeçalho e Informações do Usuário](#cabeçalho-e-informações-do-usuário)
4. [Filtros](#filtros)
5. [Cards de Status](#cards-de-status)
6. [Lista de Pedidos](#lista-de-pedidos)
7. [Função de Impressão](#função-de-impressão)
8. [Layout e Design](#layout-e-design)
9. [Fluxos de Trabalho](#fluxos-de-trabalho)
10. [Regras de Negócio](#regras-de-negócio)
11. [Normalização de Dados](#normalização-de-dados)

---

## 🎯 VISÃO GERAL

O **Manager Dashboard** (Painel Gestor) é o painel administrativo específico para gestores de empresas. Permite visualizar, filtrar e gerenciar pedidos da empresa do gestor, com foco em aprovação/rejeição de pedidos.

**Acesso:** `/adm/gestor`  
**Permissão:** Apenas usuários com `tipo === 'gestor'`  
**Componente:** `client/src/pages/admin/ManagerDashboard.jsx`  
**Escopo:** Apenas pedidos da empresa do gestor (`user.empresa_id`)

---

## 📑 ESTRUTURA DA INTERFACE

O dashboard possui uma estrutura linear e focada:

1. **Cabeçalho** - Logo, título e botão de logout
2. **Informações do Usuário** - Saudação e nome da empresa
3. **Filtros** - Status, datas e funcionário
4. **Cards de Status** - 5 cards clicáveis com contadores
5. **Lista de Pedidos** - Cards expansíveis com detalhes

---

## 👤 CABEÇALHO E INFORMAÇÕES DO USUÁRIO

### **Cabeçalho**
Localização: Topo da página  
Layout: Barra horizontal branca com sombra

**Elementos:**
- **Logo** (lado esquerdo)
  - Componente `<Logo />`
  - Clique redireciona para home (se configurado)

- **Título** (centro)
  - Texto: "PAINEL GESTOR"
  - Cor: Roxo primário (`primary-purple`)
  - Fonte: Bold, tamanho XL
  - Posicionamento: Absoluto centralizado

- **Botão "Sair"** (lado direito)
  - Texto: "Sair"
  - Cor: Cinza, hover roxo
  - Função: Executa `logout()` do contexto de autenticação

---

### **Card de Boas-Vindas**
Localização: Abaixo do cabeçalho  
Layout: Card branco com borda e sombra

**Conteúdo:**
- **Lado Esquerdo:**
  - Texto: "Olá GESTOR"
  - Nome do usuário em roxo: `{user.nome || user.usuario || ''}`

- **Lado Direito:**
  - Nome da empresa (se disponível)
  - Fonte: Bold, tamanho LG

**Comportamento:**
- Nome da empresa é carregado automaticamente via `loadEmpresa()`
- Busca empresa por `user.empresa_id` ou usa `user.empresas.nome` se disponível
- Se não encontrar empresa, não exibe o lado direito

---

## 🔍 FILTROS

### **Localização e Layout**
Localização: Abaixo do card de boas-vindas  
Layout: Card branco com campos lado a lado (flex wrap)

### **Campos de Filtro**

#### **1. Status** (select)
- **Label:** "Status"
- **Opções:**
  - "Todos os status" (valor vazio)
  - "Pendente"
  - "Aguardando Aprovação de Estoque"
  - "Produto Autorizado"
  - "Aprovado"
  - "Produto Sem Estoque"
  - "Rejeitado"
- **Comportamento:**
  - Filtra pedidos baseado no **status dos itens**, não do pedido
  - Filtro aplicado no frontend após buscar do backend
  - Lógica de filtro:
    - `pendente`: Itens com status `'pendente'` ou sem status
    - `aprovado`: Itens com status `'Produto autorizado'` ou `'aprovado'`
    - `rejeitado`: Itens com status `'rejeitado'`
    - `aguardando aprovação de estoque`: Itens com status `'aguardando aprovação de estoque'` ou `'verificando estoque'`
    - `produto sem estoque`: Itens com status `'produto sem estoque'`

#### **2. Data Início** (input type="date")
- **Label:** "Data Início"
- **Formato:** YYYY-MM-DD
- **Comportamento:**
  - Filtra pedidos criados a partir desta data
  - Enviado para backend como `data_inicio`
  - Opcional

#### **3. Data Fim** (input type="date")
- **Label:** "Data Fim"
- **Formato:** YYYY-MM-DD
- **Comportamento:**
  - Filtra pedidos criados até esta data
  - Enviado para backend como `data_fim`
  - Opcional

#### **4. Funcionário** (input type="text")
- **Label:** "Funcionário"
- **Placeholder:** "Nome do funcionário"
- **Comportamento:**
  - Busca por nome do funcionário (busca parcial, case-insensitive)
  - Enviado para backend como `funcionario_nome`
  - Opcional

#### **5. Botão "Limpar"**
- **Visibilidade:** Aparece apenas se houver pelo menos um filtro ativo
- **Função:** Remove todos os filtros (status, datas, funcionário)
- **Estilo:** Texto cinza, hover roxo com fundo cinza claro

**Comportamento Geral:**
- Filtros são aplicados em tempo real
- Ao alterar qualquer filtro, recarrega pedidos automaticamente
- Filtro de status é aplicado no frontend (não enviado para backend)
- Outros filtros são enviados para backend

---

## 📊 CARDS DE STATUS

### **Localização e Layout**
Localização: Abaixo dos filtros  
Layout: Grid de 5 colunas (responsivo: 1 coluna mobile, 5 colunas desktop)

### **Estrutura dos Cards**

Cada card é **clicável** e funciona como filtro rápido. Quando ativo, tem borda destacada e fundo mais escuro.

#### **Card 1: Todos Pedidos**
- **Cor de fundo:** Azul claro (`bg-blue-50`)
- **Cor quando ativo:** Azul mais escuro (`bg-blue-100`) com borda azul (`border-2 border-blue-400`)
- **Título:** "Todos Pedidos"
- **Valor:** Quantidade total de pedidos (sem filtro de status)
- **Fonte do valor:** Bold, tamanho 2XL, cor azul escuro
- **Função:** Remove filtro de status (mostra todos)

#### **Card 2: Pendentes**
- **Cor de fundo:** Amarelo claro (`bg-yellow-50`)
- **Cor quando ativo:** Amarelo mais escuro (`bg-yellow-100`) com borda amarela
- **Título:** "Pendentes"
- **Valor:** Quantidade de pedidos com itens pendentes
  - **Lógica:** Pedidos que têm pelo menos 1 item com status `'pendente'` ou sem status
- **Fonte do valor:** Bold, tamanho 2XL, cor amarelo escuro
- **Função:** Aplica filtro `status: 'pendente'`
- **Toggle:** Clicar novamente remove o filtro

#### **Card 3: Aguardando Aprovação**
- **Cor de fundo:** Azul claro (`bg-blue-50`)
- **Cor quando ativo:** Azul mais escuro (`bg-blue-100`) com borda azul
- **Título:** "Aguardando Aprovação"
- **Valor:** Quantidade de pedidos com itens aguardando aprovação
  - **Lógica:** Pedidos que têm pelo menos 1 item com status `'aguardando aprovação de estoque'` ou `'verificando estoque'`
- **Fonte do valor:** Bold, tamanho 2XL, cor azul escuro
- **Função:** Aplica filtro `status: 'aguardando aprovação de estoque'`
- **Toggle:** Clicar novamente remove o filtro

#### **Card 4: Aprovados**
- **Cor de fundo:** Verde claro (`bg-green-50`)
- **Cor quando ativo:** Verde mais escuro (`bg-green-100`) com borda verde
- **Título:** "Aprovados"
- **Valor:** Quantidade de pedidos com itens aprovados
  - **Lógica:** Pedidos que têm pelo menos 1 item com status `'Produto autorizado'` ou `'aprovado'`
  - **IMPORTANTE:** Não conta itens rejeitados (filtro inteligente)
- **Fonte do valor:** Bold, tamanho 2XL, cor verde escuro
- **Função:** Aplica filtro `status: 'aprovado'`
- **Toggle:** Clicar novamente remove o filtro
- **Filtro Inteligente:** Ao clicar, mostra apenas itens aprovados (oculta rejeitados)

#### **Card 5: Sem estoque**
- **Cor de fundo:** Vermelho claro (`bg-red-50`)
- **Cor quando ativo:** Vermelho mais escuro (`bg-red-100`) com borda vermelha
- **Título:** "Sem estoque"
- **Valor:** Quantidade de pedidos com itens rejeitados
  - **Lógica:** Pedidos que têm pelo menos 1 item com status `'rejeitado'`
  - **Texto exibido:** "Sem estoque" (mas status no banco é `'rejeitado'`)
- **Fonte do valor:** Bold, tamanho 2XL, cor vermelho escuro
- **Função:** Aplica filtro `status: 'rejeitado'`
- **Toggle:** Clicar novamente remove o filtro
- **Filtro Inteligente:** Ao clicar, mostra apenas itens rejeitados (oculta outros)

**Comportamento:**
- Cards têm hover effect (sombra aumenta)
- Clique alterna filtro (se já estiver ativo, remove)
- Contadores são calculados com base em **todos os pedidos** (sem filtro de status)
- Contadores atualizam automaticamente quando pedidos são aprovados/rejeitados

---

## 📋 LISTA DE PEDIDOS

### **Localização e Layout**
Localização: Abaixo dos cards de status  
Layout: Lista vertical de cards expansíveis

### **Estado de Carregamento**
Se `loading === true`:
- Exibe: "Carregando pedidos..." (centralizado, padding vertical grande)

### **Estado Vazio**
Se não houver pedidos:
- Exibe: "Nenhum pedido encontrado" (card branco, centralizado)

### **Estrutura do Card de Pedido**

Cada pedido é exibido em um card branco expansível:

#### **Cabeçalho (sempre visível)**

**Lado Esquerdo:**
- **ID do Pedido** (fonte semibold, tamanho LG)
  - Formato: "Pedido #123"
- **Ícone de seta** (SVG)
  - Rotaciona 180° quando expandido
  - Indica estado expandido/recolhido
- **Informações do Pedido:**
  - **Funcionário:** Nome completo (ou "N/A" se não encontrado)
  - **Empresa:** Nome da empresa (ou "N/A")
  - **Cadastro Empresa:** (exibido apenas se houver valor)
    - Busca de `funcionario.cadastro_empresa` ou `empresa.cadastro_empresa`
  - **Cadastro Clube:** (exibido apenas se houver valor)
    - Busca de `clube.cadastro_clube` ou `funcionario.cadastro_clube`
  - **Data:** Data e hora formatadas (pt-BR)
    - Formato: "DD/MM/AAAA, HH:MM:SS"

**Lado Direito:**
- **Botão "Imprimir"** (azul)
  - **Visibilidade:** Apenas se o pedido tiver pelo menos 1 item aprovado
  - **Condição:** `pedido.pedido_itens.some(item => item.status === 'Produto autorizado' || item.status === 'aprovado')`
  - **Função:** Executa `handlePrint(pedido)`

**Comportamento do Cabeçalho:**
- Clique no cabeçalho expande/recolhe o pedido
- Clique no botão "Imprimir" não expande (usa `stopPropagation`)
- Hover effect no cabeçalho (fundo cinza claro)

---

#### **Conteúdo Expandido**

Aparece apenas quando `expandedPedidos.has(pedido.id) === true`:

##### **1. Lista de Itens**

Cada item é exibido em uma linha com:

**Lado Esquerdo:**
- **Nome do Produto** (fonte medium)
  - Ou "Produto não encontrado" se não houver
- **Variação** (se houver)
  - Texto: "Variação: {valor}"
  - Cor: Cinza, tamanho pequeno
- **Quantidade**
  - Texto: "Quantidade: {valor}"
  - Cor: Cinza, tamanho pequeno
- **Badge de Status**
  - Cores por status (ver função `getStatusColor`)
  - Texto por status (ver função `getStatusText`)
  - Formato: Badge arredondado, fonte semibold, tamanho XS

**Lado Direito:**
- **Subtotal do Item**
  - Fórmula: `item.preco * item.quantidade`
  - Formato: R$ X,XX
  - Fonte: Semibold

**Filtro Inteligente de Itens:**
- **Se filtro `status === 'rejeitado'`:**
  - Mostra **apenas** itens com status `'rejeitado'`
  - Oculta todos os outros itens
- **Se filtro `status === 'aprovado'`:**
  - Mostra **apenas** itens com status `'Produto autorizado'` ou `'aprovado'`
  - Oculta itens rejeitados
- **Caso contrário:**
  - Mostra todos os itens do pedido

##### **2. Total do Pedido**

**Lado Esquerdo:**
- **Label:** "Total do pedido:"
- **Valor:** Soma de todos os itens (independente do status)
  - Fórmula: `sum(item.preco * item.quantidade)`
  - Formato: R$ X,XX
  - Fonte: Bold, tamanho 2XL, cor roxa

**Lado Direito:**
- **Botões de Ação** (se aplicável)

**Condição para exibir botões:**
- Apenas se o pedido tiver itens com status:
  - Sem status (`!item.status`)
  - `'pendente'`
  - `'verificando estoque'`

**Botões:**
- **"Aprovar"** (verde)
  - Função: `handleAprovar(pedido.id)`
  - Confirmação: "Deseja aprovar este pedido?"
  - **Ação:** Atualiza **todos os itens pendentes** para `'aguardando aprovação de estoque'`
  - **Também atualiza:** Status do pedido para `'aguardando aprovação de estoque'`
- **"Rejeitar"** (vermelho)
  - Função: `handleRejeitar(pedido.id)`
  - Confirmação: "Deseja rejeitar este pedido?"
  - **Ação:** Atualiza **todos os itens pendentes** para `'rejeitado'`

**Comportamento:**
- Após aprovar/rejeitar, recarrega pedidos e contadores
- Exibe mensagem de sucesso/erro via `alert()`

---

## 🖨️ FUNÇÃO DE IMPRESSÃO

### **Localização**
Botão "Imprimir" no cabeçalho do pedido (apenas se houver itens aprovados)

### **Funcionalidade**

A função `handlePrint(pedido)` gera um HTML formatado para impressão:

#### **Conteúdo Impresso:**

**Cabeçalho:**
- Logo (se disponível)
- Título: "Pedido #{id}"

**Informações do Pedido:**
- Funcionário: Nome completo
- Empresa: Nome da empresa
- Cadastro Empresa: (apenas se houver valor)
- Cadastro Clube: (apenas se houver valor)
- Data: Data e hora formatadas (pt-BR)

**Tabela de Itens:**
- Colunas:
  1. **Produto** - Nome do produto
  2. **SKU** - SKU do produto (destacado em roxo se disponível)
  3. **Variação** - Variação do item (ou "-")
  4. **Quantidade** - Quantidade (em negrito)
  5. **Preço Unit.** - Preço unitário formatado (R$ X,XX)
- **NÃO imprime:** Subtotal por item
- **NÃO imprime:** Status do pedido
- **NÃO imprime:** Status dos itens

**Rodapé:**
- **Total:** Soma de todos os itens (R$ X,XX)

#### **Estilo da Impressão:**
- Fonte pequena (10px para tabela, 9px para células)
- Cabeçalho da tabela: Fundo roxo, texto branco
- Bordas em todas as células
- Logo centralizado no topo (se disponível)
- Layout otimizado para impressão A4

#### **Comportamento:**
- Abre nova janela de impressão do navegador
- Usa iframe oculto para renderizar HTML
- Aguarda conteúdo carregar antes de imprimir
- Proteção contra múltiplos cliques (flag `hasPrinted`)

---

## 🎨 LAYOUT E DESIGN

### **Cores Principais**
- **Roxo Primário:** `#7C3AED` (primary-purple)
- **Verde:** `#10B981` (sucesso/aprovação)
- **Vermelho:** `#EF4444` (erro/rejeição)
- **Amarelo:** `#F59E0B` (pendente)
- **Azul:** `#3B82F6` (informação/aguardando)
- **Laranja:** `#F97316` (alerta)

### **Cores dos Cards de Status**
- **Todos Pedidos:** Azul (`bg-blue-50`, `text-blue-800`)
- **Pendentes:** Amarelo (`bg-yellow-50`, `text-yellow-800`)
- **Aguardando Aprovação:** Azul (`bg-blue-50`, `text-blue-800`)
- **Aprovados:** Verde (`bg-green-50`, `text-green-800`)
- **Sem estoque:** Vermelho (`bg-red-50`, `text-red-800`)

### **Cores dos Badges de Status**
Função `getStatusColor(status)` retorna classes Tailwind:
- `aprovado` / `Produto autorizado`: `bg-green-100 text-green-800`
- `rejeitado`: `bg-red-100 text-red-800`
- `verificando estoque` / `aguardando aprovação de estoque`: `bg-blue-100 text-blue-800`
- `produto sem estoque`: `bg-orange-100 text-orange-800`
- `pendente` (padrão): `bg-yellow-100 text-yellow-800`

### **Tipografia**
- **Títulos:** Fonte semibold/bold, tamanhos variados
- **Texto:** Fonte normal, tamanho padrão
- **Labels:** Fonte medium, tamanho pequeno (text-xs)
- **Valores:** Fonte bold, tamanho 2XL para contadores

### **Espaçamento**
- Padding padrão: 16px (p-4)
- Gap entre elementos: 16px (gap-4)
- Margin entre seções: 24px (mb-6)

### **Responsividade**
- **Mobile:** 1 coluna (cards de status empilham)
- **Desktop:** 5 colunas (cards de status lado a lado)
- Cards de pedido: Sempre largura total
- Filtros: Wrap em telas pequenas

### **Componentes Reutilizáveis**
- Cards com sombra e borda arredondada
- Botões com hover effect
- Badges de status coloridos
- Inputs com focus ring roxo
- Ícones SVG (setas, etc.)

---

## 🔄 FLUXOS DE TRABALHO

### **1. Visualização de Pedidos**
1. Gestor acessa `/adm/gestor`
2. Sistema verifica se `user.tipo === 'gestor'`
3. Carrega nome da empresa (`loadEmpresa()`)
4. Carrega pedidos da empresa (`loadPedidos()`)
5. Carrega todos os pedidos para contadores (`loadTodosPedidos()`)
6. Exibe cards de status com contadores
7. Exibe lista de pedidos

### **2. Filtragem de Pedidos**
1. Gestor seleciona filtro (status, data, funcionário)
2. Sistema atualiza estado `filters`
3. `useEffect` detecta mudança em `filters`
4. Executa `loadPedidos()` com novos filtros
5. Se filtro for de status, aplica filtro no frontend
6. Atualiza lista de pedidos exibidos
7. Cards de status mantêm contadores totais (não filtrados)

### **3. Aprovação de Pedido (Gestor)**
1. Gestor expande pedido desejado
2. Visualiza itens pendentes
3. Clica em "Aprovar"
4. Sistema confirma: "Deseja aprovar este pedido?"
5. Se confirmado:
   - Chama `PUT /admin/pedidos/:id/aprovar`
   - Backend atualiza **todos os itens pendentes** para `'aguardando aprovação de estoque'`
   - Backend atualiza status do pedido para `'aguardando aprovação de estoque'`
6. Sistema recarrega pedidos e contadores
7. Exibe mensagem: "Pedido aprovado com sucesso!"
8. Pedido aparece no card "Aguardando Aprovação"
9. Funcionário vê status "Verificando Estoque" em seu pedido

### **4. Rejeição de Pedido (Gestor)**
1. Gestor expande pedido desejado
2. Visualiza itens pendentes
3. Clica em "Rejeitar"
4. Sistema confirma: "Deseja rejeitar este pedido?"
5. Se confirmado:
   - Chama `PUT /admin/pedidos/:id/rejeitar`
   - Backend atualiza **todos os itens pendentes** para `'rejeitado'`
6. Sistema recarrega pedidos e contadores
7. Exibe mensagem: "Pedido rejeitado"
8. Pedido aparece no card "Sem estoque"
9. Funcionário vê status "Sem estoque" em seu pedido

### **5. Filtro Inteligente por Card**
1. Gestor clica em card "Aprovados"
2. Sistema aplica filtro `status: 'aprovado'`
3. Lista de pedidos mostra apenas pedidos com itens aprovados
4. Ao expandir pedido, mostra **apenas itens aprovados** (oculta rejeitados)
5. Gestor clica em card "Sem estoque"
6. Sistema aplica filtro `status: 'rejeitado'`
7. Lista de pedidos mostra apenas pedidos com itens rejeitados
8. Ao expandir pedido, mostra **apenas itens rejeitados** (oculta outros)

### **6. Impressão de Pedido**
1. Gestor localiza pedido com itens aprovados
2. Botão "Imprimir" aparece no cabeçalho
3. Clica em "Imprimir"
4. Sistema gera HTML formatado
5. Abre janela de impressão do navegador
6. Gestor configura impressora e imprime

---

## 📐 REGRAS DE NEGÓCIO

### **1. Status de Pedidos**
- **Status é por item, não por pedido**
- Um pedido pode ter itens com status diferentes
- Status do pedido é apenas informativo (não usado para filtros)

### **2. Contadores dos Cards**
- **Calculados com base nos status dos itens**, não do pedido
- **Fonte:** `todosPedidos` (sem filtro de status)
- **Lógica:**
  - **Pendentes:** Pedido tem pelo menos 1 item `'pendente'` ou sem status
  - **Aguardando Aprovação:** Pedido tem pelo menos 1 item `'aguardando aprovação de estoque'` ou `'verificando estoque'`
  - **Aprovados:** Pedido tem pelo menos 1 item `'Produto autorizado'` ou `'aprovado'`
  - **Sem estoque:** Pedido tem pelo menos 1 item `'rejeitado'`

### **3. Filtros Inteligentes**
- **Card "Aprovados":**
  - Mostra apenas pedidos com itens aprovados
  - Ao expandir, mostra **apenas itens aprovados** (oculta rejeitados)
- **Card "Sem estoque":**
  - Mostra apenas pedidos com itens rejeitados
  - Ao expandir, mostra **apenas itens rejeitados** (oculta outros)

### **4. Aprovação de Pedido (Gestor)**
- **Ação:** Aprova **todos os itens pendentes** do pedido
- **Status resultante:** `'aguardando aprovação de estoque'`
- **Próximo passo:** Admin aprova individualmente cada item
- **Não reduz estoque:** Apenas admin reduz estoque ao aprovar

### **5. Rejeição de Pedido (Gestor)**
- **Ação:** Rejeita **todos os itens pendentes** do pedido
- **Status resultante:** `'rejeitado'`
- **Exibição para funcionário:** "Sem estoque"

### **6. Botões de Ação**
- **Visibilidade:** Apenas se pedido tiver itens pendentes
- **Condição:** Itens com status `null`, `'pendente'` ou `'verificando estoque'`
- **Após aprovar/rejeitar:** Botões desaparecem (itens não estão mais pendentes)

### **7. Botão Imprimir**
- **Visibilidade:** Apenas se pedido tiver pelo menos 1 item aprovado
- **Condição:** Item com status `'Produto autorizado'` ou `'aprovado'`
- **Conteúdo:** Imprime todos os itens (não filtra por status)

### **8. Permissões**
- Apenas usuários com `tipo === 'gestor'` podem acessar
- Apenas vê pedidos da sua empresa (`user.empresa_id`)
- Se não for gestor, redireciona para `/adm`

### **9. Textos de Status**
Função `getStatusText(status)` retorna textos amigáveis:
- `'rejeitado'` → **"Sem estoque"** (na tela do gestor)
- `'aguardando aprovação de estoque'` → **"Verificando Estoque"**
- `'verificando estoque'` → **"Verificando Estoque"**
- `'Produto autorizado'` → **"Produto autorizado"**
- `'aprovado'` → **"Aprovado"**
- `'produto sem estoque'` → **"Produto Sem Estoque"**
- `'pendente'` ou sem status → **"Pendente"**

---

## 🔧 NORMALIZAÇÃO DE DADOS

### **Função `normalizarDadosPedido`**

O ManagerDashboard usa uma função robusta para normalizar dados do pedido, garantindo acesso consistente mesmo quando o Supabase retorna estruturas diferentes.

#### **Problema Resolvido:**
- Supabase pode retornar `funcionarios` como array ou objeto
- Supabase pode retornar `empresas` como array ou objeto
- Supabase pode retornar `clubes` como array, objeto ou null

#### **Solução:**
```javascript
const normalizarDadosPedido = (pedido) => {
  // Normalizar funcionarios
  let funcionario = null;
  if (pedido.funcionarios) {
    if (Array.isArray(pedido.funcionarios)) {
      funcionario = pedido.funcionarios[0];
    } else if (typeof pedido.funcionarios === 'object') {
      funcionario = pedido.funcionarios;
    }
  }

  // Normalizar empresas
  let empresa = null;
  if (funcionario) {
    if (Array.isArray(funcionario.empresas)) {
      empresa = funcionario.empresas[0];
    } else if (funcionario.empresas && typeof funcionario.empresas === 'object') {
      empresa = funcionario.empresas;
    }
  }

  // Normalizar clubes
  let clube = null;
  if (funcionario) {
    if (Array.isArray(funcionario.clubes)) {
      clube = funcionario.clubes[0];
    } else if (funcionario.clubes && typeof funcionario.clubes === 'object') {
      if (funcionario.clubes.id || funcionario.clubes.nome) {
        clube = funcionario.clubes;
      }
    }
  }

  return { funcionario, empresa, clube };
};
```

#### **Uso:**
- Chamada antes de exibir dados do pedido
- Retorna objetos normalizados (sempre objetos, nunca arrays)
- Garante acesso seguro via `?.` (optional chaining)

---

## 📝 NOTAS IMPORTANTES

1. **Campo "Nome do Clube" está OCULTO**
   - Apenas "Cadastro Clube" é exibido (se houver valor)

2. **Status de pedidos é por item, não por pedido**
   - Um pedido pode ter itens com status diferentes
   - Contadores e filtros consideram status dos itens

3. **Filtros Inteligentes**
   - Card "Aprovados" oculta itens rejeitados ao expandir
   - Card "Sem estoque" mostra apenas itens rejeitados ao expandir

4. **Aprovação do Gestor**
   - Aprova todos os itens pendentes de uma vez
   - Status muda para `'aguardando aprovação de estoque'`
   - Admin aprova individualmente cada item depois

5. **Textos de Status**
   - "rejeitado" aparece como "Sem estoque" na interface
   - "aguardando aprovação de estoque" aparece como "Verificando Estoque"

6. **Contadores**
   - Calculados com base em todos os pedidos (sem filtro)
   - Atualizam automaticamente após aprovar/rejeitar

---

## 🔗 ENDPOINTS UTILIZADOS

- `GET /admin/empresas` - Busca empresas (para obter nome da empresa do gestor)
- `GET /admin/pedidos` - Lista pedidos da empresa do gestor
  - Parâmetros: `empresa_id`, `data_inicio`, `data_fim`, `funcionario_nome`
- `PUT /admin/pedidos/:id/aprovar` - Aprova pedido (gestor)
  - Atualiza todos os itens pendentes para `'aguardando aprovação de estoque'`
  - Atualiza status do pedido para `'aguardando aprovação de estoque'`
- `PUT /admin/pedidos/:id/rejeitar` - Rejeita pedido (gestor)
  - Atualiza todos os itens pendentes para `'rejeitado'`

---

## 🔒 SEGURANÇA E VALIDAÇÕES

### **Validações de Acesso**
- Verificação de autenticação no `useEffect`
- Verificação de tipo de usuário (`user.tipo === 'gestor'`)
- Redirecionamento automático se não autorizado

### **Validações de Ações**
- Confirmação antes de aprovar pedido
- Confirmação antes de rejeitar pedido
- Tratamento de erros com mensagens amigáveis

### **Proteção de Dados**
- Apenas pedidos da empresa do gestor são carregados
- Filtro `empresa_id` aplicado no backend
- Normalização de dados garante acesso seguro

---

**Última atualização:** 2024  
**Versão do Documento:** 1.0  
**Autor:** Sistema de Documentação Automática

