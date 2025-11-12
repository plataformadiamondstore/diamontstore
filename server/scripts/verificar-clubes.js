import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function verificarClubes() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Buscar todos os clubes
    const clubesResult = await client.query(`
      SELECT id, nome, cadastro_clube, empresa_id
      FROM clubes
      ORDER BY created_at DESC
      LIMIT 20;
    `);

    console.log('📋 Clubes na tabela clubes:');
    console.log('============================================================');
    if (clubesResult.rows.length === 0) {
      console.log('⚠️  Nenhum clube encontrado na tabela!\n');
    } else {
      clubesResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, Nome: ${row.nome || 'N/A'}, Cadastro: ${row.cadastro_clube || 'N/A'}, Empresa ID: ${row.empresa_id || 'NULL'}`);
      });
    }
    console.log('============================================================\n');

    // Verificar funcionários com cadastro_clube mas sem clube_id
    const funcionariosResult = await client.query(`
      SELECT 
        f.id,
        f.nome_completo,
        f.cadastro_clube,
        f.clube_id,
        c.nome as clube_nome,
        c.cadastro_clube as clube_cadastro
      FROM funcionarios f
      LEFT JOIN clubes c ON f.clube_id = c.id
      WHERE f.cadastro_clube IS NOT NULL AND f.cadastro_clube != ''
      ORDER BY f.created_at DESC
      LIMIT 10;
    `);

    console.log('📋 Funcionários com cadastro_clube:');
    console.log('============================================================');
    funcionariosResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.nome_completo || 'N/A'}`);
      console.log(`   Cadastro Clube (funcionario): ${row.cadastro_clube || 'N/A'}`);
      console.log(`   clube_id: ${row.clube_id || 'NULL'}`);
      console.log(`   Clube vinculado: ${row.clube_nome || 'N/A'} (${row.clube_cadastro || 'N/A'})`);
      console.log(`   ⚠️  Match: ${row.cadastro_clube === row.clube_cadastro ? 'SIM' : 'NÃO'}\n`);
    });
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    await client.end();
  }
}

verificarClubes().catch(console.error);



