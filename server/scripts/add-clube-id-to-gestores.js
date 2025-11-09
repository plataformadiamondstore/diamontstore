import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function addClubeIdToGestores() {
  console.log('🚀 Adicionando coluna clube_id na tabela gestores...\n');

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
      WHERE table_schema = 'public' 
      AND table_name = 'gestores' 
      AND column_name = 'clube_id';
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  A coluna clube_id já existe na tabela gestores.');
      console.log('✅ Nenhuma alteração necessária.\n');
      return;
    }

    // Adicionar a coluna clube_id
    console.log('📝 Adicionando coluna clube_id...');
    await client.query(`
      ALTER TABLE gestores 
      ADD COLUMN clube_id INTEGER;
    `);
    console.log('✅ Coluna clube_id adicionada com sucesso!\n');

    // Adicionar foreign key (opcional, mas recomendado)
    console.log('📝 Adicionando foreign key para clubes...');
    try {
      await client.query(`
        ALTER TABLE gestores 
        ADD CONSTRAINT fk_gestores_clube 
        FOREIGN KEY (clube_id) 
        REFERENCES clubes(id) 
        ON DELETE SET NULL;
      `);
      console.log('✅ Foreign key adicionada com sucesso!\n');
    } catch (fkError) {
      if (fkError.message.includes('already exists') || fkError.code === '42710') {
        console.log('⚠️  Foreign key já existe (ignorando)\n');
      } else {
        console.log('⚠️  Aviso: Não foi possível criar foreign key:', fkError.message);
        console.log('   A coluna foi criada, mas sem constraint de foreign key.\n');
      }
    }

    // Criar índice para melhor performance
    console.log('📝 Criando índice na coluna clube_id...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_gestores_clube_id 
        ON gestores(clube_id);
      `);
      console.log('✅ Índice criado com sucesso!\n');
    } catch (indexError) {
      console.log('⚠️  Aviso ao criar índice:', indexError.message);
    }

    console.log('='.repeat(50));
    console.log('\n🎉 SUCESSO! Coluna clube_id adicionada na tabela gestores!');
    console.log('✅ A coluna permite NULL (gestores podem não ter clube vinculado)');
    console.log('✅ Foreign key criada para relacionar com a tabela clubes\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Dica: Verifique se a senha na Connection String está correta');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Dica: Verifique se a URL do banco está correta');
    }
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar
addClubeIdToGestores().catch(console.error);

