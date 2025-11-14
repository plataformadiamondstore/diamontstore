import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';

async function createAcessosLogsTable() {
  console.log('🚀 Criando tabela acessos_logs...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!\n');

    // Verificar se a tabela já existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'acessos_logs'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  A tabela acessos_logs já existe.');
      console.log('✅ Nenhuma alteração necessária.\n');
      await client.end();
      return;
    }

    // Criar tabela acessos_logs
    console.log('📝 Criando tabela acessos_logs...');
    await client.query(`
      CREATE TABLE acessos_logs (
        id SERIAL PRIMARY KEY,
        funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        tipo_evento VARCHAR(50) NOT NULL, -- 'login', 'acesso_pagina', 'acesso_produto'
        pagina VARCHAR(255), -- URL ou nome da página
        produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL, -- Para acessos a produtos
        dispositivo VARCHAR(20) NOT NULL, -- 'mobile' ou 'web'
        user_agent TEXT, -- User agent do navegador
        ip_address VARCHAR(45), -- Endereço IP
        sessao_id VARCHAR(255), -- ID da sessão para rastrear tempo de sessão
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela acessos_logs criada com sucesso!\n');

    // Criar índices para melhor performance
    console.log('📝 Criando índices...');
    await client.query(`
      CREATE INDEX idx_acessos_logs_funcionario_id ON acessos_logs(funcionario_id);
      CREATE INDEX idx_acessos_logs_empresa_id ON acessos_logs(empresa_id);
      CREATE INDEX idx_acessos_logs_tipo_evento ON acessos_logs(tipo_evento);
      CREATE INDEX idx_acessos_logs_dispositivo ON acessos_logs(dispositivo);
      CREATE INDEX idx_acessos_logs_created_at ON acessos_logs(created_at DESC);
      CREATE INDEX idx_acessos_logs_sessao_id ON acessos_logs(sessao_id);
      CREATE INDEX idx_acessos_logs_produto_id ON acessos_logs(produto_id);
    `);
    console.log('✅ Índices criados com sucesso!\n');

    console.log('==================================================\n');
    console.log('✅ Tabela acessos_logs criada e configurada!\n');
    
    await client.end();
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    await client.end();
    process.exit(1);
  }
}

createAcessosLogsTable();

