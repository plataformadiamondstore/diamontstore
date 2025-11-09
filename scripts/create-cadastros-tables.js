import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

const { Client } = pg;

async function createCadastrosTables() {
  console.log('🚀 Criando tabelas de cadastros...\n');

  const sql = `
    -- Tabela de Categorias
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Tabela de Marcas
    CREATE TABLE IF NOT EXISTS marcas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Tabela de Tamanhos
    CREATE TABLE IF NOT EXISTS tamanhos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);
    CREATE INDEX IF NOT EXISTS idx_marcas_nome ON marcas(nome);
    CREATE INDEX IF NOT EXISTS idx_tamanhos_nome ON tamanhos(nome);
  `;

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    await client.query(sql);
    console.log('✅ Tabelas de cadastros criadas com sucesso!\n');

    // Verificar se foram criadas
    const tables = ['categorias', 'marcas', 'tamanhos'];
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);

      if (result.rows[0].exists) {
        console.log(`✅ Tabela "${table}" existe`);
      }
    }
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tabelas já existem (ignorando)');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

createCadastrosTables().catch(console.error);

