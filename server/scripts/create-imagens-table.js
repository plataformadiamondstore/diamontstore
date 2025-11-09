import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

const { Client } = pg;

async function createImagensTable() {
  console.log('🚀 Criando tabela produto_imagens...\n');

  const sql = `
    -- Tabela de Imagens de Produtos
    CREATE TABLE IF NOT EXISTS produto_imagens (
      id SERIAL PRIMARY KEY,
      produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
      url_imagem TEXT NOT NULL,
      ordem INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Índice para performance
    CREATE INDEX IF NOT EXISTS idx_produto_imagens_produto ON produto_imagens(produto_id);
  `;

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    await client.query(sql);
    console.log('✅ Tabela produto_imagens criada com sucesso!\n');

    // Verificar se foi criada
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'produto_imagens'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ Tabela produto_imagens existe no banco de dados');
    }
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tabela já existe (ignorando)');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

createImagensTable().catch(console.error);

