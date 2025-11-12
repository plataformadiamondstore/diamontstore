import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function debugPedidosDados() {
  console.log('🔍 Verificando dados de pedidos e suas relações...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Buscar um pedido de exemplo com todas as relações
    const pedidoResult = await client.query(`
      SELECT 
        p.id as pedido_id,
        p.created_at as pedido_data,
        p.status as pedido_status,
        -- Dados do funcionário
        f.id as funcionario_id,
        f.nome_completo,
        f.cadastro_empresa as funcionario_cadastro_empresa,
        f.cadastro_clube as funcionario_cadastro_clube,
        f.empresa_id,
        f.clube_id,
        -- Dados da empresa
        e.id as empresa_id_tabela,
        e.nome as empresa_nome,
        e.cadastro_empresa as empresa_cadastro_empresa,
        -- Dados do clube
        c.id as clube_id_tabela,
        c.nome as clube_nome,
        c.cadastro_clube as clube_cadastro_clube
      FROM pedidos p
      LEFT JOIN funcionarios f ON p.funcionario_id = f.id
      LEFT JOIN empresas e ON f.empresa_id = e.id
      LEFT JOIN clubes c ON f.clube_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5;
    `);

    console.log('📋 Dados de pedidos (primeiros 5):');
    console.log('============================================================');
    pedidoResult.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. PEDIDO ID: ${row.pedido_id}`);
      console.log(`   Data: ${row.pedido_data}`);
      console.log(`   Status: ${row.pedido_status}`);
      console.log(`\n   FUNCIONÁRIO:`);
      console.log(`   - ID: ${row.funcionario_id || 'NULL'}`);
      console.log(`   - Nome: ${row.nome_completo || 'N/A'}`);
      console.log(`   - Cadastro Empresa (funcionario): ${row.funcionario_cadastro_empresa || 'N/A'}`);
      console.log(`   - Cadastro Clube (funcionario): ${row.funcionario_cadastro_clube || 'N/A'}`);
      console.log(`   - empresa_id: ${row.empresa_id || 'NULL'}`);
      console.log(`   - clube_id: ${row.clube_id || 'NULL'}`);
      console.log(`\n   EMPRESA:`);
      console.log(`   - ID: ${row.empresa_id_tabela || 'NULL'}`);
      console.log(`   - Nome: ${row.empresa_nome || 'N/A'}`);
      console.log(`   - Cadastro Empresa (tabela): ${row.empresa_cadastro_empresa || 'N/A'}`);
      console.log(`\n   CLUBE:`);
      console.log(`   - ID: ${row.clube_id_tabela || 'NULL'}`);
      console.log(`   - Nome: ${row.clube_nome || 'N/A'}`);
      console.log(`   - Cadastro Clube (tabela): ${row.clube_cadastro_clube || 'N/A'}`);
      console.log(`\n   ⚠️  VERIFICAÇÃO:`);
      console.log(`   - Nome Empresa deve vir de: empresas.nome = ${row.empresa_nome || 'N/A'}`);
      console.log(`   - Cadastro Empresa deve vir de: empresas.cadastro_empresa = ${row.empresa_cadastro_empresa || 'N/A'} OU funcionarios.cadastro_empresa = ${row.funcionario_cadastro_empresa || 'N/A'}`);
      console.log(`   - Nome Clube deve vir de: clubes.nome = ${row.clube_nome || 'N/A'}`);
      console.log(`   - Cadastro Clube deve vir de: clubes.cadastro_clube = ${row.clube_cadastro_clube || 'N/A'} OU funcionarios.cadastro_clube = ${row.funcionario_cadastro_clube || 'N/A'}`);
    });
    console.log('\n============================================================\n');

    // Verificar se há funcionários sem empresa ou clube vinculado
    const semVinculoResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN empresa_id IS NULL THEN 1 END) as sem_empresa,
        COUNT(CASE WHEN clube_id IS NULL THEN 1 END) as sem_clube
      FROM funcionarios f
      INNER JOIN pedidos p ON p.funcionario_id = f.id;
    `);
    
    const stats = semVinculoResult.rows[0];
    console.log('📊 Estatísticas de vínculos:');
    console.log(`   Total de funcionários com pedidos: ${stats.total}`);
    console.log(`   Sem empresa vinculada: ${stats.sem_empresa}`);
    console.log(`   Sem clube vinculado: ${stats.sem_clube}\n`);

  } catch (error) {
    console.error('❌ ERRO ao verificar pedidos:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

debugPedidosDados().catch(console.error);


