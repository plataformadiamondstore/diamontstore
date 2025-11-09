import pg from 'pg';

const { Client } = pg;

// Connection String do Supabase
const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function checkGestoresSchema() {
  console.log('🔍 Verificando estrutura da tabela gestores...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar todas as colunas da tabela gestores
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'gestores'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas existentes na tabela gestores:');
    console.log('='.repeat(60));
    
    const columnNames = [];
    columns.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
      columnNames.push(col.column_name);
    });
    
    console.log('='.repeat(60));
    console.log(`\nTotal de colunas: ${columns.rows.length}\n`);

    // Verificar se a coluna 'senha' existe
    const senhaExists = columnNames.includes('senha');
    
    if (!senhaExists) {
      console.log('❌ Coluna "senha" NÃO encontrada na tabela gestores!');
      console.log('📝 Criando coluna "senha"...\n');
      
      await client.query(`
        ALTER TABLE gestores 
        ADD COLUMN senha VARCHAR(255);
      `);
      
      console.log('✅ Coluna "senha" criada com sucesso!\n');
    } else {
      console.log('✅ Coluna "senha" já existe na tabela gestores.\n');
    }

    // Verificar outras colunas importantes
    const requiredColumns = ['nome', 'usuario', 'empresa_id'];
    const missingColumns = [];

    requiredColumns.forEach(col => {
      if (!columnNames.includes(col)) {
        missingColumns.push(col);
      }
    });

    if (missingColumns.length > 0) {
      console.log('⚠️  Colunas faltando:', missingColumns.join(', '));
      console.log('📝 Criando colunas faltantes...\n');
      
      for (const col of missingColumns) {
        try {
          let dataType = 'VARCHAR(255)';
          if (col === 'empresa_id') {
            dataType = 'INTEGER';
          }
          
          await client.query(`
            ALTER TABLE gestores 
            ADD COLUMN ${col} ${dataType};
          `);
          
          console.log(`✅ Coluna "${col}" criada com sucesso!`);
        } catch (error) {
          console.log(`❌ Erro ao criar coluna "${col}":`, error.message);
        }
      }
      console.log('');
    } else {
      console.log('✅ Todas as colunas obrigatórias existem!\n');
    }

    // Verificar novamente após criar
    if (!senhaExists || missingColumns.length > 0) {
      const finalCheck = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gestores'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estrutura final da tabela gestores:');
      finalCheck.rows.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.column_name} (${col.data_type})`);
      });
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('\n🎉 Verificação concluída!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Dica: Verifique se a senha na Connection String está correta');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Dica: Verifique se a URL do banco está correta');
    }
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

// Executar
checkGestoresSchema().catch(console.error);

