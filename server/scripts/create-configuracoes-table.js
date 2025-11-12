import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function createConfiguracoesTable() {
  console.log('🚀 Criando tabela configuracoes...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar se a tabela já existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracoes'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  A tabela configuracoes já existe.');
      console.log('✅ Nenhuma alteração necessária.\n');
      return;
    }

    // Criar tabela configuracoes
    console.log('📝 Criando tabela configuracoes...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id SERIAL PRIMARY KEY,
        chave VARCHAR(255) UNIQUE NOT NULL,
        valor TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela configuracoes criada com sucesso!\n');

    // Criar índice para melhor performance
    console.log('📝 Criando índice para chave...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);
    `);
    console.log('✅ Índice criado com sucesso!\n');

    console.log('==================================================\n');
    console.log('✅ Processo concluído com sucesso!');
    console.log('📋 A tabela configuracoes foi criada');
    console.log('📋 Índice criado para otimizar buscas por chave\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

createConfiguracoesTable().catch(console.error);

