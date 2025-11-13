import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para analisar uma planilha Excel
function analisarPlanilha(filePath) {
  console.log('📊 ANALISANDO PLANILHA EXCEL\n');
  console.log('Arquivo:', filePath);
  console.log('============================================================\n');

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`📄 Planilha: ${sheetName}`);
    console.log(`📋 Total de planilhas: ${workbook.SheetNames.length}`);
    if (workbook.SheetNames.length > 1) {
      console.log(`   Outras planilhas: ${workbook.SheetNames.slice(1).join(', ')}`);
    }
    console.log('');

    // Tentar ler com header
    let data = xlsx.utils.sheet_to_json(worksheet, {
      defval: '',
      blankrows: false
    });

    console.log(`📊 Total de linhas (com header): ${data.length}\n`);

    if (data.length === 0) {
      console.log('⚠️  Nenhum dado encontrado com header. Tentando sem header...\n');
      data = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });
      console.log(`📊 Total de linhas (sem header): ${data.length}\n`);
    }

    if (data.length === 0) {
      console.log('❌ ERRO: Nenhum dado encontrado na planilha!');
      return;
    }

    // Analisar primeira linha (header ou primeira linha de dados)
    console.log('============================================================');
    console.log('🔍 ANÁLISE DA ESTRUTURA:');
    console.log('============================================================\n');

    const primeiraLinha = data[0];
    const chaves = Object.keys(primeiraLinha);
    
    console.log(`📋 Total de colunas encontradas: ${chaves.length}\n`);
    console.log('📝 Colunas encontradas:');
    chaves.forEach((chave, index) => {
      const valor = primeiraLinha[chave];
      console.log(`   ${index + 1}. "${chave}" = "${valor}" (tipo: ${typeof valor})`);
    });
    console.log('');

    // Verificar se encontra colunas esperadas
    console.log('============================================================');
    console.log('✅ VERIFICAÇÃO DE COMPATIBILIDADE:');
    console.log('============================================================\n');

    // Função auxiliar para buscar valor (mesma do código principal)
    const buscarValor = (obj, possiveisChaves) => {
      if (!obj || typeof obj !== 'object') {
        return null;
      }
      
      const chavesObj = Object.keys(obj || {});
      
      // Primeiro, tentar busca exata
      for (const chavePossivel of possiveisChaves) {
        if (obj[chavePossivel] !== undefined && obj[chavePossivel] !== null && obj[chavePossivel] !== '') {
          const valor = obj[chavePossivel];
          const valorStr = String(valor).trim();
          if (valorStr && valorStr !== 'null' && valorStr !== 'undefined') {
            return { chave: chavePossivel, valor: valorStr };
          }
        }
      }
      
      // Depois, buscar ignorando case, espaços e caracteres especiais
      for (const chavePossivel of possiveisChaves) {
        const chaveEncontrada = chavesObj.find((k) => {
          const kNormalized = k.toLowerCase().replace(/\s+/g, '').replace(/[_\-\.,;:]/g, '');
          const chaveNormalized = chavePossivel.toLowerCase().replace(/\s+/g, '').replace(/[_\-\.,;:]/g, '');
          return kNormalized === chaveNormalized;
        });
        
        if (chaveEncontrada) {
          const valor = obj[chaveEncontrada];
          if (valor !== undefined && valor !== null && valor !== '') {
            const valorStr = String(valor).trim();
            if (valorStr && valorStr !== 'null' && valorStr !== 'undefined') {
              return { chave: chaveEncontrada, valor: valorStr };
            }
          }
        }
      }
      
      return null;
    };

    // Verificar Nome
    const possiveisNomes = [
      'nome_empregado', 'Nome Empregado', 'NOME EMPREGADO', 'nome empregado', 'Nome empregado',
      'nome_completo', 'Nome Completo', 'NOME COMPLETO', 'nome completo', 'Nome completo',
      'nome', 'Nome', 'NOME', 'empregado', 'Empregado', 'EMPREGADO',
      'funcionario', 'Funcionario', 'FUNCIONARIO', 'funcionário', 'Funcionário', 'FUNCIONÁRIO',
      'Nome do Empregado', 'NOME DO EMPREGADO', 'nome do empregado',
      'Nome do Funcionário', 'NOME DO FUNCIONÁRIO', 'nome do funcionário',
      'Nome Funcionário', 'NOME FUNCIONÁRIO', 'nome funcionário',
      'Colaborador', 'colaborador', 'COLABORADOR', 'Nome Colaborador'
    ];
    
    const nomeEncontrado = buscarValor(primeiraLinha, possiveisNomes);
    if (nomeEncontrado) {
      console.log(`✅ NOME encontrado: "${nomeEncontrado.chave}" = "${nomeEncontrado.valor}"`);
    } else {
      console.log('❌ NOME NÃO ENCONTRADO!');
      console.log('   Colunas disponíveis:', chaves.join(', '));
    }
    console.log('');

    // Verificar Cadastro Empresa
    const possiveisCadastrosEmpresa = [
      'cadastro_empresa', 'Cadastro_Empresa', 'CADASTRO_EMPRESA',
      'cadastro empresa', 'Cadastro Empresa', 'CADASTRO EMPRESA', 'Cadastro empresa',
      'Cadastro da Empresa', 'CADASTRO DA EMPRESA', 'cadastro da empresa',
      'Código Empresa', 'CODIGO EMPRESA', 'código empresa', 'Codigo Empresa',
      'Código da Empresa', 'CODIGO DA EMPRESA', 'código da empresa',
      'Empresa', 'EMPRESA', 'empresa', 'ID Empresa', 'id empresa', 'ID_EMPRESA'
    ];
    
    const cadastroEmpresaEncontrado = buscarValor(primeiraLinha, possiveisCadastrosEmpresa);
    if (cadastroEmpresaEncontrado) {
      console.log(`✅ CADASTRO EMPRESA encontrado: "${cadastroEmpresaEncontrado.chave}" = "${cadastroEmpresaEncontrado.valor}"`);
    } else {
      console.log('❌ CADASTRO EMPRESA NÃO ENCONTRADO!');
      console.log('   Colunas disponíveis:', chaves.join(', '));
    }
    console.log('');

    // Verificar Cadastro Clube
    const possiveisCadastrosClube = [
      'cadastro_clube', 'Cadastro_Clube', 'CADASTRO_CLUBE',
      'cadastro clube', 'Cadastro Clube', 'CADASTRO CLUBE', 'Cadastro clube',
      'Cadastro do Clube', 'CADASTRO DO CLUBE', 'cadastro do clube',
      'Código Clube', 'CODIGO CLUBE', 'código clube', 'Codigo Clube',
      'Código do Clube', 'CODIGO DO CLUBE', 'código do clube',
      'Clube', 'CLUBE', 'clube', 'ID Clube', 'id clube', 'ID_CLUBE'
    ];
    
    const cadastroClubeEncontrado = buscarValor(primeiraLinha, possiveisCadastrosClube);
    if (cadastroClubeEncontrado) {
      console.log(`✅ CADASTRO CLUBE encontrado: "${cadastroClubeEncontrado.chave}" = "${cadastroClubeEncontrado.valor}"`);
    } else {
      console.log('⚠️  CADASTRO CLUBE não encontrado (opcional)');
    }
    console.log('');

    // Verificar algumas linhas de dados
    console.log('============================================================');
    console.log('📋 AMOSTRA DE DADOS (primeiras 3 linhas):');
    console.log('============================================================\n');

    data.slice(0, 3).forEach((row, index) => {
      console.log(`Linha ${index + 1}:`);
      const nome = buscarValor(row, possiveisNomes);
      const cadEmpresa = buscarValor(row, possiveisCadastrosEmpresa);
      const cadClube = buscarValor(row, possiveisCadastrosClube);
      
      console.log(`   Nome: ${nome ? nome.valor : '❌ NÃO ENCONTRADO'}`);
      console.log(`   Cadastro Empresa: ${cadEmpresa ? cadEmpresa.valor : '❌ NÃO ENCONTRADO'}`);
      console.log(`   Cadastro Clube: ${cadClube ? cadClube.valor : '⚠️  Não encontrado (opcional)'}`);
      console.log('');
    });

    // Resumo final
    console.log('============================================================');
    console.log('📊 RESUMO:');
    console.log('============================================================\n');

    const totalLinhas = data.length;
    let linhasValidas = 0;
    let linhasComErro = [];

    data.forEach((row, index) => {
      const nome = buscarValor(row, possiveisNomes);
      const cadEmpresa = buscarValor(row, possiveisCadastrosEmpresa);
      
      if (nome && cadEmpresa) {
        linhasValidas++;
      } else {
        linhasComErro.push({
          linha: index + 2, // +2 porque index começa em 0 e Excel começa em 1, mais 1 para header
          nome: nome ? 'OK' : 'FALTANDO',
          cadastroEmpresa: cadEmpresa ? 'OK' : 'FALTANDO'
        });
      }
    });

    console.log(`✅ Linhas válidas: ${linhasValidas} de ${totalLinhas}`);
    if (linhasComErro.length > 0) {
      console.log(`❌ Linhas com erro: ${linhasComErro.length}`);
      console.log('\nPrimeiras 5 linhas com erro:');
      linhasComErro.slice(0, 5).forEach(erro => {
        console.log(`   Linha ${erro.linha}: Nome=${erro.nome}, Cadastro Empresa=${erro.cadastroEmpresa}`);
      });
    } else {
      console.log('✅ Todas as linhas são válidas!');
    }
    console.log('');

    // Conclusão
    console.log('============================================================');
    console.log('🎯 CONCLUSÃO:');
    console.log('============================================================\n');

    if (nomeEncontrado && cadastroEmpresaEncontrado && linhasValidas > 0) {
      console.log('✅ PLANILHA COMPATÍVEL!');
      console.log(`   O upload deve funcionar com ${linhasValidas} funcionário(s).`);
    } else {
      console.log('❌ PLANILHA NÃO COMPATÍVEL!');
      if (!nomeEncontrado) {
        console.log('   ❌ Coluna de Nome não encontrada');
      }
      if (!cadastroEmpresaEncontrado) {
        console.log('   ❌ Coluna de Cadastro Empresa não encontrada');
      }
      if (linhasValidas === 0) {
        console.log('   ❌ Nenhuma linha válida encontrada');
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ ERRO ao analisar planilha:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar análise
const filePath = process.argv[2];

if (!filePath) {
  console.log('❌ Uso: node analisar-planilha-excel.js <caminho-do-arquivo.xlsx>');
  console.log('\nExemplo:');
  console.log('   node analisar-planilha-excel.js "C:\\Users\\felip\\Desktop\\PLanilha Sistema B2B - Schaeffler.xlsx"');
  process.exit(1);
}

analisarPlanilha(filePath);

