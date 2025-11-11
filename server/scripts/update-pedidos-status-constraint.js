import pg from 'pg';
const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function updateStatusConstraint() {
  console.log('🚀 Atualizando constraint de status na tabela pedidos...\n');
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    // Remover constraint antiga se existir
    console.log('📝 Removendo constraint antiga...');
    try {
      await client.query(`ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;`);
      console.log('✅ Constraint antiga removida (se existia)\n');
    } catch (error) {
      console.log('⚠️  Constraint antiga não encontrada ou já removida\n');
    }
    
    // Adicionar nova constraint com todos os status válidos
    console.log('📝 Adicionando nova constraint com todos os status válidos...');
    await client.query(`
      ALTER TABLE pedidos 
      ADD CONSTRAINT pedidos_status_check 
      CHECK (status IN (
        'pendente',
        'verificando estoque',
        'aguardando aprovação de estoque',
        'produto será entregue em até 7 dias',
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

