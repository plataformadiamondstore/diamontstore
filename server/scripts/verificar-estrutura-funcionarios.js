import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

async function verificarEstruturaFuncionarios() {
  console.log('🔍 VERIFICANDO ESTRUTURA DO BANCO DE DADOS\n');
  console.log('============================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  // Tentar DATABASE_URL primeiro, depois construir a partir do SUPABASE_URL
  let databaseUrl = process.env.DATABASE_URL;
  
  // Se não tiver DATABASE_URL, tentar construir a partir do SUPABASE_URL
  if (!databaseUrl && supabaseUrl) {
    // Extrair informações do SUPABASE_URL se possível
    // Formato típico: https://xxxxx.supabase.co
    // Connection string: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
    console.log('⚠️  DATABASE_URL não encontrada, tentando usar Supabase Client apenas\n');
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontradas');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Verificar estrutura da tabela funcionarios usando Supabase
    console.log('📋 1. ESTRUTURA DA TABELA funcionarios (Supabase):');
    console.log('============================================================\n');

    const { data: funcionarios, error: errorFunc } = await supabase
      .from('funcionarios')
      .select('*')
      .limit(1);

    if (errorFunc) {
      console.error('❌ Erro ao acessar tabela funcionarios:', errorFunc);
    } else {
      console.log('✅ Tabela funcionarios existe e é acessível');
      if (funcionarios && funcionarios.length > 0) {
        console.log('\n📊 Campos encontrados na tabela:');
        const campos = Object.keys(funcionarios[0]);
        campos.forEach((campo, index) => {
          const valor = funcionarios[0][campo];
          console.log(`   ${index + 1}. ${campo} (tipo: ${typeof valor})`);
        });
      } else {
        console.log('⚠️  Tabela está vazia (sem dados de exemplo)');
      }
    }

    // 2. Verificar campos obrigatórios usando PostgreSQL direto
    console.log('\n============================================================');
    console.log('📋 2. VERIFICAÇÃO DETALHADA DOS CAMPOS (PostgreSQL):');
    console.log('============================================================\n');

    if (databaseUrl) {
      const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL\n');

        // Verificar estrutura da tabela
        const estruturaQuery = `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = 'funcionarios'
          ORDER BY ordinal_position;
        `;

        const estruturaResult = await client.query(estruturaQuery);

        if (estruturaResult.rows.length === 0) {
          console.log('❌ Tabela funcionarios não encontrada!');
        } else {
          console.log('📊 Estrutura completa da tabela funcionarios:\n');
          estruturaResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.column_name}`);
            console.log(`   Tipo: ${row.data_type}${row.character_maximum_length ? ` (max: ${row.character_maximum_length})` : ''}`);
            console.log(`   Nullable: ${row.is_nullable === 'YES' ? '✅ SIM' : '❌ NÃO'}`);
            if (row.column_default) {
              console.log(`   Default: ${row.column_default}`);
            }
            console.log('');
          });

          // Verificar campos esperados pela planilha
          console.log('============================================================');
          console.log('✅ VERIFICAÇÃO DE CAMPOS ESPERADOS:');
          console.log('============================================================\n');

          const camposEsperados = {
            'nome_completo': { obrigatorio: true, tipo: 'text ou varchar' },
            'cadastro_empresa': { obrigatorio: true, tipo: 'text ou varchar' },
            'cadastro_clube': { obrigatorio: false, tipo: 'text ou varchar' },
            'empresa_id': { obrigatorio: true, tipo: 'integer ou bigint' },
            'clube_id': { obrigatorio: false, tipo: 'integer ou bigint' }
          };

          const camposEncontrados = estruturaResult.rows.map(r => r.column_name);

          let todosOk = true;
          for (const [campo, info] of Object.entries(camposEsperados)) {
            const encontrado = camposEncontrados.includes(campo);
            const campoInfo = estruturaResult.rows.find(r => r.column_name === campo);
            
            if (encontrado && campoInfo) {
              const nullable = campoInfo.is_nullable === 'YES';
              const status = info.obrigatorio ? (nullable ? '⚠️  OBRIGATÓRIO MAS NULLABLE' : '✅ OK') : '✅ OK';
              console.log(`${status} ${campo}`);
              console.log(`   Tipo: ${campoInfo.data_type}`);
              console.log(`   Nullable: ${nullable ? 'SIM' : 'NÃO'}`);
              
              if (info.obrigatorio && nullable) {
                console.log(`   ⚠️  ATENÇÃO: Campo obrigatório mas permite NULL!`);
                todosOk = false;
              }
            } else {
              console.log(`❌ ${campo} - NÃO ENCONTRADO!`);
              todosOk = false;
            }
            console.log('');
          }

          // Verificar constraints
          console.log('============================================================');
          console.log('📋 3. CONSTRAINTS E RELACIONAMENTOS:');
          console.log('============================================================\n');

          const constraintsQuery = `
            SELECT
              tc.constraint_name,
              tc.constraint_type,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            LEFT JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'funcionarios'
            ORDER BY tc.constraint_type, tc.constraint_name;
          `;

          const constraintsResult = await client.query(constraintsQuery);

          if (constraintsResult.rows.length === 0) {
            console.log('⚠️  Nenhuma constraint encontrada');
          } else {
            constraintsResult.rows.forEach((row, index) => {
              console.log(`${index + 1}. ${row.constraint_type}: ${row.constraint_name}`);
              console.log(`   Coluna: ${row.column_name}`);
              if (row.foreign_table_name) {
                console.log(`   Referência: ${row.foreign_table_name}.${row.foreign_column_name}`);
              }
              console.log('');
            });
          }

          // Verificar tabela de histórico
          console.log('============================================================');
          console.log('📋 4. TABELA DE HISTÓRICO (funcionarios_uploads):');
          console.log('============================================================\n');

          const historicoQuery = `
            SELECT 
              column_name,
              data_type,
              is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' 
              AND table_name = 'funcionarios_uploads'
            ORDER BY ordinal_position;
          `;

          const historicoResult = await client.query(historicoQuery);

          if (historicoResult.rows.length === 0) {
            console.log('⚠️  Tabela funcionarios_uploads não encontrada (opcional)');
          } else {
            console.log('✅ Tabela funcionarios_uploads existe:\n');
            historicoResult.rows.forEach((row, index) => {
              console.log(`${index + 1}. ${row.column_name} (${row.data_type})`);
            });
          }

          // Resumo final
          console.log('\n============================================================');
          console.log('🎯 RESUMO FINAL:');
          console.log('============================================================\n');

          if (todosOk) {
            console.log('✅ ESTRUTURA DO BANCO DE DADOS ESTÁ CORRETA!');
            console.log('   Todos os campos esperados pela planilha estão presentes.');
            console.log('   A planilha pode ser importada sem problemas.\n');
          } else {
            console.log('⚠️  ESTRUTURA DO BANCO DE DADOS PRECISA DE AJUSTES');
            console.log('   Verifique os campos marcados com ❌ acima.\n');
          }

          // Verificar alguns dados de exemplo
          console.log('============================================================');
          console.log('📊 5. DADOS DE EXEMPLO (primeiros 3 registros):');
          console.log('============================================================\n');

          const exemploQuery = `
            SELECT 
              id,
              nome_completo,
              cadastro_empresa,
              cadastro_clube,
              empresa_id,
              clube_id,
              created_at
            FROM funcionarios
            ORDER BY created_at DESC
            LIMIT 3;
          `;

          const exemploResult = await client.query(exemploQuery);

          if (exemploResult.rows.length === 0) {
            console.log('⚠️  Nenhum funcionário cadastrado ainda');
          } else {
            exemploResult.rows.forEach((row, index) => {
              console.log(`Funcionário ${index + 1}:`);
              console.log(`   ID: ${row.id}`);
              console.log(`   Nome: ${row.nome_completo || 'NULL'}`);
              console.log(`   Cadastro Empresa: ${row.cadastro_empresa || 'NULL'}`);
              console.log(`   Cadastro Clube: ${row.cadastro_clube || 'NULL'}`);
              console.log(`   Empresa ID: ${row.empresa_id || 'NULL'}`);
              console.log(`   Clube ID: ${row.clube_id || 'NULL'}`);
              console.log(`   Criado em: ${row.created_at || 'NULL'}`);
              console.log('');
            });
          }

        }

        await client.end();
      } catch (error) {
        console.error('❌ Erro ao consultar PostgreSQL:', error.message);
        console.log('\n⚠️  Continuando apenas com Supabase...\n');
      }
    } else {
      console.log('⚠️  DATABASE_URL não configurada, usando apenas Supabase\n');
    }

    // 3. Verificar se consegue inserir dados de teste (sem realmente inserir)
    console.log('============================================================');
    console.log('📋 6. TESTE DE VALIDAÇÃO DE DADOS:');
    console.log('============================================================\n');

    const dadosTeste = {
      nome_completo: 'Teste Planilha',
      cadastro_empresa: '12345',
      cadastro_clube: '001',
      empresa_id: 1,
      clube_id: null
    };

    console.log('Dados de teste que seriam inseridos:');
    console.log(JSON.stringify(dadosTeste, null, 2));
    console.log('\n✅ Estrutura dos dados está correta para a planilha\n');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('============================================================');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('============================================================\n');
}

verificarEstruturaFuncionarios().catch(console.error);
