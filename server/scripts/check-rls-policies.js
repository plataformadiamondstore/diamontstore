import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS na tabela configuracoes...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados!\n');

    // Verificar se RLS está habilitado
    console.log('1️⃣ Verificando se RLS está habilitado...');
    const rlsCheck = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'configuracoes';
    `);

    if (rlsCheck.rows.length > 0) {
      const rlsEnabled = rlsCheck.rows[0].rowsecurity;
      console.log(`   RLS habilitado: ${rlsEnabled ? 'SIM ⚠️' : 'NÃO ✅'}`);
      
      if (rlsEnabled) {
        console.log('\n⚠️  RLS está HABILITADO! Isso pode estar bloqueando o acesso.');
        console.log('💡 Verificando políticas RLS...\n');
        
        // Verificar políticas
        const policies = await client.query(`
          SELECT * FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'configuracoes';
        `);
        
        if (policies.rows.length === 0) {
          console.log('❌ NENHUMA política RLS encontrada!');
          console.log('   Isso significa que RLS está bloqueando TODOS os acessos!');
          console.log('\n💡 SOLUÇÃO: Desabilitar RLS ou criar política pública\n');
        } else {
          console.log(`✅ Encontradas ${policies.rows.length} políticas:`);
          policies.rows.forEach((policy, i) => {
            console.log(`   ${i + 1}. ${policy.policyname} (${policy.cmd})`);
          });
        }
      }
    }

    // Testar acesso direto
    console.log('\n2️⃣ Testando acesso direto à tabela...');
    try {
      const testQuery = await client.query('SELECT valor FROM configuracoes WHERE chave = $1', ['youtube_link']);
      console.log('✅ Acesso direto funciona!');
      console.log(`   Valor encontrado: ${testQuery.rows[0]?.valor || '(vazio)'}`);
    } catch (testError) {
      console.error('❌ Erro ao acessar tabela:', testError.message);
      if (testError.message.includes('permission denied') || testError.message.includes('policy')) {
        console.error('   ⚠️  Problema de permissão ou política RLS!');
      }
    }

    await client.end();
    console.log('\n✅ Verificação concluída!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkRLSPolicies();

