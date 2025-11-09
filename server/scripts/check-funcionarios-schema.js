import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkFuncionariosSchema() {
  console.log('🔍 Verificando estrutura da tabela funcionarios...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar estrutura da tabela funcionarios
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'funcionarios'
      ORDER BY ordinal_position;
    `);

    const columns = result.rows;
    console.log('📋 Colunas existentes na tabela funcionarios:');
    console.log('============================================================');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable === 'YES' ? 'YES' : 'NO'}${col.column_default ? ` - Default: ${col.column_default}` : ''}`);
    });
    console.log('============================================================');
    console.log(`\nTotal de colunas: ${columns.length}\n`);

    // Verificar colunas obrigatórias
    const requiredColumns = {
      'nome_completo': 'Nome completo do funcionário',
      'cadastro_empresa': 'Cadastro da empresa (do Excel)',
      'cadastro_clube': 'Cadastro do clube (do Excel)',
      'empresa_id': 'ID da empresa (foreign key)'
    };

    let allRequiredExist = true;
    console.log('🔍 Verificando colunas obrigatórias:');
    for (const [colName, description] of Object.entries(requiredColumns)) {
      const exists = columns.some(col => col.column_name === colName);
      if (exists) {
        console.log(`✅ ${colName} - ${description}`);
      } else {
        console.log(`❌ ${colName} - ${description} - NÃO EXISTE`);
        allRequiredExist = false;
      }
    }

    // Verificar foreign keys
    console.log('\n🔍 Verificando foreign keys:');
    const fkResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'funcionarios';
    `);

    if (fkResult.rows.length > 0) {
      console.log('Foreign keys encontradas:');
      fkResult.rows.forEach((fk, index) => {
        console.log(`${index + 1}. ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma foreign key encontrada na tabela funcionarios');
    }

    // Verificar se empresa_id tem foreign key
    const empresaFkExists = fkResult.rows.some(fk => 
      fk.column_name === 'empresa_id' && fk.foreign_table_name === 'empresas'
    );
    
    if (empresaFkExists) {
      console.log('\n✅ Foreign key empresa_id -> empresas.id está configurada');
    } else {
      console.log('\n❌ Foreign key empresa_id -> empresas.id NÃO está configurada');
    }

    // Verificar se clube_id tem foreign key (opcional)
    const clubeFkExists = fkResult.rows.some(fk => 
      fk.column_name === 'clube_id' && fk.foreign_table_name === 'clubes'
    );
    
    if (clubeFkExists) {
      console.log('✅ Foreign key clube_id -> clubes.id está configurada');
    } else {
      console.log('⚠️  Foreign key clube_id -> clubes.id não está configurada (opcional)');
    }

    if (allRequiredExist) {
      console.log('\n✅ Todas as colunas obrigatórias existem!');
    } else {
      console.log('\n⚠️  Algumas colunas obrigatórias estão faltando.');
    }

    console.log('\n============================================================\n');
    console.log('🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ ERRO ao verificar esquema da tabela funcionarios:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkFuncionariosSchema().catch(console.error);

