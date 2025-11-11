#!/usr/bin/env node

/**
 * 🔒 SCRIPT DE VERIFICAÇÃO DE CÓDIGO PROTEGIDO
 * 
 * Este script verifica se todas as funcionalidades críticas estão presentes no código.
 * Execute antes de fazer commit para garantir que nada foi removido acidentalmente.
 * 
 * USO: node scripts/verificar-codigo-protegido.js
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Resultados da verificação
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

/**
 * Verifica se um arquivo existe e contém um padrão
 */
function verificarArquivo(arquivo, padroes, descricao) {
  totalChecks++;
  const caminhoCompleto = path.join(process.cwd(), arquivo);
  
  if (!fs.existsSync(caminhoCompleto)) {
    failedChecks++;
    failures.push({
      tipo: 'ARQUIVO NÃO ENCONTRADO',
      arquivo,
      descricao,
      erro: 'Arquivo não existe'
    });
    return false;
  }

  const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
  const padroesFaltando = [];

  for (const padrao of padroes) {
    if (!conteudo.includes(padrao)) {
      padroesFaltando.push(padrao);
    }
  }

  if (padroesFaltando.length > 0) {
    failedChecks++;
    failures.push({
      tipo: 'CÓDIGO FALTANDO',
      arquivo,
      descricao,
      erro: `Padrões não encontrados: ${padroesFaltando.join(', ')}`
    });
    return false;
  }

  passedChecks++;
  return true;
}

/**
 * Verifica se uma rota existe
 */
function verificarRota(arquivo, rota, metodo, descricao) {
  totalChecks++;
  const caminhoCompleto = path.join(process.cwd(), arquivo);
  
  if (!fs.existsSync(caminhoCompleto)) {
    failedChecks++;
    failures.push({
      tipo: 'ARQUIVO NÃO ENCONTRADO',
      arquivo,
      descricao,
      erro: 'Arquivo não existe'
    });
    return false;
  }

  const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
  
  // Verificar se a rota existe de forma mais flexível
  // Remove /admin ou /auth do início para busca mais flexível
  const rotaLimpa = rota.replace(/^\/admin/, '').replace(/^\/auth/, '');
  const partesRota = rotaLimpa.split('/').filter(p => p && !p.startsWith(':'));
  
  // Criar padrão que busca partes da rota no arquivo
  const padraoBusca = partesRota.join('.*');
  
  // Verificar se existe router.METODO com a rota
  const padraoRota = new RegExp(`router\\.${metodo.toLowerCase()}\\s*\\(\\s*['"].*${padraoBusca}.*['"]`, 'i');
  
  // Verificar também sem o prefixo /admin ou /auth
  const padraoRota2 = new RegExp(`router\\.${metodo.toLowerCase()}\\s*\\(\\s*['"].*${rota.replace(/\//g, '.*')}.*['"]`, 'i');
  
  if (!padraoRota.test(conteudo) && !padraoRota2.test(conteudo)) {
    // Última tentativa: verificar se pelo menos partes da rota existem
    const todasPartesExistem = partesRota.every(parte => conteudo.includes(parte));
    
    if (!todasPartesExistem) {
      failedChecks++;
      failures.push({
        tipo: 'ROTA FALTANDO',
        arquivo,
        descricao,
        erro: `Rota ${metodo} ${rota} não encontrada`
      });
      return false;
    }
  }

  passedChecks++;
  return true;
}

console.log(`${colors.cyan}🔒 VERIFICAÇÃO DE CÓDIGO PROTEGIDO${colors.reset}\n`);
console.log(`${colors.blue}Verificando funcionalidades críticas...${colors.reset}\n`);

// ========== VERIFICAÇÕES ==========

// 1. Sistema de Estoque
console.log(`${colors.yellow}1. Verificando Sistema de Estoque...${colors.reset}`);
verificarArquivo(
  'client/src/pages/admin/AdminDashboard.jsx',
  ['estoque:', 'estoque', 'Estoque'],
  'Sistema de Estoque - Frontend'
);
verificarArquivo(
  'server/routes/admin.js',
  ['estoque', 'novoEstoque'],
  'Sistema de Estoque - Backend'
);

// 2. Botão Toggle Ativo
console.log(`${colors.yellow}2. Verificando Botão ON/OFF...${colors.reset}`);
verificarArquivo(
  'client/src/pages/admin/AdminDashboard.jsx',
  ['handleToggleAtivo', 'toggle-ativo'],
  'Botão Toggle Ativo - Frontend'
);
verificarRota(
  'server/routes/admin.js',
  '/admin/produtos/:id/toggle-ativo',
  'PUT',
  'Rota Toggle Ativo - Backend'
);

// 3. Status de Pedidos por Item
console.log(`${colors.yellow}3. Verificando Status de Pedidos por Item...${colors.reset}`);
verificarArquivo(
  'client/src/pages/admin/AdminDashboard.jsx',
  ['aprovar', 'rejeitar', 'verificando estoque'],
  'Status de Pedidos - Frontend'
);
verificarRota(
  'server/routes/admin.js',
  '/admin/pedidos/:pedidoId/itens/:itemId/aprovar',
  'PUT',
  'Rota Aprovar Item - Backend'
);
verificarRota(
  'server/routes/admin.js',
  '/admin/pedidos/:pedidoId/itens/:itemId/rejeitar',
  'PUT',
  'Rota Rejeitar Item - Backend'
);

// 4. Campos Obrigatórios
console.log(`${colors.yellow}4. Verificando Campos Obrigatórios...${colors.reset}`);
verificarArquivo(
  'client/src/pages/admin/AdminDashboard.jsx',
  ['sku', 'ean', 'EAN', 'SKU', 'preco', 'categoria', 'marca', 'descricao'],
  'Campos Obrigatórios de Produtos'
);

// 5. Impressão de Pedidos
console.log(`${colors.yellow}5. Verificando Impressão de Pedidos...${colors.reset}`);
verificarArquivo(
  'client/src/pages/admin/AdminDashboard.jsx',
  ['handleImprimirPorProduto', 'EAN', 'cadastroClube'],
  'Função de Impressão de Pedidos'
);

// 6. Telas do Sistema
console.log(`${colors.yellow}6. Verificando Telas do Sistema...${colors.reset}`);
const telas = [
  { arquivo: 'client/src/pages/Login.jsx', descricao: 'Tela de Login' },
  { arquivo: 'client/src/pages/Products.jsx', descricao: 'Tela de Produtos' },
  { arquivo: 'client/src/pages/Cart.jsx', descricao: 'Tela de Carrinho' },
  { arquivo: 'client/src/pages/Orders.jsx', descricao: 'Tela de Pedidos' },
  { arquivo: 'client/src/pages/admin/AdminLogin.jsx', descricao: 'Tela de Login Admin' },
  { arquivo: 'client/src/pages/admin/AdminDashboard.jsx', descricao: 'Dashboard Admin' },
  { arquivo: 'client/src/pages/admin/ManagerDashboard.jsx', descricao: 'Dashboard Gestor' }
];

telas.forEach(tela => {
  totalChecks++;
  const caminhoCompleto = path.join(process.cwd(), tela.arquivo);
  if (fs.existsSync(caminhoCompleto)) {
    passedChecks++;
  } else {
    failedChecks++;
    failures.push({
      tipo: 'TELA FALTANDO',
      arquivo: tela.arquivo,
      descricao: tela.descricao,
      erro: 'Arquivo não existe'
    });
  }
});

// 7. Rotas da API
console.log(`${colors.yellow}7. Verificando Rotas da API...${colors.reset}`);
verificarRota('server/routes/auth.js', '/auth/employee', 'POST', 'Login Funcionário');
verificarRota('server/routes/auth.js', '/auth/admin', 'POST', 'Login Admin');
// A rota /products pode estar como '/' no arquivo products.js (rota raiz do router)
verificarArquivo('server/routes/products.js', ['router.get', "router.get('/',"], 'Listar Produtos');
verificarRota('server/routes/admin.js', '/admin/produtos', 'GET', 'Listar Produtos Admin');
verificarRota('server/routes/admin.js', '/admin/produtos', 'POST', 'Criar Produto');
verificarRota('server/routes/admin.js', '/admin/pedidos', 'GET', 'Listar Pedidos Admin');

// ========== RESULTADO FINAL ==========

console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}RESULTADO DA VERIFICAÇÃO${colors.reset}`);
console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

console.log(`Total de verificações: ${colors.blue}${totalChecks}${colors.reset}`);
console.log(`✅ Passou: ${colors.green}${passedChecks}${colors.reset}`);
console.log(`❌ Falhou: ${colors.red}${failedChecks}${colors.reset}\n`);

if (failedChecks > 0) {
  console.log(`${colors.red}🚨 ATENÇÃO: FUNCIONALIDADES CRÍTICAS FALTANDO!${colors.reset}\n`);
  console.log(`${colors.yellow}Falhas encontradas:${colors.reset}\n`);
  
  failures.forEach((falha, index) => {
    console.log(`${colors.red}${index + 1}. ${falha.tipo}${colors.reset}`);
    console.log(`   Arquivo: ${falha.arquivo}`);
    console.log(`   Descrição: ${falha.descricao}`);
    console.log(`   Erro: ${falha.erro}\n`);
  });

  console.log(`${colors.red}⚠️  NÃO FAÇA COMMIT ATÉ CORRIGIR TODAS AS FALHAS!${colors.reset}`);
  console.log(`${colors.yellow}Execute: git restore <arquivo> para restaurar do Git${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ TODAS AS VERIFICAÇÕES PASSARAM!${colors.reset}`);
  console.log(`${colors.green}✅ Código protegido está intacto.${colors.reset}\n`);
  process.exit(0);
}

