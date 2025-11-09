import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function createFuncionariosUploadsTable() {
  console.log('🚀 Criando tabela funcionarios_uploads...\n');

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
        AND table_name = 'funcionarios_uploads'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  A tabela funcionarios_uploads já existe.');
      console.log('✅ Nenhuma alteração necessária.\n');
      return;
    }

    // Criar tabela funcionarios_uploads
    console.log('📝 Criando tabela funcionarios_uploads...');
    await client.query(`
      CREATE TABLE funcionarios_uploads (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        quantidade_funcionarios INTEGER NOT NULL,
        nome_arquivo VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela funcionarios_uploads criada com sucesso!\n');

    // Criar índice
    console.log('📝 Criando índices...');
    await client.query(`
      CREATE INDEX idx_funcionarios_uploads_empresa_id ON funcionarios_uploads(empresa_id);
      CREATE INDEX idx_funcionarios_uploads_created_at ON funcionarios_uploads(created_at DESC);
    `);
    console.log('✅ Índices criados com sucesso!\n');

    console.log('==================================================\n');
    console.log('🎉 SUCESSO! Tabela funcionarios_uploads criada!');
    console.log('✅ A tabela armazena o histórico de uploads de funcionários');
    console.log('✅ Campos: id, empresa_id, quantidade_funcionarios, nome_arquivo, created_at\n');

  } catch (error) {
    console.error('❌ ERRO ao criar tabela funcionarios_uploads:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

createFuncionariosUploadsTable().catch(console.error);

