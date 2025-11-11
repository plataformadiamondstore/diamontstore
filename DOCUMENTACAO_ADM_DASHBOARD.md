# 📋 DOCUMENTAÇÃO COMPLETA - ADMIN DASHBOARD (adm/dashboard)

## 📌 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estrutura de Abas](#estrutura-de-abas)
3. [Aba Dashboard](#aba-dashboard)
4. [Aba Cadastro Empresas](#aba-cadastro-empresas)
5. [Aba Cadastro Funcionários](#aba-cadastro-funcionários)
6. [Aba Cadastro Produto](#aba-cadastro-produto)
7. [Aba Produtos](#aba-produtos)
8. [Aba Pedidos](#aba-pedidos)
9. [Layout e Design](#layout-e-design)
10. [Fluxos de Trabalho](#fluxos-de-trabalho)
11. [Regras de Negócio](#regras-de-negócio)

---

## 🎯 VISÃO GERAL

O **Admin Dashboard** é o painel administrativo principal do sistema, acessível apenas para usuários com perfil `master`. Este painel permite gerenciar empresas, funcionários, produtos, pedidos e visualizar métricas e estatísticas do sistema.

**Acesso:** `/adm/dashboard`  
**Permissão:** Apenas usuários com `tipo === 'master'`  
**Componente:** `client/src/pages/admin/AdminDashboard.jsx`

---

## 📑 ESTRUTURA DE ABAS

O dashboard possui **6 abas principais**:

1. **Dashboard** - Visão geral com métricas e estatísticas
2. **Cadastro Empresas** - Gerenciamento de empresas
3. **Cadastro Funcionários** - Gerenciamento de funcionários via upload
4. **Cadastro Produto** - Cadastro de produtos, categorias, marcas e tamanhos
5. **Produtos** - Listagem e edição de produtos cadastrados
6. **Pedidos** - Visualização e gerenciamento de pedidos

**Navegação:** As abas são exibidas como botões na parte superior, com destaque visual para a aba ativa (borda inferior roxa).

---

## 📊 ABA DASHBOARD

### **Descrição**
A aba Dashboard exibe métricas gerais do sistema, cards informativos e uma tabela de vendas por empresa.

### **Layout**

#### **1. Filtros do Dashboard**
Localização: Topo da aba  
Layout: Linha horizontal com campos lado a lado

**Campos:**
- **Data Início** (input type="date")
  - Filtra pedidos a partir desta data
  - Formato: YYYY-MM-DD
  - Opcional

- **Data Fim** (input type="date")
  - Filtra pedidos até esta data
  - Formato: YYYY-MM-DD
  - Opcional

- **Empresa** (select)
  - Dropdown com todas as empresas cadastradas
  - Opção padrão: "Todas as Empresas"
  - Filtra métricas e tabela por empresa específica
  - Opcional

- **Botão "Limpar"**
  - Remove todos os filtros aplicados
  - Restaura visualização padrão

**Comportamento:**
- Os filtros são aplicados em tempo real
- Afetam todos os cards de métricas e a tabela de vendas
- Filtro de data: considera apenas a data (ignora hora)
- Filtro de empresa: busca por `empresa_id` ou `funcionarios.empresas.id`

---

#### **2. Cards de Métricas**
Localização: Abaixo dos filtros  
Layout: Grid responsivo (1 coluna mobile, 2 colunas tablet, 4 colunas desktop)

##### **Card 1: Vendas Totais**
- **Cor da borda:** Azul (border-blue-500)
- **Título:** "Vendas Totais"
- **Valor:** Soma de todos os itens aprovados de todos os pedidos filtrados
  - **Cálculo:** Soma apenas itens com status `'Produto autorizado'` ou `'aprovado'`
  - **Fórmula:** `sum(item.preco * item.quantidade)` para itens aprovados
  - **Formato:** R$ X.XXX,XX (formato brasileiro)
- **Subtítulo:** Quantidade de pedidos com itens aprovados
  - Exemplo: "5 pedidos com itens aprovados"

##### **Card 2: Total de Pedidos**
- **Cor da borda:** Verde (border-green-500)
- **Título:** "Total de Pedidos"
- **Valor:** Quantidade total de pedidos filtrados
- **Subtítulo:** Breakdown por status:
  - **Aprovados:** Pedidos com pelo menos 1 item `'Produto autorizado'` ou `'aprovado'`
  - **Pendentes:** Pedidos com itens sem status ou status `'pendente'`
  - **Rejeitados:** Pedidos com pelo menos 1 item `'rejeitado'`

##### **Card 3: Total de Empresas**
- **Cor da borda:** Roxo (border-purple-500)
- **Título:** "Total de Empresas"
- **Valor:** Quantidade total de empresas cadastradas
- **Subtítulo:** Quantidade de gestores cadastrados
  - Exemplo: "10 gestores cadastrados"

##### **Card 4: Total de Funcionários**
- **Cor da borda:** Laranja (border-orange-500)
- **Título:** "Total de Funcionários"
- **Valor:** Soma dos funcionários do último upload de cada empresa
  - **Lógica:** Agrupa uploads por `empresa_id` e mantém apenas o mais recente
  - **Fonte:** Tabela `funcionarios_uploads`
- **Subtítulo:** "Funcionários cadastrados (último upload de cada empresa)"

---

#### **3. Tabela: Vendas por Empresa**
Localização: Abaixo dos cards  
Layout: Tabela responsiva com scroll horizontal

**Colunas:**
1. **Empresa** - Nome da empresa
2. **Vendas** - Total em R$ (formato brasileiro)
   - Soma apenas itens aprovados (`'Produto autorizado'` ou `'aprovado'`)
3. **Pedidos** - Quantidade de pedidos com itens aprovados
4. **Funcionários** - Quantidade de funcionários (do último upload)
5. **Ações** - Botão "Ver Detalhes" (futuro)

**Ordenação:**
- Primária: Por valor de vendas (maior para menor)
- Secundária: Por quantidade de funcionários (maior para menor)

**Filtros Aplicados:**
- Mesmos filtros dos cards (data início, data fim, empresa)
- Mostra apenas empresas com funcionários cadastrados OU vendas

**Comportamento:**
- Se não houver vendas: exibe "Nenhuma venda registrada ainda"
- Se não houver empresas: exibe "Nenhuma empresa cadastrada"
- Se estiver carregando: exibe "Carregando empresas..." ou "Carregando pedidos..."

---

## 🏢 ABA CADASTRO EMPRESAS

### **Descrição**
Permite cadastrar, visualizar, editar e excluir empresas. Exibe também informações relacionadas (clubes e gestores).

### **Layout**

#### **1. Formulário de Cadastro**
Localização: Topo da aba  
Layout: Formulário horizontal com campos lado a lado

**Campos:**
- **Nome da Empresa** (input type="text")
  - Obrigatório
  - Placeholder: "Nome da Empresa"
  - Validação: Campo obrigatório

- **Cadastro Empresa** (input type="text")
  - Opcional
  - Placeholder: "Código de Cadastro (opcional)"
  - **IMPORTANTE:** Se não preenchido, o sistema NÃO gera código automaticamente
  - Armazenado como `null` se vazio

- **Botão "Cadastrar"**
  - Submete o formulário
  - Valida campos obrigatórios
  - Limpa formulário após sucesso

**Comportamento:**
- Ao cadastrar:
  - Cria empresa na tabela `empresas`
  - Se `cadastro_empresa` estiver vazio, salva como `null`
  - Recarrega lista de empresas
  - Exibe mensagem de sucesso

---

#### **2. Lista de Empresas**
Localização: Abaixo do formulário  
Layout: Cards em grid (1 coluna mobile, 6 colunas desktop)

**Estrutura do Card:**
Cada empresa é exibida em um card com as seguintes informações:

1. **Empresa**
   - Nome da empresa (fonte semibold, cor cinza escuro)

2. **Clube**
   - Nome do primeiro clube associado à empresa
   - Se houver `cadastro_clube`, exibe abaixo do nome
   - Se não houver clube: exibe "-" (itálico, cinza claro)

3. **Gestor**
   - Nome do primeiro gestor associado à empresa
   - Se não houver gestor: exibe "-" (itálico, cinza claro)

4. **Usuário**
   - Usuário do primeiro gestor associado à empresa
   - Se não houver gestor: exibe "-" (itálico, cinza claro)

5. **Ações** (2 colunas)
   - **Botão "Editar"** (roxo)
     - Abre modal de edição
   - **Botão "Excluir"** (vermelho)
     - Confirma exclusão antes de deletar

**Comportamento:**
- Se não houver empresas: exibe "Nenhuma empresa cadastrada ainda."
- Cards têm hover effect (fundo cinza claro)
- Responsivo: em mobile, colunas se empilham

---

#### **3. Modal de Edição de Empresa**
Localização: Overlay centralizado  
Layout: Modal branco com sombra

**Campos:**
- **Nome da Empresa** (input type="text")
  - Obrigatório
  - Pré-preenchido com valor atual
  - Placeholder: "Nome da Empresa"

**Botões:**
- **"Salvar Alterações"** (roxo)
  - Atualiza empresa no banco
  - Fecha modal
  - Recarrega lista
- **"Cancelar"** (cinza)
  - Fecha modal sem salvar
  - Limpa formulário

**Comportamento:**
- Modal aparece sobre overlay escuro (opacidade 50%)
- Fechar: botão X no canto superior direito ou botão Cancelar
- Validação: nome obrigatório

---

#### **4. Modal de Edição de Gestor (Global)**
Localização: Overlay centralizado  
Layout: Modal branco com sombra

**Campos:**
- **Empresa** (select)
  - Dropdown com todas as empresas
  - Obrigatório
  - Pré-selecionado com empresa atual do gestor

- **Nome do Gestor** (input type="text")
  - Obrigatório
  - Pré-preenchido com valor atual
  - Placeholder: "Nome do Gestor"

- **Usuário** (input type="text")
  - Obrigatório
  - Pré-preenchido com valor atual
  - Placeholder: "Usuário"

- **Nova Senha** (input type="password")
  - Opcional
  - Se deixado em branco, mantém senha atual
  - Placeholder: "Nova Senha (deixe em branco para manter)"

**Botões:**
- **"Salvar Alterações"** (roxo)
  - Atualiza gestor no banco
  - Se senha preenchida, atualiza senha (hash)
  - Fecha modal
  - Recarrega lista
- **"Cancelar"** (cinza)
  - Fecha modal sem salvar

**Comportamento:**
- Usado tanto na aba "Cadastro Empresas" quanto na aba "Cadastro Funcionários"
- Validação: empresa, nome e usuário obrigatórios
- Senha: apenas atualiza se preenchida

---

## 👥 ABA CADASTRO FUNCIONÁRIOS

### **Descrição**
Permite visualizar o histórico de uploads de funcionários e os funcionários cadastrados em cada upload.

### **Layout**

#### **1. Lista de Uploads**
Localização: Conteúdo principal  
Layout: Cards expansíveis

**Estrutura do Card de Upload:**
Cada upload é exibido em um card expansível com:

**Cabeçalho (sempre visível):**
- **Nome da Empresa** (fonte bold, roxo)
- **Nome do Arquivo** (texto cinza)
- **Quantidade de Funcionários** (número em destaque)
- **Data do Upload** (formato brasileiro)
- **Botão de Expandir/Recolher** (seta para baixo/cima)

**Conteúdo Expandido:**
- **Lista de Funcionários** (máximo 50 exibidos)
  - Grid responsivo (1 coluna mobile, 2-3 colunas desktop)
  - Cada funcionário exibe:
    - **Nome Completo** (fonte semibold)
    - **Cadastro Empresa** (se houver)
    - **Cadastro Clube** (se houver)
- **Mensagem:** "Mostrando X de Y funcionários" (se houver mais de 50)

**Comportamento:**
- Cards começam recolhidos
- Clique no card ou botão expande/recolhe
- Se não houver uploads: exibe "Nenhum upload de funcionários encontrado."
- Ordenação: Mais recente primeiro (por `created_at`)

**Fonte de Dados:**
- Endpoint: `GET /admin/funcionarios/uploads`
- Retorna: Array de uploads com funcionários relacionados
- Agrupa por empresa e data (dentro de 1 hora do upload)

---

## 📦 ABA CADASTRO PRODUTO

### **Descrição**
Aba com submenu lateral para cadastrar produtos, categorias, marcas e tamanhos.

### **Layout**

#### **1. Menu Lateral**
Localização: Lado esquerdo (largura fixa: 256px)  
Layout: Menu vertical com botões

**Opções:**
1. **Cadastro de Produtos** (padrão)
2. **Cadastro de Categorias**
3. **Cadastro de Marcas**
4. **Cadastro de Tamanhos**

**Comportamento:**
- Botão ativo: fundo roxo, texto branco
- Botões inativos: texto cinza, hover cinza claro
- Clique alterna entre submenus

---

#### **2. Submenu: Cadastro de Produtos**
Localização: Conteúdo principal (direita do menu)

##### **Formulário de Cadastro**

**Seção 1: Upload de Imagens (TOP)**
- **Input de Arquivo**
  - Aceita: JPEG, JPG, PNG, GIF, WEBP
  - Múltiplos arquivos (até 5 imagens)
  - Drag and drop (visual)

- **Preview das Imagens**
  - Grid responsivo (2 colunas mobile, 5 colunas desktop)
  - Cada imagem exibe:
    - Preview (altura fixa: 128px)
    - Botão "Remover" (X vermelho no canto superior direito)
    - Botão "Definir Capa" (no canto inferior esquerdo)
    - Badge "CAPA" (azul) se for a imagem de capa
  - **Imagem de Capa:**
    - Primeira imagem exibida no catálogo
    - Selecionável clicando na imagem ou botão
    - Borda azul e sombra quando selecionada

- **Contador:** "X de 5 imagens selecionadas"

**Seção 2: Informações do Produto**
Layout: Grid 2 colunas

**Campos:**
- **Nome do Produto** (input type="text")
  - Obrigatório
  - Placeholder: "Nome do Produto *"

- **Preço** (input type="number")
  - Obrigatório
  - Step: 0.01
  - Prefixo: "R$" (fixo à esquerda)
  - Placeholder: "Valor *"

- **SKU** (input type="text")
  - Obrigatório
  - Placeholder: "SKU *"

- **EAN** (input type="text")
  - Obrigatório
  - Placeholder: "EAN *"

- **Categoria** (select)
  - Obrigatório
  - Dropdown com categorias cadastradas
  - Opção padrão: "Selecione a Categoria *"

- **Marca** (select)
  - Obrigatório
  - Dropdown com marcas cadastradas
  - Opção padrão: "Selecione a Marca *"

- **Descrição** (textarea)
  - Opcional
  - 4 linhas
  - Placeholder: "Descrição do produto"

- **Estoque** (input type="number")
  - Opcional
  - Valor padrão: 0
  - Placeholder: "Quantidade em estoque"

- **Variações Personalizadas** (textarea)
  - Opcional
  - Placeholder: "Ex: Tamanho: P, M, G | Cor: Azul, Vermelho"
  - Formato: "Chave: Valor1, Valor2 | Chave2: Valor3, Valor4"
  - Processado e convertido em array de objetos

**Botão:**
- **"Cadastrar Produto"** (roxo, largura total)
  - Valida campos obrigatórios
  - Envia imagens via FormData
  - Processa variações
  - Recarrega lista após sucesso

---

#### **3. Submenu: Cadastro de Categorias**
Localização: Conteúdo principal

**Formulário:**
- **Nome da Categoria** (input type="text")
  - Obrigatório
  - Placeholder: "Nome da Categoria"

- **Botão "Cadastrar"** (roxo)

**Lista:**
- Exibe todas as categorias cadastradas
- Cada categoria tem botão "Excluir" (vermelho)
- Confirmação antes de excluir

---

#### **4. Submenu: Cadastro de Marcas**
Localização: Conteúdo principal

**Formulário:**
- **Nome da Marca** (input type="text")
  - Obrigatório
  - Placeholder: "Nome da Marca"

- **Botão "Cadastrar"** (roxo)

**Lista:**
- Exibe todas as marcas cadastradas
- Cada marca tem botão "Excluir" (vermelho)
- Confirmação antes de excluir

---

#### **5. Submenu: Cadastro de Tamanhos**
Localização: Conteúdo principal

**Formulário:**
- **Nome do Tamanho** (input type="text")
  - Obrigatório
  - Placeholder: "Nome do Tamanho"

- **Botão "Cadastrar"** (roxo)

**Lista:**
- Exibe todos os tamanhos cadastrados
- Cada tamanho tem botão "Excluir" (vermelho)
- Confirmação antes de excluir

---

## 🛍️ ABA PRODUTOS

### **Descrição**
Lista todos os produtos cadastrados com opções de edição e exclusão.

### **Layout**

#### **1. Lista de Produtos**
Localização: Conteúdo principal  
Layout: Grid responsivo (1 coluna mobile, 2-3 colunas desktop)

**Estrutura do Card de Produto:**
Cada produto é exibido em um card com:

- **Imagem de Capa**
  - Primeira imagem do produto
  - Altura fixa: 200px
  - Object-fit: cover
  - Hover: leve zoom

- **Nome do Produto** (fonte bold)
- **Preço** (fonte semibold, roxo)
  - Formato: R$ X,XX

- **Informações Adicionais:**
  - Categoria
  - Marca
  - SKU
  - EAN
  - Estoque (se disponível)

- **Botões de Ação:**
  - **"Editar"** (azul)
    - Abre modal de edição
  - **"Excluir"** (vermelho)
    - Confirma exclusão

**Comportamento:**
- Se não houver produtos: exibe "Nenhum produto cadastrado ainda."
- Cards têm hover effect
- Responsivo

---

#### **2. Modal de Edição de Produto**
Localização: Overlay centralizado  
Layout: Modal grande (largura máxima) com scroll

**Estrutura:**

**Seção 1: Imagens (TOP)**
- **Imagens Existentes**
  - Grid 2-3 colunas
  - Cada imagem tem:
    - Preview
    - Botão "Remover" (X vermelho)
  - Botão "Ver Todas as Imagens" (azul) - abre visualizador

- **Novas Imagens (Preview)**
  - Grid 2-3 colunas
  - Preview das novas imagens selecionadas
  - Botão "Remover" em cada uma

- **Upload de Novas Imagens**
  - Input de arquivo
  - Aceita múltiplos (até 5 total)
  - Contador: "Total: X de 5 imagens"

**Seção 2: Informações do Produto**
Layout: Grid 2 colunas

**Campos:**
- **Nome do Produto** (input)
- **Preço** (input com prefixo R$)
- **SKU** (input)
- **EAN** (input)
- **Categoria** (select)
- **Marca** (select)
- **Descrição** (textarea)
- **Estoque** (input number)
- **Variações Personalizadas** (textarea)

**Botões:**
- **"Salvar Alterações"** (roxo)
- **"Cancelar"** (cinza)

**Comportamento:**
- Modal com scroll se conteúdo for grande
- Validação: nome, preço, categoria, marca obrigatórios
- Imagens: remove do banco ao clicar em "Remover"
- Novas imagens: adiciona ao produto

---

#### **3. Visualizador de Imagens**
Localização: Overlay centralizado  
Layout: Modal com imagem grande centralizada

**Funcionalidades:**
- Imagem grande no centro
- Botões de navegação (anterior/próxima)
- Contador: "Imagem X de Y"
- Botão "Fechar" (X no canto)

**Comportamento:**
- Navegação por setas do teclado (futuro)
- Fecha ao clicar fora ou no X

---

## 📋 ABA PEDIDOS

### **Descrição**
Visualiza todos os pedidos do sistema, agrupados por empresa, com opções de aprovação/rejeição por item.

### **Layout**

#### **1. Filtros**
Localização: Topo da aba  
Layout: Linha horizontal

**Campos:**
- **Status** (select)
  - Opções: Todos, Pendente, Verificando Estoque, Aguardando Aprovação de Estoque, Produto Autorizado, Aprovado, Produto Sem Estoque, Rejeitado
  - Filtra pedidos por status dos itens

- **Empresa** (select)
  - Dropdown com todas as empresas
  - Opção padrão: "Todas as Empresas"

- **Data Início** (input type="date")
- **Data Fim** (input type="date")

**Comportamento:**
- Filtros aplicados em tempo real
- Filtro de status: verifica status dos itens, não do pedido
- Filtro de data: considera apenas a data (ignora hora)

---

#### **2. Lista de Pedidos**
Localização: Abaixo dos filtros  
Layout: Agrupado por empresa

**Estrutura:**

##### **Grupo por Empresa:**
- **Cabeçalho:**
  - Nome da empresa (fonte bold, roxo)
  - Contador: "(X pedidos)"

##### **Card de Pedido:**
Cada pedido é exibido em um card expansível:

**Cabeçalho (sempre visível):**
- **ID do Pedido** (fonte semibold)
  - Formato: "Pedido #123"

- **Informações:**
  - Funcionário: Nome completo
  - Empresa: Nome da empresa
  - Cadastro Empresa: (se houver, do funcionário)
  - Cadastro Clube: (se houver, do clube ou funcionário)
  - Data: Data e hora formatadas (pt-BR)

- **Resumo:**
  - Quantidade de itens
  - Total: R$ X,XX

- **Total do Pedido** (canto direito, fonte bold, roxo)

- **Botão "Ver detalhes" / "Ocultar detalhes"**
  - Expande/recolhe card
  - Ícone de seta

**Conteúdo Expandido:**
- **Título:** "Itens do Pedido (X):"

- **Lista de Itens:**
  Cada item exibe:
  - **Nome do Produto** (fonte semibold)
  - **Status Badge:**
    - Cores por status:
      - Pendente: Amarelo
      - Verificando Estoque: Azul
      - Aguardando Aprovação de Estoque: Azul
      - Produto Autorizado: Verde
      - Aprovado: Verde
      - Produto Sem Estoque: Laranja
      - Rejeitado: Vermelho
  - **Variação:** (se houver)
  - **Quantidade:** X unidades
  - **Preço Unitário:** R$ X,XX
  - **Subtotal:** R$ X,XX

  - **Botões de Ação (por item):**
    - **"Aprovar"** (verde)
      - Disponível apenas se status for `'aguardando aprovação de estoque'`
      - Atualiza status para `'Produto autorizado'`
      - Reduz estoque do produto
    - **"Rejeitar"** (vermelho)
      - Disponível apenas se status for `'aguardando aprovação de estoque'`
      - Atualiza status para `'rejeitado'`
    - **"Excluir"** (vermelho)
      - Remove item do pedido
      - Se item estava autorizado, retorna estoque

**Comportamento:**
- Cards começam recolhidos
- Clique no card ou botão expande/recolhe
- Status é por item, não por pedido
- Botões de ação aparecem apenas para itens com status `'aguardando aprovação de estoque'`
- Se não houver pedidos: exibe "Nenhum pedido encontrado."

---

#### **3. Função de Impressão**
Localização: Botão "Imprimir" (futuro)  
Layout: Gera HTML para impressão

**Conteúdo Impresso:**
- Cabeçalho: "Pedido #X"
- Informações:
  - Funcionário
  - Empresa
  - Cadastro Empresa (se houver)
  - Cadastro Clube (se houver)
  - Data e hora
- **NÃO imprime:** Status do pedido
- Tabela de itens:
  - Colunas: Produto, Variação, Quantidade, Preço Unit., SKU, EAN
  - **NÃO imprime:** Subtotal
- Total do pedido

**Comportamento:**
- Abre nova janela para impressão
- Aplica filtros antes de imprimir
- Agrupa por pedido
- Ordena por data (mais recente primeiro)

---

## 🎨 LAYOUT E DESIGN

### **Cores Principais**
- **Roxo Primário:** `#7C3AED` (primary-purple)
- **Verde:** `#10B981` (sucesso/aprovação)
- **Vermelho:** `#EF4444` (erro/rejeição)
- **Amarelo:** `#F59E0B` (pendente)
- **Azul:** `#3B82F6` (informação)
- **Laranja:** `#F97316` (alerta)

### **Tipografia**
- **Títulos:** Fonte bold, tamanhos variados
- **Texto:** Fonte normal, tamanho padrão
- **Labels:** Fonte medium, tamanho pequeno

### **Espaçamento**
- Padding padrão: 16px (p-4)
- Gap entre elementos: 16px (gap-4)
- Margin entre seções: 24px (mb-6)

### **Responsividade**
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3-4 colunas (dependendo do componente)

### **Componentes Reutilizáveis**
- Cards com sombra e borda arredondada
- Botões com hover effect
- Modais com overlay escuro
- Inputs com focus ring roxo
- Badges de status coloridos

---

## 🔄 FLUXOS DE TRABALHO

### **1. Cadastro de Empresa Completo**
1. Admin acessa aba "Cadastro Empresas"
2. Preenche "Nome da Empresa" (obrigatório)
3. Opcionalmente preenche "Cadastro Empresa"
4. Clica em "Cadastrar"
5. Sistema cria empresa no banco
6. Lista é atualizada automaticamente
7. Empresa aparece na lista com informações relacionadas (clube, gestor)

### **2. Cadastro de Produto**
1. Admin acessa aba "Cadastro Produto" > "Cadastro de Produtos"
2. Faz upload de até 5 imagens
3. Seleciona imagem de capa (clicando na imagem)
4. Preenche informações obrigatórias:
   - Nome, Preço, SKU, EAN, Categoria, Marca
5. Opcionalmente preenche:
   - Descrição, Estoque, Variações
6. Clica em "Cadastrar Produto"
7. Sistema processa imagens e cria produto
8. Produto aparece na aba "Produtos"

### **3. Aprovação de Pedido (Admin)**
1. Admin acessa aba "Pedidos"
2. Filtra pedidos se necessário
3. Expande pedido desejado
4. Visualiza itens com status "Aguardando aprovação de estoque"
5. Para cada item:
   - Clica em "Aprovar" → Item fica "Produto autorizado" e estoque é reduzido
   - OU clica em "Rejeitar" → Item fica "rejeitado"
   - OU clica em "Excluir" → Item é removido (se autorizado, estoque retorna)
6. Sistema atualiza status e estoque em tempo real

### **4. Edição de Produto**
1. Admin acessa aba "Produtos"
2. Localiza produto desejado
3. Clica em "Editar"
4. Modal abre com dados atuais
5. Pode:
   - Remover imagens existentes
   - Adicionar novas imagens
   - Alterar informações
6. Clica em "Salvar Alterações"
7. Sistema atualiza produto no banco
8. Lista é atualizada

---

## 📐 REGRAS DE NEGÓCIO

### **1. Status de Pedidos**
- **Status é por item, não por pedido**
- Status possíveis:
  - `pendente` - Item recém-adicionado
  - `verificando estoque` - Após gestor aprovar
  - `aguardando aprovação de estoque` - Aguardando admin
  - `Produto autorizado` - Aprovado pelo admin
  - `aprovado` - Sinônimo de autorizado
  - `produto sem estoque` - Sem estoque disponível
  - `rejeitado` - Rejeitado pelo admin

### **2. Cálculo de Vendas**
- **Apenas itens aprovados contam para vendas**
- Status válidos: `'Produto autorizado'` ou `'aprovado'`
- Fórmula: `sum(item.preco * item.quantidade)` para itens aprovados

### **3. Estoque**
- Produtos com `estoque <= 0` ou `ativo = false` **não aparecem** na tela de produtos (funcionários)
- Ao aprovar item: estoque é reduzido
- Ao excluir item autorizado: estoque é retornado

### **4. Cadastro de Empresa**
- `cadastro_empresa` é **opcional**
- Se não preenchido, salva como `null` (não gera código automaticamente)
- Código gerado automaticamente **não é mais usado**

### **5. Imagens de Produto**
- Máximo 5 imagens por produto
- Primeira imagem é a "capa"
- Formatos aceitos: JPEG, JPG, PNG, GIF, WEBP
- Imagens são armazenadas no Supabase Storage

### **6. Filtros**
- Filtros de data consideram apenas a data (ignoram hora)
- Filtro de status verifica status dos itens, não do pedido
- Filtros são aplicados em tempo real

### **7. Permissões**
- Apenas usuários com `tipo === 'master'` podem acessar
- Se não for master, redireciona para `/adm`

---

## 🔒 SEGURANÇA E VALIDAÇÕES

### **Validações de Formulário**
- Campos obrigatórios são validados antes do submit
- Mensagens de erro são exibidas em caso de falha
- Confirmação antes de excluir registros

### **Proteção de Rotas**
- Verificação de autenticação no `useEffect`
- Redirecionamento automático se não autorizado

### **Normalização de Dados**
- Função `normalizarDadosPedido` garante acesso consistente a dados
- Trata casos onde Supabase retorna arrays ou objetos

---

## 📝 NOTAS IMPORTANTES

1. **Campo "Nome do Clube" está OCULTO** em adm/dashboard e adm/gestor
   - Apenas "Cadastro Clube" é exibido (se houver)

2. **Status de pedidos é por item, não por pedido**
   - Um pedido pode ter itens com status diferentes

3. **Cálculo de vendas considera apenas itens aprovados**
   - Itens pendentes ou rejeitados não contam

4. **Estoque zero ou produto inativo não aparece para funcionários**
   - Apenas na tela de produtos (não no admin)

5. **Cadastro de empresa não gera código automaticamente**
   - Se `cadastro_empresa` estiver vazio, salva como `null`

---

## 🔗 ENDPOINTS UTILIZADOS

- `GET /admin/empresas` - Lista empresas
- `POST /admin/empresas` - Cria empresa
- `PUT /admin/empresas/:id` - Atualiza empresa
- `DELETE /admin/empresas/:id` - Exclui empresa
- `GET /admin/gestores` - Lista gestores
- `POST /admin/gestores` - Cria gestor
- `PUT /admin/gestores/:id` - Atualiza gestor
- `DELETE /admin/gestores/:id` - Exclui gestor
- `GET /admin/funcionarios/uploads` - Lista uploads de funcionários
- `GET /admin/pedidos` - Lista pedidos
- `PUT /admin/pedidos/:pedidoId/itens/:itemId/aprovar` - Aprova item
- `PUT /admin/pedidos/:pedidoId/itens/:itemId/rejeitar` - Rejeita item
- `DELETE /admin/pedidos/:pedidoId/itens/:itemId` - Exclui item
- `GET /admin/produtos` - Lista produtos
- `POST /admin/produtos` - Cria produto
- `PUT /admin/produtos/:id` - Atualiza produto
- `DELETE /admin/produtos/:id` - Exclui produto
- `GET /admin/categorias` - Lista categorias
- `POST /admin/categorias` - Cria categoria
- `DELETE /admin/categorias/:id` - Exclui categoria
- `GET /admin/marcas` - Lista marcas
- `POST /admin/marcas` - Cria marca
- `DELETE /admin/marcas/:id` - Exclui marca
- `GET /admin/tamanhos` - Lista tamanhos
- `POST /admin/tamanhos` - Cria tamanho
- `DELETE /admin/tamanhos/:id` - Exclui tamanho

---

**Última atualização:** 2024  
**Versão do Documento:** 1.0  
**Autor:** Sistema de Documentação Automática

