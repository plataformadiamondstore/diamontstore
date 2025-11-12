import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseYoutube() {
  console.log('🔍 Testando busca do link do YouTube via Supabase Client...\n');
  console.log('   SUPABASE_URL:', supabaseUrl);
  console.log('   SUPABASE_SERVICE_KEY configurada?', !!supabaseServiceKey);
  console.log('');

  try {
    console.log('📡 Buscando link do YouTube...');
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'youtube_link')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      console.error('   Detalhes:', error.details);
      console.error('   Hint:', error.hint);
      return;
    }

    console.log('✅ Busca realizada com sucesso!');
    console.log('   Data:', data);
    console.log('   Valor:', data?.valor || '(vazio)');
    
    if (data && data.valor) {
      console.log('\n✅ Link encontrado:', data.valor);
    } else {
      console.log('\n⚠️  Link está vazio ou não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSupabaseYoutube();

