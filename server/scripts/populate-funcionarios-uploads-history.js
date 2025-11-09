import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function populateFuncionariosUploadsHistory() {
  console.log('🚀 Populando histórico de uploads de funcionários...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar se a tabela funcionarios_uploads existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'funcionarios_uploads'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('❌ A tabela funcionarios_uploads NÃO existe!');
      console.log('💡 Execute primeiro o script create-funcionarios-uploads-table.js\n');
      return;
    }

    // Buscar funcionários agrupados por empresa_id e created_at
    // Vamos agrupar por empresa e data de criação para simular uploads
    console.log('📊 Analisando funcionários cadastrados...');
    const funcionariosResult = await client.query(`
      SELECT 
        empresa_id,
        COUNT(*) as quantidade,
        MIN(created_at) as primeira_data,
        MAX(created_at) as ultima_data
      FROM funcionarios
      WHERE empresa_id IS NOT NULL
      GROUP BY empresa_id
      ORDER BY primeira_data;
    `);

    const grupos = funcionariosResult.rows;
    console.log(`✅ Encontrados ${grupos.length} grupos de funcionários por empresa\n`);

    if (grupos.length === 0) {
      console.log('⚠️  Nenhum funcionário encontrado na tabela funcionarios');
      return;
    }

    // Verificar quais já existem no histórico
    const historicoExistente = await client.query(`
      SELECT empresa_id, COUNT(*) as total
      FROM funcionarios_uploads
      GROUP BY empresa_id;
    `);

    const historicoMap = {};
    historicoExistente.rows.forEach(row => {
      historicoMap[row.empresa_id] = row.total;
    });

    console.log('📋 Criando registros de histórico...');
    let inseridos = 0;
    let ignorados = 0;

    for (const grupo of grupos) {
      // Verificar se já existe histórico para esta empresa
      if (historicoMap[grupo.empresa_id]) {
        console.log(`⏭️  Empresa ID ${grupo.empresa_id}: Já possui ${historicoMap[grupo.empresa_id]} registro(s) no histórico. Ignorando...`);
        ignorados++;
        continue;
      }

      // Buscar nome da empresa
      const empresaResult = await client.query(`
        SELECT nome FROM empresas WHERE id = $1;
      `, [grupo.empresa_id]);

      const nomeEmpresa = empresaResult.rows[0]?.nome || `Empresa ID ${grupo.empresa_id}`;

      // Criar registro de histórico
      // Usar a primeira data de criação como data do "upload"
      const dataUpload = grupo.primeira_data;

      await client.query(`
        INSERT INTO funcionarios_uploads (empresa_id, quantidade_funcionarios, nome_arquivo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $4);
      `, [
        grupo.empresa_id,
        grupo.quantidade,
        `upload_historico_${grupo.empresa_id}.xlsx`,
        dataUpload
      ]);

      console.log(`✅ Criado histórico para ${nomeEmpresa}: ${grupo.quantidade} funcionários (Data: ${dataUpload})`);
      inseridos++;
    }

    console.log('\n==================================================\n');
    console.log('🎉 Processo concluído!');
    console.log(`✅ ${inseridos} registro(s) de histórico criado(s)`);
    if (ignorados > 0) {
      console.log(`⏭️  ${ignorados} registro(s) ignorado(s) (já existiam no histórico)`);
    }
    console.log('\n💡 Nota: Os uploads futuros serão registrados automaticamente.\n');

  } catch (error) {
    console.error('❌ ERRO ao popular histórico:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

populateFuncionariosUploadsHistory().catch(console.error);

