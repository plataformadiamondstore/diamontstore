import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkFuncionariosUploads() {
  console.log('🔍 Verificando dados da tabela funcionarios_uploads...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar se a tabela existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'funcionarios_uploads'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('❌ A tabela funcionarios_uploads NÃO existe!');
      return;
    }

    console.log('✅ A tabela funcionarios_uploads existe.\n');

    // Contar registros
    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM funcionarios_uploads;
    `);
    const total = countResult.rows[0].total;
    console.log(`📊 Total de registros na tabela: ${total}\n`);

    if (total === '0') {
      console.log('⚠️  A tabela está vazia. Nenhum histórico de upload foi salvo ainda.\n');
      console.log('💡 Isso pode acontecer se:');
      console.log('   1. Os uploads foram feitos antes da tabela ser criada');
      console.log('   2. A função de salvar histórico não está sendo executada');
      console.log('   3. Há um erro silencioso ao salvar o histórico\n');
    } else {
      // Buscar todos os registros
      const result = await client.query(`
        SELECT 
          fu.*,
          e.nome as empresa_nome
        FROM funcionarios_uploads fu
        LEFT JOIN empresas e ON fu.empresa_id = e.id
        ORDER BY fu.created_at DESC
        LIMIT 10;
      `);

      console.log('📋 Últimos 10 registros de upload:');
      console.log('============================================================');
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. ID: ${row.id}`);
        console.log(`   Empresa: ${row.empresa_nome || 'N/A'} (ID: ${row.empresa_id})`);
        console.log(`   Quantidade: ${row.quantidade_funcionarios} funcionários`);
        console.log(`   Arquivo: ${row.nome_arquivo || 'N/A'}`);
        console.log(`   Data: ${row.created_at}`);
      });
      console.log('\n============================================================\n');
    }

    // Verificar estrutura da tabela
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'funcionarios_uploads'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estrutura da tabela funcionarios_uploads:');
    console.log('============================================================');
    structureResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable === 'YES' ? 'YES' : 'NO'}`);
    });
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ ERRO ao verificar tabela funcionarios_uploads:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkFuncionariosUploads().catch(console.error);

