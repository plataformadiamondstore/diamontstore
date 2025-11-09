import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkFuncionariosEmpresas() {
  console.log('🔍 Verificando funcionários cadastrados e suas empresas...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Contar total de funcionários
    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM funcionarios;
    `);
    const total = countResult.rows[0].total;
    console.log(`📊 Total de funcionários cadastrados: ${total}\n`);

    if (total === '0') {
      console.log('⚠️  Nenhum funcionário encontrado na tabela funcionarios.\n');
      return;
    }

    // Agrupar funcionários por empresa
    const empresasResult = await client.query(`
      SELECT 
        f.empresa_id,
        e.nome as empresa_nome,
        COUNT(*) as quantidade_funcionarios,
        MIN(f.created_at) as primeira_data,
        MAX(f.created_at) as ultima_data
      FROM funcionarios f
      LEFT JOIN empresas e ON f.empresa_id = e.id
      GROUP BY f.empresa_id, e.nome
      ORDER BY quantidade_funcionarios DESC;
    `);

    console.log('📋 Funcionários agrupados por empresa:');
    console.log('============================================================');
    empresasResult.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Empresa: ${row.empresa_nome || 'N/A'} (ID: ${row.empresa_id || 'NULL'})`);
      console.log(`   Quantidade de funcionários: ${row.quantidade_funcionarios}`);
      console.log(`   Primeira data: ${row.primeira_data || 'N/A'}`);
      console.log(`   Última data: ${row.ultima_data || 'N/A'}`);
    });
    console.log('\n============================================================\n');

    // Verificar funcionários sem empresa
    const semEmpresaResult = await client.query(`
      SELECT COUNT(*) as total 
      FROM funcionarios 
      WHERE empresa_id IS NULL;
    `);
    const semEmpresa = semEmpresaResult.rows[0].total;
    if (semEmpresa > 0) {
      console.log(`⚠️  ATENÇÃO: ${semEmpresa} funcionário(s) sem empresa vinculada!\n`);
    }

    // Mostrar alguns exemplos de funcionários
    console.log('📋 Exemplos de funcionários cadastrados (primeiros 10):');
    console.log('============================================================');
    const exemplosResult = await client.query(`
      SELECT 
        f.id,
        f.nome_completo,
        f.cadastro_empresa,
        f.cadastro_clube,
        e.nome as empresa_nome,
        f.empresa_id,
        f.created_at
      FROM funcionarios f
      LEFT JOIN empresas e ON f.empresa_id = e.id
      ORDER BY f.created_at DESC
      LIMIT 10;
    `);

    exemplosResult.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.nome_completo || 'N/A'}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Empresa: ${row.empresa_nome || 'N/A'} (ID: ${row.empresa_id || 'NULL'})`);
      console.log(`   Cadastro Empresa: ${row.cadastro_empresa || 'N/A'}`);
      console.log(`   Cadastro Clube: ${row.cadastro_clube || 'N/A'}`);
      console.log(`   Data de criação: ${row.created_at || 'N/A'}`);
    });
    console.log('\n============================================================\n');

    // Verificar estrutura da tabela funcionarios
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'funcionarios'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estrutura da tabela funcionarios:');
    console.log('============================================================');
    structureResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable === 'YES' ? 'YES' : 'NO'}`);
    });
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ ERRO ao verificar funcionários:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkFuncionariosEmpresas().catch(console.error);

