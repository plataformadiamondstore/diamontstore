import pg from 'pg';
const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function updateStatusColumnSize() {
  console.log('🚀 Aumentando tamanho da coluna status na tabela pedidos...\n');
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    // Verificar tamanho atual da coluna
    console.log('📝 Verificando tamanho atual da coluna status...');
    const checkColumn = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos' AND column_name = 'status';
    `);
    
    if (checkColumn.rows.length > 0) {
      const currentSize = checkColumn.rows[0].character_maximum_length;
      console.log(`   Tamanho atual: ${currentSize || 'sem limite'}\n`);
      
      if (currentSize && currentSize < 50) {
        console.log('📝 Alterando tamanho da coluna status para VARCHAR(50)...');
        await client.query(`ALTER TABLE pedidos ALTER COLUMN status TYPE VARCHAR(50);`);
        console.log('✅ Coluna status atualizada com sucesso!\n');
      } else {
        console.log('⚠️  Coluna já tem tamanho suficiente ou não tem limite.\n');
      }
    } else {
      console.log('⚠️  Coluna status não encontrada na tabela pedidos.\n');
    }
    
    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

updateStatusColumnSize()
  .then(() => { process.exit(0); })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

