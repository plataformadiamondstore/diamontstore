import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function verificarTabelaLogs() {
  console.log('🔍 Verificando se existe tabela de logs de acesso...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar todas as tabelas que podem ser relacionadas a logs
    const tabelasPossiveis = [
      'logs',
      'access_logs',
      'acessos',
      'acesso_logs',
      'funcionario_logs',
      'tracking',
      'eventos',
      'user_logs',
      'login_logs'
    ];

    console.log('📋 Verificando tabelas relacionadas a logs:\n');
    console.log('='.repeat(60));

    let tabelaEncontrada = false;

    for (const tabela of tabelasPossiveis) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tabela]);

      if (result.rows[0].exists) {
        console.log(`✅ Tabela "${tabela}" EXISTE!`);
        
        // Verificar estrutura da tabela
        const columns = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `, [tabela]);

        console.log(`   Colunas:`);
        columns.rows.forEach(col => {
          console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        // Verificar quantidade de registros
        const count = await client.query(`SELECT COUNT(*) FROM ${tabela}`);
        console.log(`   Total de registros: ${count.rows[0].count}\n`);
        
        tabelaEncontrada = true;
      } else {
        console.log(`❌ Tabela "${tabela}" NÃO existe`);
      }
    }

    console.log('='.repeat(60));

    // Verificar todas as tabelas do banco para ver se há algo relacionado
    console.log('\n📋 Todas as tabelas do banco de dados:\n');
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('Tabelas encontradas:');
    allTables.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });

    console.log(`\nTotal: ${allTables.rows.length} tabelas\n`);

    if (!tabelaEncontrada) {
      console.log('⚠️  Nenhuma tabela de logs encontrada!');
      console.log('📝 Será necessário criar uma nova tabela para armazenar os logs de acesso.\n');
    }

    await client.end();
    console.log('✅ Verificação concluída!\n');
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    await client.end();
    process.exit(1);
  }
}

verificarTabelaLogs();

