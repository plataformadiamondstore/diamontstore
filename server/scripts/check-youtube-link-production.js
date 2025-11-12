import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

// Usar DATABASE_URL de produção (mesma que o Render usa)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkYoutubeLink() {
  console.log('🔍 Verificando link do YouTube no banco de dados...\n');
  console.log('🔌 Conectando ao banco de dados...');
  console.log('   URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Ocultar senha

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Verificar se a tabela existe
    console.log('🔍 Verificando se tabela configuracoes existe...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracoes'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Tabela configuracoes não existe!');
      console.log('💡 Execute o script create-configuracoes-table.js primeiro\n');
      await client.end();
      process.exit(1);
    }

    console.log('✅ Tabela configuracoes existe\n');

    // Buscar link do YouTube
    console.log('🔍 Buscando link do YouTube...');
    const result = await client.query(
      'SELECT * FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );

    if (result.rows.length === 0) {
      console.log('⚠️  Link do YouTube NÃO está configurado!');
      console.log('💡 Execute o script set-youtube-link.js para configurar\n');
    } else {
      const row = result.rows[0];
      console.log('✅ Link do YouTube encontrado:');
      console.log('   ID:', row.id);
      console.log('   Chave:', row.chave);
      console.log('   Valor:', row.valor || '(VAZIO)');
      console.log('   Criado em:', row.created_at);
      console.log('   Atualizado em:', row.updated_at);
      
      if (!row.valor || row.valor.trim() === '') {
        console.log('\n⚠️  ATENÇÃO: Link está configurado mas o VALOR está VAZIO!');
        console.log('💡 Execute o script set-youtube-link.js para configurar o valor\n');
      } else {
        console.log('\n✅ Link está configurado corretamente!');
      }
    }

    // Listar todas as configurações
    console.log('\n📋 Todas as configurações:');
    const allConfigs = await client.query('SELECT * FROM configuracoes ORDER BY chave');
    if (allConfigs.rows.length === 0) {
      console.log('   Nenhuma configuração encontrada');
    } else {
      allConfigs.rows.forEach(config => {
        console.log(`   - ${config.chave}: ${config.valor || '(vazio)'}`);
      });
    }

    await client.end();
    console.log('\n✅ Verificação concluída!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    await client.end();
    process.exit(1);
  }
}

checkYoutubeLink();

