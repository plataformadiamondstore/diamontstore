import pg from 'pg';
const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function updateStatusConstraint() {
  console.log('🚀 Atualizando constraint de status na tabela pedido_itens...\n');
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    // Verificar se existe constraint
    console.log('📝 Verificando constraint existente...');
    const checkConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'pedido_itens' 
      AND constraint_name LIKE '%status%';
    `);
    
    if (checkConstraint.rows.length > 0) {
      console.log('📝 Removendo constraint antiga...');
      for (const row of checkConstraint.rows) {
        try {
          await client.query(`ALTER TABLE pedido_itens DROP CONSTRAINT IF EXISTS ${row.constraint_name};`);
          console.log(`✅ Constraint ${row.constraint_name} removida\n`);
        } catch (error) {
          console.log(`⚠️  Erro ao remover constraint ${row.constraint_name}: ${error.message}\n`);
        }
      }
    } else {
      console.log('⚠️  Nenhuma constraint encontrada\n');
    }
    
    // Adicionar nova constraint com todos os status válidos
    console.log('📝 Adicionando nova constraint com todos os status válidos...');
    await client.query(`
      ALTER TABLE pedido_itens 
      ADD CONSTRAINT pedido_itens_status_check 
      CHECK (status IN (
        'pendente',
        'verificando estoque',
        'aguardando aprovação de estoque',
        'Produto autorizado',
        'aprovado',
        'produto sem estoque',
        'rejeitado'
      ));
    `);
    console.log('✅ Nova constraint adicionada com sucesso!\n');
    
    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

updateStatusConstraint()
  .then(() => { process.exit(0); })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

