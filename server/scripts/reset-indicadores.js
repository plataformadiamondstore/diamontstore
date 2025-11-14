import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function resetIndicadores() {
  console.log('🔄 Resetando todos os indicadores (limpando tabela acessos_logs)...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar quantos registros existem
    const countResult = await client.query('SELECT COUNT(*) FROM acessos_logs');
    const totalRegistros = parseInt(countResult.rows[0].count, 10);
    
    console.log(`📊 Total de registros encontrados: ${totalRegistros}\n`);

    if (totalRegistros === 0) {
      console.log('⚠️  A tabela já está vazia. Nenhuma ação necessária.\n');
      await client.end();
      return;
    }

    // Limpar todos os registros
    console.log('🗑️  Deletando todos os registros...');
    const deleteResult = await client.query('DELETE FROM acessos_logs');
    
    console.log(`✅ ${deleteResult.rowCount} registros deletados com sucesso!\n`);

    // Verificar se ficou vazio
    const verifyResult = await client.query('SELECT COUNT(*) FROM acessos_logs');
    const registrosRestantes = parseInt(verifyResult.rows[0].count, 10);
    
    if (registrosRestantes === 0) {
      console.log('✅ Tabela acessos_logs limpa com sucesso!\n');
      console.log('📊 Todos os indicadores foram resetados.\n');
    } else {
      console.log(`⚠️  Ainda restam ${registrosRestantes} registros na tabela.\n`);
    }

    await client.end();
    console.log('✅ Reset concluído!\n');
  } catch (error) {
    console.error('❌ Erro ao resetar indicadores:', error);
    await client.end();
    process.exit(1);
  }
}

resetIndicadores();

