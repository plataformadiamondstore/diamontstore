import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Service Key:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada');
  console.log('\n');

  try {
    // Testar conexão listando tabelas
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao conectar:', error.message);
    } else {
      console.log('✅ Conexão com Supabase funcionando!');
      console.log('✅ Tabela "empresas" acessível');
    }
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

testConnection();

