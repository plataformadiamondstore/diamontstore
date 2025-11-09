import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURAÇÃO - PREENCHA AQUI
// ============================================
// Cole aqui a Connection String que você obteve do Supabase
// Formato: postgresql://postgres:SUA_SENHA@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

// ============================================

const { Client } = pg;

async function createTables() {
  console.log('🚀 Iniciando criação de tabelas no Supabase...\n');

  // Verificar se a connection string foi preenchida
  if (DATABASE_URL === 'COLE_A_CONNECTION_STRING_AQUI') {
    console.log('❌ ERRO: Você precisa preencher a DATABASE_URL no arquivo!');
    console.log('📋 Abra o arquivo server/scripts/create-tables.js');
    console.log('📋 E cole a Connection String do Supabase na variável DATABASE_URL\n');
    console.log('💡 Veja o arquivo server/COMO_OBTER_CONNECTION_STRING.md para instruções\n');
    return;
  }

  // Ler o arquivo SQL
  const sqlFilePath = path.join(__dirname, '../../supabase/schema.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.log('❌ ERRO: Arquivo schema.sql não encontrado!');
    console.log(`📁 Procurando em: ${sqlFilePath}\n`);
    return;
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('✅ SQL carregado do arquivo schema.sql\n');

  // Conectar ao banco
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Remover comentários do SQL
    let cleanSql = sql
      .split('\n')
      .map(line => {
        // Remover comentários de linha inteira
        if (line.trim().startsWith('--')) return '';
        // Remover comentários no final da linha
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex).trim();
        }
        return line;
      })
      .filter(line => line.trim().length > 0)
      .join('\n');

    // Dividir SQL em comandos (separados por ;)
    const commands = cleanSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => {
        // Filtrar comandos vazios
        if (cmd.length === 0) return false;
        // Manter apenas comandos que começam com CREATE
        return cmd.toUpperCase().trim().startsWith('CREATE');
      });

    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar\n`);
    console.log('=' .repeat(50) + '\n');

    // Executar cada comando
    let sucesso = 0;
    let erros = 0;
    let ignorados = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      
      if (command.length === 0) continue;

      try {
        // Pegar primeira linha do comando para mostrar o que está sendo executado
        const firstLine = command.split('\n')[0].substring(0, 60);
        console.log(`⏳ [${i + 1}/${commands.length}] ${firstLine}...`);
        
        await client.query(command);
        console.log(`✅ [${i + 1}/${commands.length}] Executado com sucesso!\n`);
        sucesso++;
      } catch (error) {
        // Ignorar erros de "já existe"
        if (error.message.includes('already exists') || 
            error.code === '42P07' ||
            error.message.includes('já existe')) {
          console.log(`⚠️  [${i + 1}/${commands.length}] Já existe (ignorando)\n`);
          ignorados++;
        } else {
          console.log(`❌ [${i + 1}/${commands.length}] ERRO: ${error.message}\n`);
          erros++;
        }
      }
    }

    console.log('=' .repeat(50));
    console.log('\n📊 RESUMO:');
    console.log(`   ✅ Sucesso: ${sucesso}`);
    console.log(`   ⚠️  Ignorados (já existiam): ${ignorados}`);
    console.log(`   ❌ Erros: ${erros}\n`);

    // Verificar tabelas criadas
    console.log('🔍 Verificando tabelas criadas...\n');
    const tables = ['empresas', 'clubes', 'gestores', 'funcionarios', 'produtos', 'carrinho', 'pedidos', 'pedido_itens'];
    
    let tabelasExistentes = 0;
    let tabelasFaltando = [];

    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        if (result.rows[0].exists) {
          console.log(`✅ Tabela "${table}" existe`);
          tabelasExistentes++;
        } else {
          console.log(`❌ Tabela "${table}" NÃO existe`);
          tabelasFaltando.push(table);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao verificar "${table}": ${error.message}`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    if (tabelasExistentes === tables.length) {
      console.log('\n🎉 SUCESSO! Todas as tabelas foram criadas!');
      console.log(`✅ ${tabelasExistentes}/${tables.length} tabelas existem\n`);
    } else {
      console.log(`\n⚠️  ${tabelasExistentes}/${tables.length} tabelas existem`);
      if (tabelasFaltando.length > 0) {
        console.log(`❌ Tabelas faltando: ${tabelasFaltando.join(', ')}\n`);
      }
    }

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Dica: Verifique se a senha na Connection String está correta');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Dica: Verifique se a URL do banco está correta');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar
createTables().catch(console.error);

