import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function addEanColumn() {
  console.log('🚀 Adicionando coluna EAN na tabela produtos...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar se a coluna já existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      AND column_name = 'ean';
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  A coluna EAN já existe na tabela produtos.');
      console.log('✅ Nenhuma alteração necessária.\n');
      return;
    }

    // Adicionar coluna EAN
    console.log('📝 Adicionando coluna EAN...');
    await client.query(`
      ALTER TABLE produtos 
      ADD COLUMN ean VARCHAR(50);
    `);
    console.log('✅ Coluna EAN adicionada com sucesso!\n');

    // Criar índice para melhor performance em buscas por EAN
    console.log('📝 Criando índice para EAN...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produtos_ean ON produtos(ean);
    `);
    console.log('✅ Índice criado com sucesso!\n');

    console.log('==================================================\n');
    console.log('✅ Processo concluído com sucesso!');
    console.log('📋 A coluna EAN foi adicionada à tabela produtos');
    console.log('📋 Índice criado para otimizar buscas por EAN\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('already exists')) {
      console.log('⚠️  A coluna EAN já existe (ignorando)');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

addEanColumn().catch(console.error);

