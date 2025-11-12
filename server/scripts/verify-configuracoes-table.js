import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function verifyConfiguracoesTable() {
  console.log('🔍 Verificando tabela configuracoes...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Verificar estrutura da tabela
    const tableInfo = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'configuracoes'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estrutura da tabela configuracoes:');
    console.log('============================================================');
    if (tableInfo.rows.length === 0) {
      console.log('❌ Tabela não encontrada!');
    } else {
      tableInfo.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
      });
    }
    console.log('============================================================\n');

    // Verificar dados existentes
    const data = await client.query(`
      SELECT * FROM configuracoes;
    `);

    console.log('📋 Dados na tabela:');
    console.log('============================================================');
    if (data.rows.length === 0) {
      console.log('⚠️  Nenhum dado encontrado na tabela.');
    } else {
      data.rows.forEach((row, index) => {
        console.log(`${index + 1}. Chave: ${row.chave}, Valor: ${row.valor || 'NULL'}`);
      });
    }
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

verifyConfiguracoesTable().catch(console.error);

