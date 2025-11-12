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
const BUCKET_NAME = 'produtos';

async function createBucketIfNotExists() {
  console.log('📦 Verificando se o bucket existe...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Erro ao listar buckets:', listError);
    throw listError;
  }
  
  const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
  
  if (bucketExists) {
    console.log(`✅ Bucket "${BUCKET_NAME}" já existe`);
    return;
  }
  
  console.log(`📦 Criando bucket "${BUCKET_NAME}"...`);
  
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  });
  
  if (error) {
    console.error('❌ Erro ao criar bucket:', error);
    throw error;
  }
  
  console.log(`✅ Bucket "${BUCKET_NAME}" criado com sucesso!`);
}

async function uploadImageToSupabase(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  
  // Detectar tipo MIME baseado na extensão ou conteúdo
  const ext = path.extname(fileName).toLowerCase();
  let mimeType = 'image/jpeg';
  
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.gif') mimeType = 'image/gif';
  else if (ext === '.webp') mimeType = 'image/webp';
  
  // Se não tem extensão, tentar detectar pelo conteúdo
  if (!ext) {
    const firstBytes = fileBuffer.slice(0, 4);
    if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50) mimeType = 'image/png';
    else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49) mimeType = 'image/gif';
    else if (firstBytes[0] === 0x52 && firstBytes[1] === 0x49) mimeType = 'image/webp';
  }
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true // Substituir se já existir
    });
  
  if (error) {
    console.error(`❌ Erro ao fazer upload de ${fileName}:`, error);
    return null;
  }
  
  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

async function migrateImages() {
  console.log('🚀 Iniciando migração de imagens para Supabase Storage...\n');
  
  try {
    // Criar bucket se não existir
    await createBucketIfNotExists();
    
    // Caminho das imagens locais - verificar ambas as pastas
    const uploadsPath = path.join(__dirname, '../uploads/produtos');
    const uploadsPathRoot = path.join(__dirname, '../../uploads/produtos');
    
    // Coletar imagens de ambas as pastas
    const allFiles = [];
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath).filter(file => {
        const filePath = path.join(uploadsPath, file);
        return fs.statSync(filePath).isFile();
      });
      files.forEach(file => {
        allFiles.push({ path: path.join(uploadsPath, file), name: file });
      });
    }
    
    if (fs.existsSync(uploadsPathRoot)) {
      const files = fs.readdirSync(uploadsPathRoot).filter(file => {
        const filePath = path.join(uploadsPathRoot, file);
        return fs.statSync(filePath).isFile();
      });
      files.forEach(file => {
        // Evitar duplicatas
        if (!allFiles.find(f => f.name === file)) {
          allFiles.push({ path: path.join(uploadsPathRoot, file), name: file });
        }
      });
    }
    
    if (allFiles.length === 0) {
      console.error('❌ Nenhuma imagem encontrada!');
      console.error(`   Tentou: ${uploadsPath}`);
      console.error(`   Tentou: ${uploadsPathRoot}`);
      process.exit(1);
    }
    
    console.log(`📁 Pastas verificadas: ${uploadsPath} e ${uploadsPathRoot}\n`);
    console.log(`📸 Encontradas ${allFiles.length} imagens para migrar\n`);
    
    const results = {
      success: 0,
      failed: 0,
      urls: []
    };
    
    // Migrar cada imagem
    for (let i = 0; i < allFiles.length; i++) {
      const fileInfo = allFiles[i];
      const file = fileInfo.name;
      const filePath = fileInfo.path;
      
      console.log(`[${i + 1}/${allFiles.length}] Migrando: ${file}...`);
      
      try {
        const publicUrl = await uploadImageToSupabase(filePath, file);
        
        if (publicUrl) {
          console.log(`   ✅ Upload concluído: ${publicUrl}`);
          results.success++;
          results.urls.push({
            fileName: file,
            url: publicUrl
          });
        } else {
          console.log(`   ❌ Falha no upload`);
          results.failed++;
        }
      } catch (error) {
        console.error(`   ❌ Erro: ${error.message}`);
        results.failed++;
      }
    }
    
    console.log('\n==================================================');
    console.log('📊 RESUMO DA MIGRAÇÃO:');
    console.log(`   ✅ Sucesso: ${results.success}`);
    console.log(`   ❌ Falhas: ${results.failed}`);
    console.log(`   📦 Total: ${allFiles.length}`);
    console.log('==================================================\n');
    
    // Salvar URLs em arquivo JSON para referência
    const urlsPath = path.join(__dirname, '../migration-urls.json');
    fs.writeFileSync(urlsPath, JSON.stringify(results.urls, null, 2));
    console.log(`📄 URLs salvas em: ${urlsPath}`);
    console.log('   Use este arquivo para atualizar o banco de dados\n');
    
    if (results.failed > 0) {
      console.log('⚠️  Algumas imagens falharam. Verifique os erros acima.');
    }
    
    console.log('✅ Migração concluída!');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('   1. Execute o script update-image-urls.js para atualizar o banco de dados');
    console.log('   2. Teste fazendo upload de uma nova imagem');
    console.log('   3. Verifique se as imagens aparecem no site\n');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

migrateImages();

