import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Testar diferentes formatos de connection string
const connectionStrings = [
  // Formato 1: Direto do Supabase (atual)
  'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres',
  
  // Formato 2: Pooler do Supabase
  'postgresql://postgres.rslnzomohtvwvhymenjh:Beniciocaus3131@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
  
  // Formato 3: Connection pooler (porta 5432)
  'postgresql://postgres.rslnzomohtvwvhymenjh:Beniciocaus3131@aws-0-us-west-1.pooler.supabase.com:5432/postgres',
];

async function testConnectionString(connectionString, name) {
  console.log(`\n🔍 Testando: ${name}`);
  console.log(`   Connection string: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('   ✅ Conectado!');
    
    const result = await client.query(
      'SELECT valor FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );
    
    console.log(`   ✅ Query executada!`);
    console.log(`   📊 Resultado: ${result.rows[0]?.valor || '(vazio)'}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`);
    console.error(`   Código: ${error.code}`);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function testAll() {
  console.log('🚀 Testando diferentes formatos de connection string do Supabase...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnectionString(connectionStrings[i], `Formato ${i + 1}`);
    if (success) {
      console.log(`\n✅ Formato ${i + 1} FUNCIONA! Use este formato.`);
      break;
    }
  }
  
  console.log('\n✅ Teste concluído!\n');
}

testAll();

