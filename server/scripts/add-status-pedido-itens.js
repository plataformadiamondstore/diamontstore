import pg from 'pg';
const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function addStatusColumn() {
  console.log('🚀 Adicionando coluna status na tabela pedido_itens...\n');
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const checkColumn = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'status';`);
    if (checkColumn.rows.length > 0) {
      console.log('⚠️  A coluna status já existe na tabela pedido_itens. ✅ Nenhuma alteração necessária.\n');
      return;
    }
    console.log('📝 Adicionando coluna status...');
    await client.query(`ALTER TABLE pedido_itens ADD COLUMN status VARCHAR(50) DEFAULT 'pendente';`);
    console.log('✅ Coluna status adicionada com sucesso!\n');
    console.log('📝 Atualizando itens existentes para status = pendente...');
    await client.query(`UPDATE pedido_itens SET status = 'pendente' WHERE status IS NULL;`);
    console.log('✅ Itens existentes atualizados!\n');
    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

addStatusColumn()
  .then(() => { process.exit(0); })
  .catch((error) => { process.exit(1); });

export default addStatusColumn;

