import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateImageUrls() {
  console.log('🚀 Atualizando URLs das imagens no banco de dados...\n');
  
  try {
    // Ler arquivo de URLs da migração
    const urlsPath = path.join(__dirname, '../migration-urls.json');
    
    if (!fs.existsSync(urlsPath)) {
      console.error('❌ Arquivo migration-urls.json não encontrado!');
      console.error('   Execute primeiro o script migrate-images-to-supabase.js');
      process.exit(1);
    }
    
    const migrationData = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
    console.log(`📄 Carregadas ${migrationData.length} URLs da migração\n`);
    
    // Buscar todas as imagens no banco
    const { data: imagens, error: fetchError } = await supabase
      .from('produto_imagens')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar imagens:', fetchError);
      throw fetchError;
    }
    
    console.log(`📸 Encontradas ${imagens.length} imagens no banco de dados\n`);
    
    if (imagens.length === 0) {
      console.log('⚠️  Nenhuma imagem encontrada no banco de dados');
      return;
    }
    
    // Criar mapa de nomes de arquivo para URLs
    const urlMap = {};
    migrationData.forEach(item => {
      // Extrair nome do arquivo da URL antiga ou usar fileName
      const fileName = item.fileName;
      urlMap[fileName] = item.url;
    });
    
    const results = {
      updated: 0,
      notFound: 0,
      errors: []
    };
    
    // Atualizar cada imagem
    for (let i = 0; i < imagens.length; i++) {
      const imagem = imagens[i];
      const oldUrl = imagem.url_imagem;
      
      // Extrair nome do arquivo da URL antiga
      let fileName = null;
      
      // Tentar extrair de diferentes formatos de URL
      const patterns = [
        /\/uploads\/produtos\/([^\/]+)$/,
        /\/produtos\/([^\/]+)$/,
        /([^\/]+)$/
      ];
      
      for (const pattern of patterns) {
        const match = oldUrl.match(pattern);
        if (match) {
          fileName = match[1];
          break;
        }
      }
      
      if (!fileName) {
        console.log(`[${i + 1}/${imagens.length}] ⚠️  Não foi possível extrair nome do arquivo de: ${oldUrl}`);
        results.notFound++;
        continue;
      }
      
      // Verificar se temos URL nova para este arquivo
      const newUrl = urlMap[fileName];
      
      if (!newUrl) {
        console.log(`[${i + 1}/${imagens.length}] ⚠️  URL não encontrada para: ${fileName}`);
        results.notFound++;
        continue;
      }
      
      // Atualizar URL no banco
      console.log(`[${i + 1}/${imagens.length}] Atualizando: ${fileName}...`);
      console.log(`   Antiga: ${oldUrl}`);
      console.log(`   Nova: ${newUrl}`);
      
      const { error: updateError } = await supabase
        .from('produto_imagens')
        .update({ url_imagem: newUrl })
        .eq('id', imagem.id);
      
      if (updateError) {
        console.error(`   ❌ Erro: ${updateError.message}`);
        results.errors.push({ id: imagem.id, fileName, error: updateError.message });
      } else {
        console.log(`   ✅ Atualizado com sucesso`);
        results.updated++;
      }
    }
    
    console.log('\n==================================================');
    console.log('📊 RESUMO DA ATUALIZAÇÃO:');
    console.log(`   ✅ Atualizadas: ${results.updated}`);
    console.log(`   ⚠️  Não encontradas: ${results.notFound}`);
    console.log(`   ❌ Erros: ${results.errors.length}`);
    console.log(`   📦 Total processadas: ${imagens.length}`);
    console.log('==================================================\n');
    
    if (results.errors.length > 0) {
      console.log('❌ ERROS:');
      results.errors.forEach(err => {
        console.log(`   - ID ${err.id} (${err.fileName}): ${err.error}`);
      });
      console.log('');
    }
    
    if (results.updated > 0) {
      console.log('✅ URLs atualizadas com sucesso!');
      console.log('\n📝 PRÓXIMOS PASSOS:');
      console.log('   1. Verifique se as imagens aparecem no site');
      console.log('   2. Teste fazendo upload de uma nova imagem');
      console.log('   3. As novas imagens serão automaticamente salvas no Supabase Storage\n');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    process.exit(1);
  }
}

updateImageUrls();

