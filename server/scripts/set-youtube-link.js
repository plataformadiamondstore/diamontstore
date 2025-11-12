import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

// Link do YouTube a ser configurado
const YOUTUBE_LINK = process.argv[2] || 'https://www.youtube.com/watch?v=ypATdt9gobQ';

async function setYoutubeLink() {
  console.log('🚀 Configurando link do YouTube no banco de dados...\n');
  console.log(`📺 Link a ser configurado: ${YOUTUBE_LINK}\n`);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Verificar se já existe
    console.log('🔍 Verificando se link já existe...');
    const checkResult = await client.query(
      'SELECT * FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );

    if (checkResult.rows.length > 0) {
      console.log('📝 Link já existe. Atualizando...');
      const updateResult = await client.query(
        'UPDATE configuracoes SET valor = $1, updated_at = NOW() WHERE chave = $2 RETURNING *',
        [YOUTUBE_LINK, 'youtube_link']
      );
      console.log('✅ Link atualizado com sucesso!');
      console.log('   Valor anterior:', checkResult.rows[0].valor);
      console.log('   Valor novo:', updateResult.rows[0].valor);
    } else {
      console.log('📝 Link não existe. Criando...');
      const insertResult = await client.query(
        'INSERT INTO configuracoes (chave, valor) VALUES ($1, $2) RETURNING *',
        ['youtube_link', YOUTUBE_LINK]
      );
      console.log('✅ Link criado com sucesso!');
      console.log('   Valor:', insertResult.rows[0].valor);
    }

    // Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const finalResult = await client.query(
      'SELECT * FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );

    if (finalResult.rows.length > 0) {
      console.log('✅ Link configurado corretamente!');
      console.log('   Chave:', finalResult.rows[0].chave);
      console.log('   Valor:', finalResult.rows[0].valor);
      console.log('   Updated:', finalResult.rows[0].updated_at);
    } else {
      console.error('❌ Erro: Link não foi encontrado após configuração!');
    }

    await client.end();
    console.log('\n✅ Processo concluído!');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('   1. Verifique se o link aparece no site');
    console.log('   2. Teste em mobile e desktop');
    console.log('   3. Verifique se o card do YouTube aparece na página de login\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    await client.end();
    process.exit(1);
  }
}

setYoutubeLink();

