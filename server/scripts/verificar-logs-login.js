import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function verificarLogsLogin() {
  console.log('🔍 Verificando logs de login no banco...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Verificar todos os tipos de eventos
    const resultTipos = await client.query(`
      SELECT tipo_evento, COUNT(*) as total
      FROM acessos_logs
      GROUP BY tipo_evento
      ORDER BY total DESC
    `);

    console.log('📊 Total por tipo de evento:');
    resultTipos.rows.forEach(row => {
      console.log(`  ${row.tipo_evento}: ${row.total}`);
    });
    console.log('');

    // Verificar últimos 10 logs de login
    const resultLogins = await client.query(`
      SELECT id, tipo_evento, funcionario_id, empresa_id, dispositivo, created_at
      FROM acessos_logs
      WHERE tipo_evento = 'login'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`\n🔐 Últimos ${resultLogins.rows.length} logins:`);
    resultLogins.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Funcionário: ${row.funcionario_id}, Empresa: ${row.empresa_id}, Dispositivo: ${row.dispositivo}, Data: ${row.created_at}`);
    });

    // Verificar últimos 20 logs de qualquer tipo
    const resultTodos = await client.query(`
      SELECT id, tipo_evento, funcionario_id, empresa_id, dispositivo, created_at
      FROM acessos_logs
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`\n📋 Últimos ${resultTodos.rows.length} logs (todos os tipos):`);
    resultTodos.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Tipo: ${row.tipo_evento}, Funcionário: ${row.funcionario_id}, Empresa: ${row.empresa_id}, Data: ${row.created_at}`);
    });

    await client.end();
    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
    await client.end();
  }
}

verificarLogsLogin();

