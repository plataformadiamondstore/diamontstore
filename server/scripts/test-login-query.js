import pg from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function testLoginQuery() {
  console.log('🔍 TESTANDO QUERY DE LOGIN EXATA DO BACKEND\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // 1. Verificar TODOS os funcionários e seus cadastros
    console.log('📋 TODOS OS FUNCIONÁRIOS COM CADASTRO_EMPRESA E CADASTRO_CLUBE:');
    console.log('============================================================');
    const allFuncResult = await client.query(`
      SELECT 
        id,
        nome_completo,
        cadastro_empresa,
        cadastro_clube,
        empresa_id,
        clube_id,
        CASE 
          WHEN cadastro_empresa IS NULL OR cadastro_empresa = '' THEN '❌ VAZIO'
          ELSE '✅ OK'
        END as status_empresa,
        CASE 
          WHEN cadastro_clube IS NULL OR cadastro_clube = '' THEN '❌ VAZIO'
          ELSE '✅ OK'
        END as status_clube
      FROM funcionarios
      ORDER BY created_at DESC;
    `);

    if (allFuncResult.rows.length === 0) {
      console.log('⚠️  NENHUM FUNCIONÁRIO ENCONTRADO!\n');
    } else {
      console.log(`Total de funcionários: ${allFuncResult.rows.length}\n`);
      allFuncResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.nome_completo || 'N/A'}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Cadastro Empresa: "${row.cadastro_empresa || 'NULL/VAZIO'}" ${row.status_empresa}`);
        console.log(`   Cadastro Clube: "${row.cadastro_clube || 'NULL/VAZIO'}" ${row.status_clube}`);
        console.log(`   Tipo cadastro_empresa: ${typeof row.cadastro_empresa}`);
        console.log(`   Tipo cadastro_clube: ${typeof row.cadastro_clube}`);
        console.log('');
      });
    }
    console.log('============================================================\n');

    // 2. Contar funcionários com ambos os cadastros preenchidos
    const comAmbosResult = await client.query(`
      SELECT COUNT(*) as total
      FROM funcionarios
      WHERE cadastro_empresa IS NOT NULL 
        AND cadastro_empresa != ''
        AND cadastro_clube IS NOT NULL 
        AND cadastro_clube != '';
    `);
    const totalComAmbos = comAmbosResult.rows[0].total;
    console.log(`📊 Funcionários com AMBOS os cadastros preenchidos: ${totalComAmbos}\n`);

    // 3. Testar a query EXATA do login usando Supabase
    console.log('🔍 TESTANDO QUERY DE LOGIN COM SUPABASE (QUERY EXATA DO BACKEND):');
    console.log('============================================================');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontradas!');
      console.log('   Verifique o arquivo .env\n');
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Pegar o primeiro funcionário que tem ambos os cadastros
      const funcComCadastros = allFuncResult.rows.find(f => 
        f.cadastro_empresa && f.cadastro_empresa !== '' && 
        f.cadastro_clube && f.cadastro_clube !== ''
      );

      if (!funcComCadastros) {
        console.log('❌ NENHUM FUNCIONÁRIO TEM AMBOS OS CADASTROS PREENCHIDOS!');
        console.log('   Isso explica por que o login não funciona!\n');
      } else {
        console.log(`\n✅ Testando login com funcionário:`);
        console.log(`   Nome: ${funcComCadastros.nome_completo}`);
        console.log(`   Cadastro Empresa: "${funcComCadastros.cadastro_empresa}"`);
        console.log(`   Cadastro Clube: "${funcComCadastros.cadastro_clube}"\n`);

        // Testar a query EXATA do backend
        const { data, error } = await supabase
          .from('funcionarios')
          .select('*, empresas(*), clubes(*)')
          .eq('cadastro_empresa', funcComCadastros.cadastro_empresa)
          .eq('cadastro_clube', funcComCadastros.cadastro_clube)
          .single();

        if (error) {
          console.log('❌ ERRO na query de login:');
          console.log(`   Código: ${error.code}`);
          console.log(`   Mensagem: ${error.message}`);
          console.log(`   Detalhes: ${error.details || 'N/A'}`);
          console.log(`   Hint: ${error.hint || 'N/A'}\n`);
        } else if (!data) {
          console.log('❌ Funcionário NÃO encontrado com a query!');
          console.log('   Isso indica problema na query ou nos dados.\n');
        } else {
          console.log('✅ LOGIN FUNCIONA! Funcionário encontrado:');
          console.log(`   ID: ${data.id}`);
          console.log(`   Nome: ${data.nome_completo}`);
          console.log(`   Empresa: ${data.empresas?.nome || 'N/A'}`);
          console.log(`   Clube: ${data.clubes?.nome || 'N/A'}\n`);
        }
      }
    }

    // 4. Verificar se há problemas de tipo de dados
    console.log('🔍 VERIFICANDO TIPOS DE DADOS:');
    console.log('============================================================');
    const tiposResult = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'funcionarios'
        AND column_name IN ('cadastro_empresa', 'cadastro_clube');
    `);
    
    tiposResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}${row.character_maximum_length ? ` (max: ${row.character_maximum_length})` : ''}`);
    });
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ ERRO ao testar login:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

testLoginQuery().catch(console.error);

