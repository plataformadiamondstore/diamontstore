import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Configurar multer para múltiplas imagens (até 5) - usando memória para upload direto ao Supabase
const uploadImages = multer({
  storage: multer.memoryStorage(), // Usar memória para upload direto ao Supabase
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por imagem
    files: 5 // máximo 5 imagens
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Função helper para fazer upload de imagem para Supabase Storage
async function uploadImageToSupabase(file, produtoId) {
  const BUCKET_NAME = 'produtos';
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(file.originalname) || '.jpg';
  const fileName = `${produtoId}_${timestamp}_${randomString}${ext}`;
  
  // Fazer upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
  
  if (error) {
    console.error('Erro ao fazer upload para Supabase Storage:', error);
    throw error;
  }
  
  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

// Configurar multer para banners
const uploadBanner = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Salvar na pasta public/banners do client
      const bannersPath = path.join(__dirname, '../../client/public/banners/');
      // Garantir que a pasta existe
      if (!fs.existsSync(bannersPath)) {
        fs.mkdirSync(bannersPath, { recursive: true });
      }
      cb(null, bannersPath);
    },
    filename: (req, file, cb) => {
      const { tipo } = req.body;
      // Nomear o arquivo baseado no tipo (mobile ou desktop)
      const filename = tipo === 'mobile' ? 'banner_mobile.jpeg' : 'banner_site.jpeg';
      console.log('📝 Nomeando arquivo:', { tipo, filename });
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB por banner
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, webp)'));
    }
  }
});

// ========== EMPRESAS ==========
router.post('/empresas', async (req, res) => {
  try {
    const { nome, cadastro_empresa } = req.body;
    
    // Validar campos obrigatórios
    if (!nome) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    
    // Se cadastro_empresa foi fornecido, verificar se já existe
    if (cadastro_empresa && cadastro_empresa.trim() !== '') {
      const { data: empresaExistente, error: checkError } = await supabase
        .from('empresas')
        .select('id, nome, cadastro_empresa')
        .eq('cadastro_empresa', cadastro_empresa.trim())
        .limit(1);
      
      if (checkError) {
        console.error('Erro ao verificar empresa existente:', checkError);
        throw checkError;
      }
      
      if (empresaExistente && empresaExistente.length > 0) {
        return res.status(400).json({ 
          error: `Já existe uma empresa cadastrada com o cadastro "${cadastro_empresa}". Empresa: ${empresaExistente[0].nome}` 
        });
      }
    }
    
    // Usar cadastro_empresa apenas se foi fornecido e não está vazio
    // Se não fornecido, gerar um código único baseado no nome e timestamp
    let cadastroEmpresaFinal = null;
    if (cadastro_empresa && cadastro_empresa.trim() !== '') {
      cadastroEmpresaFinal = cadastro_empresa.trim();
    } else {
      // Gerar código único quando não fornecido
      // Usar nome normalizado + timestamp para garantir unicidade
      const nomeNormalizado = nome.trim().toLowerCase().replace(/\s+/g, '_').substring(0, 20);
      const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
      cadastroEmpresaFinal = `${nomeNormalizado}_${timestamp}`;
    }
    
    // Inserir empresa
    const { data: empresasInseridas, error: insertError } = await supabase
      .from('empresas')
      .insert({ nome, cadastro_empresa: cadastroEmpresaFinal })
      .select();

    if (insertError) {
      console.error('Erro ao inserir empresa:', insertError);
      
      // Tratar erro de constraint única de forma mais amigável
      if (insertError.code === '23505' || insertError.message?.includes('unique constraint') || insertError.message?.includes('duplicate key')) {
        return res.status(400).json({ 
          error: 'Já existe uma empresa cadastrada com este cadastro. Por favor, verifique os dados e tente novamente.' 
        });
      }
      
      throw insertError;
    }

    if (!empresasInseridas || empresasInseridas.length === 0) {
      throw new Error('Erro ao criar empresa - nenhum registro retornado');
    }

    res.json({ success: true, empresa: empresasInseridas[0], id: empresasInseridas[0].id });
  } catch (error) {
    console.error('Erro completo ao criar empresa:', error);
    
    // Melhorar mensagem de erro para constraint única
    if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      return res.status(400).json({ 
        error: 'Já existe uma empresa cadastrada com este cadastro. Por favor, verifique os dados e tente novamente.' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Erro ao criar empresa' });
  }
});

router.get('/empresas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/empresas/:id', async (req, res) => {
  try {
    const { nome } = req.body;
    
    // Validar campos obrigatórios
    if (!nome) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }

    // Atualizar empresa
    const { error: updateError } = await supabase
      .from('empresas')
      .update({ nome })
      .eq('id', req.params.id);

    if (updateError) {
      console.error('Erro ao atualizar empresa:', updateError);
      throw updateError;
    }

    // Buscar empresa atualizada
    const { data: empresaData, error: fetchError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);

    if (fetchError) {
      console.error('Erro ao buscar empresa após atualização:', fetchError);
      throw fetchError;
    }

    if (!empresaData || empresaData.length === 0) {
      throw new Error('Empresa não encontrada após atualização');
    }

    res.json({ success: true, empresa: empresaData[0] });
  } catch (error) {
    console.error('Erro completo ao atualizar empresa:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar empresa' });
  }
});

router.delete('/empresas/:id', async (req, res) => {
  try {
    console.log('DELETE /admin/empresas/:id - Iniciando exclusão da empresa:', req.params.id);
    
    const empresaId = req.params.id;
    
    if (!empresaId) {
      return res.status(400).json({ error: 'ID da empresa é obrigatório' });
    }

    // Verificar se a empresa existe antes de deletar
    const { data: empresaExistente, error: checkError } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', empresaId)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar empresa:', checkError);
      throw checkError;
    }

    if (!empresaExistente || empresaExistente.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Deletar empresa (cascata deve deletar clubes e gestores relacionados)
    const { error: deleteError } = await supabase
      .from('empresas')
      .delete()
      .eq('id', empresaId);

    if (deleteError) {
      console.error('Erro ao deletar empresa:', deleteError);
      throw deleteError;
    }

    console.log('Empresa deletada com sucesso:', empresaId);
    res.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro completo ao deletar empresa:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar empresa' });
  }
});

// ========== CLUBES ==========
router.post('/clubes', async (req, res) => {
  try {
    const { nome, cadastro_clube, empresa_id } = req.body;
    
    // Inserir sem .single() para evitar erro de coerção
    const { data: clubesInseridos, error: insertError } = await supabase
      .from('clubes')
      .insert({ nome, cadastro_clube, empresa_id })
      .select();

    if (insertError) {
      console.error('Erro ao inserir clube:', insertError);
      throw insertError;
    }

    if (!clubesInseridos || clubesInseridos.length === 0) {
      throw new Error('Erro ao criar clube - nenhum registro retornado');
    }

    res.json({ success: true, clube: clubesInseridos[0], id: clubesInseridos[0].id });
  } catch (error) {
    console.error('Erro completo ao criar clube:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar clube' });
  }
});

router.get('/clubes', async (req, res) => {
  try {
    const { empresa_id } = req.query;
    let query = supabase.from('clubes').select('*');

    if (empresa_id) {
      query = query.eq('empresa_id', empresa_id);
    }

    const { data, error } = await query.order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GESTORES ==========
router.get('/gestores', async (req, res) => {
  try {
    console.log('GET /admin/gestores - Iniciando busca');
    const { empresa_id } = req.query;
    
    // Primeiro buscar gestores sem relação para evitar problemas
    let query = supabase
      .from('gestores')
      .select('*')
      .order('nome', { ascending: true });

    if (empresa_id) {
      query = query.eq('empresa_id', empresa_id);
    }

    const { data: gestoresData, error: gestoresError } = await query;

    if (gestoresError) {
      console.error('Erro ao buscar gestores:', gestoresError);
      throw gestoresError;
    }

    if (!gestoresData || gestoresData.length === 0) {
      console.log('Nenhum gestor encontrado');
      return res.json([]);
    }

    // Buscar empresas separadamente para cada gestor
    const gestoresComEmpresas = await Promise.all(
      gestoresData.map(async (gestor) => {
        try {
          if (gestor.empresa_id) {
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', gestor.empresa_id)
              .limit(1);

            if (!empresaError && empresaData && empresaData.length > 0) {
              return {
                ...gestor,
                empresas: empresaData[0]
              };
            }
          }
          return gestor;
        } catch (err) {
          console.warn(`Erro ao buscar empresa para gestor ${gestor.id}:`, err);
          return gestor;
        }
      })
    );

    console.log('Gestores encontrados:', gestoresComEmpresas.length);
    res.json(gestoresComEmpresas);
  } catch (error) {
    console.error('Erro completo ao buscar gestores:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar gestores' });
  }
});

router.post('/gestores', async (req, res) => {
  try {
    const { nome, usuario, senha, empresa_id, clube_id } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !usuario || !senha || !empresa_id) {
      return res.status(400).json({ error: 'Nome, usuário, senha e empresa são obrigatórios' });
    }

    // Preparar dados para inserção
    const gestorData = { nome, usuario, senha, empresa_id };
    // Adicionar clube_id apenas se for válido (não null, não undefined, não string vazia)
    if (clube_id !== null && clube_id !== undefined && clube_id !== '') {
      // Se for string, verificar se não está vazia após trim
      if (typeof clube_id === 'string') {
        if (clube_id.trim() !== '') {
          gestorData.clube_id = parseInt(clube_id, 10);
        }
      } else {
        // Se for número, adicionar diretamente
        gestorData.clube_id = clube_id;
      }
    }

    // Inserir gestor sem .single() para evitar erro de coerção
    const { data: gestoresInseridos, error: insertError } = await supabase
      .from('gestores')
      .insert(gestorData)
      .select();

    if (insertError) {
      console.error('Erro ao inserir gestor:', insertError);
      throw insertError;
    }

    if (!gestoresInseridos || gestoresInseridos.length === 0) {
      throw new Error('Erro ao criar gestor - nenhum registro retornado');
    }

    const gestor = gestoresInseridos[0];

    // Buscar gestor com dados da empresa
    const { data: gestorCompleto, error: fetchError } = await supabase
      .from('gestores')
      .select('*, empresas(*)')
      .eq('id', gestor.id)
      .limit(1);

    if (fetchError) {
      console.error('Erro ao buscar gestor após criação:', fetchError);
      // Retornar mesmo sem empresa se houver erro
      res.json({ success: true, gestor });
    } else {
      res.json({ success: true, gestor: gestorCompleto && gestorCompleto.length > 0 ? gestorCompleto[0] : gestor });
    }
  } catch (error) {
    console.error('Erro completo ao criar gestor:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar gestor' });
  }
});

router.put('/gestores/:id', async (req, res) => {
  try {
    const { nome, usuario, senha, empresa_id } = req.body;
    
    // Validar campos obrigatórios (senha é opcional na atualização)
    if (!nome || !usuario || !empresa_id) {
      return res.status(400).json({ error: 'Nome, usuário e empresa são obrigatórios' });
    }

    const updateData = { nome, usuario, empresa_id };
    if (senha && senha.trim() !== '') {
      updateData.senha = senha;
    }

    // Atualizar gestor
    const { error: updateError } = await supabase
      .from('gestores')
      .update(updateData)
      .eq('id', req.params.id);

    if (updateError) {
      console.error('Erro ao atualizar gestor:', updateError);
      throw updateError;
    }

    // Buscar gestor atualizado
    const { data: gestorData, error: fetchError } = await supabase
      .from('gestores')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);

    if (fetchError) {
      console.error('Erro ao buscar gestor após atualização:', fetchError);
      throw fetchError;
    }

    if (!gestorData || gestorData.length === 0) {
      throw new Error('Gestor não encontrado após atualização');
    }

    // Buscar empresa
    let gestorCompleto = gestorData[0];
    if (gestorCompleto.empresa_id) {
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', gestorCompleto.empresa_id)
        .limit(1);
      
      if (empresaData && empresaData.length > 0) {
        gestorCompleto.empresas = empresaData[0];
      }
    }

    res.json({ success: true, gestor: gestorCompleto });
  } catch (error) {
    console.error('Erro completo ao atualizar gestor:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar gestor' });
  }
});

router.delete('/gestores/:id', async (req, res) => {
  try {
    console.log('DELETE /admin/gestores/:id - Iniciando exclusão do gestor:', req.params.id);
    
    const gestorId = req.params.id;
    
    if (!gestorId) {
      return res.status(400).json({ error: 'ID do gestor é obrigatório' });
    }

    // Verificar se o gestor existe antes de deletar
    const { data: gestorExistente, error: checkError } = await supabase
      .from('gestores')
      .select('id')
      .eq('id', gestorId)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar gestor:', checkError);
      throw checkError;
    }

    if (!gestorExistente || gestorExistente.length === 0) {
      return res.status(404).json({ error: 'Gestor não encontrado' });
    }

    // Deletar gestor
    const { error: deleteError } = await supabase
      .from('gestores')
      .delete()
      .eq('id', gestorId);

    if (deleteError) {
      console.error('Erro ao deletar gestor:', deleteError);
      throw deleteError;
    }

    console.log('Gestor deletado com sucesso:', gestorId);
    res.json({ success: true, message: 'Gestor deletado com sucesso' });
  } catch (error) {
    console.error('Erro completo ao deletar gestor:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar gestor' });
  }
});

// ========== FUNCIONÁRIOS (Upload Excel) ==========
router.post('/funcionarios/upload', upload.single('file'), async (req, res) => {
  const fs = await import('fs/promises');
  let filePath = null;

  try {
    console.log('POST /admin/funcionarios/upload - Iniciando upload');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    filePath = req.file.path;
    console.log('Arquivo recebido:', req.file.originalname);

    if (!req.body.empresa_id) {
      return res.status(400).json({ error: 'empresa_id é obrigatório' });
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Tentar ler com diferentes opções para suportar mais formatos
    // Primeiro, tentar com header na primeira linha (padrão)
    let data = xlsx.utils.sheet_to_json(worksheet, {
      defval: '', // Valor padrão para células vazias
      blankrows: false // Não incluir linhas completamente vazias
    });
    
    // Se não houver dados, tentar sem header (primeira linha como dados)
    if (!data || data.length === 0) {
      console.log('Tentando ler sem header...');
      data = xlsx.utils.sheet_to_json(worksheet, {
        header: 1, // Usar primeira linha como dados
        defval: '',
        blankrows: false
      });
      
      // Se ainda não houver dados, tentar com range
      if (!data || data.length === 0) {
        const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
        console.log('Range do worksheet:', range);
        data = xlsx.utils.sheet_to_json(worksheet, {
          range: 0, // Começar da primeira linha
          defval: '',
          blankrows: false
        });
      }
    }

    console.log('Total de linhas no Excel:', data.length);

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'O arquivo Excel está vazio ou não contém dados válidos' });
    }

    // Processar e validar dados
    const funcionarios = [];
    const erros = [];

    // Função auxiliar para buscar valor ignorando maiúsculas/minúsculas e espaços
    const buscarValor = (obj, possiveisChaves) => {
      if (!obj || typeof obj !== 'object') {
        return null;
      }
      
      const chavesObj = Object.keys(obj || {});
      
      // Primeiro, tentar busca exata
      for (const chavePossivel of possiveisChaves) {
        if (obj[chavePossivel] !== undefined && obj[chavePossivel] !== null && obj[chavePossivel] !== '') {
          const valor = obj[chavePossivel];
          // Converter para string e remover espaços extras
          const valorStr = String(valor).trim();
          if (valorStr && valorStr !== 'null' && valorStr !== 'undefined') {
            return valorStr;
          }
        }
      }
      
      // Depois, buscar ignorando case, espaços e caracteres especiais
      for (const chavePossivel of possiveisChaves) {
        const chaveEncontrada = chavesObj.find((k) => {
          // Normalizar: remover espaços, caracteres especiais e converter para minúsculas
          const kNormalized = k.toLowerCase().replace(/\s+/g, '').replace(/[_\-\.,;:]/g, '');
          const chaveNormalized = chavePossivel.toLowerCase().replace(/\s+/g, '').replace(/[_\-\.,;:]/g, '');
          return kNormalized === chaveNormalized;
        });
        
        if (chaveEncontrada) {
          const valor = obj[chaveEncontrada];
          if (valor !== undefined && valor !== null && valor !== '') {
            // Converter para string e remover espaços extras
            const valorStr = String(valor).trim();
            if (valorStr && valorStr !== 'null' && valorStr !== 'undefined') {
              return valorStr;
            }
          }
        }
      }
      
      return null;
    };

    // Log das primeiras linhas para debug
    if (data.length > 0) {
      console.log('=== DEBUG: Estrutura do Excel ===');
      console.log('Total de linhas:', data.length);
      const primeirasLinhas = data.slice(0, 3);
      console.log('Primeiras 3 linhas do Excel:', JSON.stringify(primeirasLinhas, null, 2));
      const chaves = Object.keys(data[0] || {});
      console.log('Chaves disponíveis na primeira linha:', chaves);
      console.log('Valores da primeira linha:', data[0]);
      console.log('================================');
    }

    // Filtrar linhas completamente vazias antes de processar
    const linhasValidas = data.filter((row, index) => {
      if (!row || typeof row !== 'object') return false;
      const chaves = Object.keys(row);
      // Se não houver chaves ou todas as chaves tiverem valores vazios, ignorar
      if (chaves.length === 0) return false;
      const temValor = chaves.some(chave => {
        const valor = row[chave];
        return valor !== null && valor !== undefined && valor !== '' && String(valor).trim() !== '';
      });
      return temValor;
    });

    console.log('Linhas válidas após filtro:', linhasValidas.length, 'de', data.length);

    linhasValidas.forEach(function(row, index) {
      // Suportar múltiplas variações de nomes de colunas (incluindo nome_empregado da planilha)
      // Adicionar variações comuns em planilhas brasileiras e da Schaeffler
      const possiveisNomes = [
        // Variações com underscore
        'nome_empregado', 'Nome_Empregado', 'NOME_EMPREGADO', 'nome_empregado', 'Nome_Empregado',
        'nome_completo', 'Nome_Completo', 'NOME_COMPLETO', 'nome_completo', 'Nome_Completo',
        // Variações com espaço
        'Nome Empregado', 'NOME EMPREGADO', 'nome empregado', 'Nome empregado',
        'Nome Completo', 'NOME COMPLETO', 'nome completo', 'Nome completo',
        // Variações simples
        'nome', 'Nome', 'NOME', 'empregado', 'Empregado', 'EMPREGADO',
        'funcionario', 'Funcionario', 'FUNCIONARIO', 'funcionário', 'Funcionário', 'FUNCIONÁRIO',
        // Variações comuns em planilhas corporativas
        'Nome do Empregado', 'NOME DO EMPREGADO', 'nome do empregado',
        'Nome do Funcionário', 'NOME DO FUNCIONÁRIO', 'nome do funcionário',
        'Nome Funcionário', 'NOME FUNCIONÁRIO', 'nome funcionário',
        'Colaborador', 'colaborador', 'COLABORADOR', 'Nome Colaborador',
        // Variações com acentos e sem acentos
        'Nome Empregado', 'Nome Empregado', 'nome empregado',
        'Funcionario', 'funcionario', 'FUNCIONARIO'
      ];
      const nomeCompleto = buscarValor(row, possiveisNomes);
      
      // Debug para a primeira linha
      if (index === 0) {
        console.log('=== DEBUG: Primeira linha do Excel ===');
        console.log('Chaves disponíveis:', Object.keys(row));
        console.log('Valores da linha:', row);
        console.log('Nome encontrado:', nomeCompleto);
        console.log('Tipo do nome:', typeof nomeCompleto);
        console.log('=====================================');
      }
      const possiveisCadastrosEmpresa = [
        // Variações com underscore
        'cadastro_empresa', 'Cadastro_Empresa', 'CADASTRO_EMPRESA',
        // Variações com espaço
        'cadastro empresa', 'Cadastro Empresa', 'CADASTRO EMPRESA', 'Cadastro empresa',
        // Variações comuns
        'Cadastro da Empresa', 'CADASTRO DA EMPRESA', 'cadastro da empresa',
        'Código Empresa', 'CODIGO EMPRESA', 'código empresa', 'Codigo Empresa',
        'Código da Empresa', 'CODIGO DA EMPRESA', 'código da empresa',
        'Empresa', 'EMPRESA', 'empresa', 'ID Empresa', 'id empresa', 'ID_EMPRESA'
      ];
      const cadastroEmpresa = buscarValor(row, possiveisCadastrosEmpresa);
      
      const possiveisCadastrosClube = [
        // Variações com underscore
        'cadastro_clube', 'Cadastro_Clube', 'CADASTRO_CLUBE',
        // Variações com espaço
        'cadastro clube', 'Cadastro Clube', 'CADASTRO CLUBE', 'Cadastro clube',
        // Variações comuns
        'Cadastro do Clube', 'CADASTRO DO CLUBE', 'cadastro do clube',
        'Código Clube', 'CODIGO CLUBE', 'código clube', 'Codigo Clube',
        'Código do Clube', 'CODIGO DO CLUBE', 'código do clube',
        'Clube', 'CLUBE', 'clube', 'ID Clube', 'id clube', 'ID_CLUBE'
      ];
      const cadastroClube = buscarValor(row, possiveisCadastrosClube);

      // Validar e converter para string, removendo espaços
      // A função buscarValor já retorna string trimada ou null, mas vamos garantir
      let nomeCompletoStr = null;
      if (nomeCompleto) {
        // Converter para string e remover espaços extras
        nomeCompletoStr = String(nomeCompleto).trim();
        // Se for apenas espaços ou strings inválidas, considerar null
        if (nomeCompletoStr === '' || nomeCompletoStr === 'null' || nomeCompletoStr === 'undefined' || nomeCompletoStr === 'NaN') {
          nomeCompletoStr = null;
        }
      }
      
      const cadastroEmpresaStr = cadastroEmpresa ? String(cadastroEmpresa).trim() : null;
      const cadastroClubeStr = cadastroClube ? String(cadastroClube).trim() : null;

      // Validação rigorosa - não permitir null, undefined, ou strings vazias
      if (!nomeCompletoStr || nomeCompletoStr === '' || nomeCompletoStr === 'null' || nomeCompletoStr === 'undefined' || nomeCompletoStr === 'NaN') {
        const chavesEncontradas = Object.keys(row).join(', ');
        const linhaNum = index + 2; // +2 porque index começa em 0 e Excel começa em 1, mais 1 para o header
        const valoresLinha = Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', ');
        erros.push('Linha ' + linhaNum + ': Nome Empregado é obrigatório e não pode estar vazio. Chaves encontradas: ' + chavesEncontradas + '. Valores: ' + valoresLinha);
        console.error('Linha ' + linhaNum + ' - Nome não encontrado. Chaves disponíveis:', Object.keys(row));
        console.error('Linha ' + linhaNum + ' - Valores da linha:', JSON.stringify(row, null, 2));
        console.error('Linha ' + linhaNum + ' - Nome retornado pela busca:', nomeCompleto);
        console.error('Linha ' + linhaNum + ' - Tipo do nome:', typeof nomeCompleto);
        return;
      }

      if (!cadastroEmpresaStr || cadastroEmpresaStr === '' || cadastroEmpresaStr === 'null' || cadastroEmpresaStr === 'undefined') {
        const linhaNum2 = index + 2;
        const chavesEncontradas = Object.keys(row).join(', ');
        const valoresLinha = Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', ');
        erros.push('Linha ' + linhaNum2 + ': Cadastro Empresa é obrigatório e não pode estar vazio. Chaves encontradas: ' + chavesEncontradas + '. Valores: ' + valoresLinha);
        console.error('Linha ' + linhaNum2 + ' - Cadastro Empresa não encontrado. Chaves disponíveis:', Object.keys(row));
        console.error('Linha ' + linhaNum2 + ' - Valores da linha:', JSON.stringify(row, null, 2));
        return;
      }

      // Garantir que não há valores null antes de inserir
      const funcionario = {
        nome_completo: nomeCompletoStr,
        cadastro_empresa: cadastroEmpresaStr,
        cadastro_clube: cadastroClubeStr || null,
        empresa_id: parseInt(req.body.empresa_id, 10) || null,
        clube_id: null
      };

      // Validação final antes de adicionar - garantir que nome_completo não é null
      if (!funcionario.nome_completo || funcionario.nome_completo === '') {
        const linhaNum3 = index + 2;
        erros.push('Linha ' + linhaNum3 + ': Erro ao processar nome do funcionário - valor inválido');
        return;
      }

      funcionarios.push(funcionario);
    });

    if (erros.length > 0) {
      console.error('Erros de validação:', erros);
      return res.status(400).json({ 
        error: 'Erros de validação encontrados', 
        detalhes: erros 
      });
    }

    if (funcionarios.length === 0) {
      return res.status(400).json({ error: 'Nenhum funcionário válido encontrado no arquivo' });
    }

    // FILTRO FINAL: Remover qualquer registro que tenha nome_completo null ou vazio
    const funcionariosValidos = funcionarios.filter(f => {
      const isValid = f.nome_completo && 
                      f.nome_completo !== null && 
                      f.nome_completo !== undefined && 
                      f.nome_completo !== '' &&
                      f.nome_completo !== 'null' &&
                      f.nome_completo !== 'undefined' &&
                      f.cadastro_empresa &&
                      f.cadastro_empresa !== null &&
                      f.cadastro_empresa !== undefined &&
                      f.cadastro_empresa !== '' &&
                      f.empresa_id &&
                      f.empresa_id !== null &&
                      f.empresa_id !== undefined;
      
      if (!isValid) {
        console.error('Registro inválido filtrado:', f);
      }
      return isValid;
    });

    if (funcionariosValidos.length === 0) {
      return res.status(400).json({ error: 'Nenhum funcionário válido após validação final. Verifique os dados da planilha.' });
    }

    if (funcionariosValidos.length !== funcionarios.length) {
      const filtrados = funcionarios.length - funcionariosValidos.length;
      console.warn('Aviso: ' + filtrados + ' registros foram filtrados por serem invalidos');
    }

    // Validação adicional: verificar cada registro antes de inserir
    funcionariosValidos.forEach((f, idx) => {
      if (!f.nome_completo || f.nome_completo === null || f.nome_completo === undefined) {
        console.error('ERRO CRITICO: Registro ' + idx + ' tem nome_completo null:', f);
        throw new Error('Registro ' + (idx + 1) + ' tem nome_completo invalido');
      }
    });

    console.log('Inserindo', funcionariosValidos.length, 'funcionarios validos...');
    if (funcionariosValidos.length > 0) {
      console.log('Primeiro registro de exemplo:', JSON.stringify(funcionariosValidos[0], null, 2));
    }

    const empresaId = parseInt(req.body.empresa_id, 10);

    // DELETAR funcionários anteriores da empresa ANTES de inserir os novos
    console.log('Deletando funcionários anteriores da empresa ID:', empresaId);
    const { error: deleteError } = await supabase
      .from('funcionarios')
      .delete()
      .eq('empresa_id', empresaId);

    if (deleteError) {
      console.error('Erro ao deletar funcionários anteriores:', deleteError);
      throw deleteError;
    }

    console.log('Funcionários anteriores deletados com sucesso. Inserindo novos funcionários...');

    // Inserir os novos funcionários
    const { data: inserted, error } = await supabase
      .from('funcionarios')
      .insert(funcionariosValidos)
      .select();

    if (error) {
      console.error('Erro ao inserir funcionários:', error);
      throw error;
    }

    console.log('Sucesso:', inserted.length, 'funcionarios inseridos com sucesso');

    // Salvar histórico do upload
    try {
      console.log('Salvando histórico do upload...');
      console.log('Dados do histórico:', {
        empresa_id: parseInt(req.body.empresa_id, 10),
        quantidade_funcionarios: inserted.length,
        nome_arquivo: req.file.originalname || 'arquivo.xlsx'
      });

      const { data: uploadHistory, error: historyError } = await supabase
        .from('funcionarios_uploads')
        .insert({
          empresa_id: parseInt(req.body.empresa_id, 10),
          quantidade_funcionarios: inserted.length,
          nome_arquivo: req.file.originalname || 'arquivo.xlsx'
        })
        .select();

      if (historyError) {
        console.error('ERRO ao salvar histórico do upload:', historyError);
        console.error('Detalhes do erro:', JSON.stringify(historyError, null, 2));
      } else {
        console.log('✅ Histórico de upload salvo com sucesso:', uploadHistory);
      }
    } catch (historyError) {
      console.error('ERRO ao salvar histórico (catch):', historyError);
      console.error('Stack trace:', historyError.stack);
    }

    // Limpar arquivo temporário
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.warn('Aviso: Não foi possível deletar arquivo temporário:', unlinkError.message);
    }

    res.json({ success: true, count: inserted.length, funcionarios: inserted });
  } catch (error) {
    console.error('Erro completo no upload de funcionários:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn('Aviso: Não foi possível deletar arquivo temporário:', unlinkError.message);
      }
    }

    const errorMessage = error.message || 'Erro desconhecido ao processar upload';
    res.status(500).json({ error: errorMessage });
  }
});

// ========== HISTÓRICO DE UPLOADS DE FUNCIONÁRIOS ==========
router.get('/funcionarios/uploads', async (req, res) => {
  try {
    console.log('GET /admin/funcionarios/uploads - Buscando histórico de uploads...');
    
    // Buscar histórico de uploads
    const { data: uploads, error } = await supabase
      .from('funcionarios_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico de uploads:', error);
      throw error;
    }

    console.log('Uploads encontrados:', uploads ? uploads.length : 0);

    if (!uploads || uploads.length === 0) {
      console.log('Nenhum upload encontrado na tabela funcionarios_uploads');
      return res.json({ success: true, uploads: [] });
    }

    // Buscar empresas separadamente para evitar problemas com relações aninhadas
    const empresaIds = [...new Set(uploads.map(u => u.empresa_id))];
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .in('id', empresaIds);

    if (empresasError) {
      console.warn('Aviso: Erro ao buscar empresas:', empresasError.message);
    }

    // Criar mapa de empresas para busca rápida
    const empresasMap = {};
    if (empresas) {
      empresas.forEach(emp => {
        empresasMap[emp.id] = emp.nome;
      });
    }

    // Para cada upload, buscar os funcionários relacionados
    const uploadsProcessados = await Promise.all(uploads.map(async (upload) => {
      // Buscar TODOS os funcionários da empresa (já que agora deletamos e inserimos novamente)
      // Buscar os mais recentes primeiro, limitado pela quantidade do upload
      const { data: funcionarios, error: funcError } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, cadastro_empresa, cadastro_clube')
        .eq('empresa_id', upload.empresa_id)
        .order('created_at', { ascending: false })
        .limit(upload.quantidade_funcionarios || 100); // Limitar pela quantidade do upload

      if (funcError) {
        console.warn('Aviso: Erro ao buscar funcionários para upload', upload.id, ':', funcError.message);
      }

      // Usar os funcionários encontrados ou array vazio
      const funcionariosList = funcionarios || [];

      const uploadProcessado = {
        id: upload.id,
        empresa_id: upload.empresa_id,
        nome_empresa: empresasMap[upload.empresa_id] || 'Empresa não encontrada',
        quantidade_funcionarios: upload.quantidade_funcionarios || 0,
        nome_arquivo: upload.nome_arquivo || 'N/A',
        created_at: upload.created_at,
        updated_at: upload.updated_at,
        funcionarios: funcionariosList.slice(0, 50) // Limitar a 50 para exibição
      };
      
      console.log('Upload processado:', {
        id: uploadProcessado.id,
        empresa_id: uploadProcessado.empresa_id,
        nome_empresa: uploadProcessado.nome_empresa,
        quantidade: uploadProcessado.quantidade_funcionarios,
        arquivo: uploadProcessado.nome_arquivo,
        data: uploadProcessado.created_at
      });
      
      return uploadProcessado;
    }));

    console.log('Uploads processados para retorno:', JSON.stringify(uploadsProcessados, null, 2));
    console.log('Total de uploads processados:', uploadsProcessados.length);
    
    res.json({ success: true, uploads: uploadsProcessados });
  } catch (error) {
    console.error('Erro completo ao buscar histórico de uploads:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar histórico de uploads' });
  }
});

// ========== PRODUTOS ==========
router.post('/produtos', uploadImages.array('imagens', 5), async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, marca, sku, variacoes } = req.body;
    
    // Debug: verificar dados recebidos
    console.log('=== CRIAÇÃO DE PRODUTO ===');
    console.log('Nome:', nome);
    console.log('SKU recebido:', sku);
    console.log('Tipo do SKU:', typeof sku);
    console.log('Body completo:', Object.keys(req.body));
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Preparar dados para inserção
    let variacoesArray = [];
    if (variacoes) {
      try {
        if (Array.isArray(variacoes)) {
          variacoesArray = variacoes;
        } else if (typeof variacoes === 'string') {
          variacoesArray = JSON.parse(variacoes);
        }
      } catch (parseError) {
        console.warn('Erro ao parsear variações:', parseError);
        variacoesArray = [];
      }
    }
    
    const dadosProduto = {
      nome: String(nome || ''),
      descricao: String(descricao || ''),
      preco: preco ? parseFloat(preco) : 0,
      categoria: String(categoria || ''),
      marca: String(marca || ''),
      variacoes: variacoesArray
    };
    
    // Adicionar SKU se foi fornecido
    if (sku !== undefined && sku !== null && sku !== '') {
      dadosProduto.sku = String(sku);
      console.log('SKU será salvo:', dadosProduto.sku);
    } else {
      dadosProduto.sku = null;
      console.log('SKU será NULL (não fornecido ou vazio)');
    }
    
    console.log('Dados para inserir:', JSON.stringify(dadosProduto, null, 2));
    
    // Criar produto - NUNCA usar .single() após insert, buscar separadamente
    const { data: produtosInseridos, error: produtoError } = await supabase
      .from('produtos')
      .insert(dadosProduto)
      .select();

    if (produtoError) {
      console.error('Erro ao inserir produto:', produtoError);
      throw produtoError;
    }

    if (!produtosInseridos || produtosInseridos.length === 0) {
      throw new Error('Erro ao criar produto - nenhum registro retornado');
    }

    const produto = produtosInseridos[0];
    console.log('Produto criado com sucesso. ID:', produto.id);
    console.log('SKU do produto criado:', produto.sku);

    // Processar imagens se houver - Upload para Supabase Storage
    const files = req.files || [];
    if (files.length > 0) {
      const imagensData = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Fazer upload para Supabase Storage
          const urlImagem = await uploadImageToSupabase(file, produto.id);
          
          imagensData.push({
            produto_id: produto.id,
            url_imagem: urlImagem,
            ordem: i
          });
          
          console.log(`✅ Imagem ${i + 1} enviada para Supabase Storage: ${urlImagem}`);
        } catch (error) {
          console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, error);
          // Continuar com outras imagens mesmo se uma falhar
        }
      }

      // Salvar imagens na tabela produto_imagens
      if (imagensData.length > 0) {
        const { error: imagensError } = await supabase
          .from('produto_imagens')
          .insert(imagensData);

        if (imagensError) throw imagensError;
      }
    }

    // Buscar produto e imagens separadamente para evitar erro de coerção
    const { data: produtoData, error: produtoFetchError } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', produto.id)
      .limit(1);

    if (produtoFetchError) throw produtoFetchError;

    if (!produtoData || produtoData.length === 0) {
      throw new Error('Produto não encontrado após criação');
    }

    // Buscar imagens do produto separadamente
    const { data: imagensBuscadas, error: imagensFetchError } = await supabase
      .from('produto_imagens')
      .select('*')
      .eq('produto_id', produto.id)
      .order('ordem', { ascending: true });

    if (imagensFetchError) {
      console.warn('Erro ao buscar imagens após criação:', imagensFetchError);
      // Não falhar se não conseguir buscar imagens
    }

    // Combinar produto com imagens e garantir serialização
    const produtoCompleto = {
      ...produtoData[0],
      produto_imagens: imagensBuscadas || []
    };

    // Serializar para garantir que é JSON válido
    const produtoSerializado = JSON.parse(JSON.stringify(produtoCompleto));

    res.json({ success: true, produto: produtoSerializado });
  } catch (error) {
    console.error('=== ERRO AO CRIAR PRODUTO ===');
    console.error('Mensagem de erro:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) console.error('Código do erro:', error.code);
    if (error.details) console.error('Detalhes:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    
    // Limpar arquivos em caso de erro
    const files = req.files || [];
    if (files.length > 0) {
      const fs = await import('fs/promises');
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (e) {
          console.error('Erro ao deletar arquivo:', e);
        }
      }
    }
    
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error.message || 'Erro desconhecido ao criar produto';
    console.error('Enviando erro para o cliente:', errorMessage);
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        hint: error.hint,
        details: error.details
      } : undefined
    });
  }
});

router.put('/produtos/:id', uploadImages.array('imagens', 5), async (req, res) => {
  try {
    console.log('Iniciando atualização do produto:', req.params.id);
    console.log('Body recebido:', Object.keys(req.body));
    console.log('Arquivos recebidos:', req.files?.length || 0);
    
    // Ler dados do body (FormData)
    const nome = req.body.nome;
    const descricao = req.body.descricao;
    const preco = req.body.preco ? parseFloat(req.body.preco) : undefined;
    const categoria = req.body.categoria;
    const marca = req.body.marca;
    const sku = req.body.sku;
    const ean = req.body.ean;
    const estoque = req.body.estoque;
    const variacoes = req.body.variacoes;
    
    const fs = await import('fs/promises');
    
    // Atualizar dados do produto
    const updateData = {};
    if (nome !== undefined && nome !== null && nome !== '') updateData.nome = String(nome);
    if (descricao !== undefined && descricao !== null) updateData.descricao = String(descricao);
    if (preco !== undefined && preco !== null && !isNaN(preco)) updateData.preco = preco;
    if (categoria !== undefined && categoria !== null && categoria !== '') updateData.categoria = String(categoria);
    if (marca !== undefined && marca !== null && marca !== '') updateData.marca = String(marca);
    // SKU: sempre incluir no updateData se foi enviado (mesmo que vazio)
    if (sku !== undefined) {
      if (sku !== null && sku !== '') {
        updateData.sku = String(sku);
      } else {
        updateData.sku = null;
      }
    }
    // EAN: sempre incluir no updateData se foi enviado (mesmo que vazio)
    if (ean !== undefined) {
      if (ean !== null && ean !== '') {
        updateData.ean = String(ean);
      } else {
        updateData.ean = null;
      }
    }
    // Estoque: sempre incluir no updateData se foi enviado
    if (estoque !== undefined && estoque !== null && estoque !== '') {
      const estoqueNum = parseInt(estoque, 10);
      if (!isNaN(estoqueNum)) {
        updateData.estoque = estoqueNum;
      }
    }
    if (variacoes !== undefined && variacoes !== null) {
      try {
        updateData.variacoes = Array.isArray(variacoes) ? variacoes : JSON.parse(variacoes);
      } catch (e) {
        console.warn('Erro ao parsear variações:', e);
        updateData.variacoes = [];
      }
    }
    
    console.log('Dados para atualizar:', Object.keys(updateData));
    console.log('SKU recebido:', sku);
    console.log('SKU no updateData:', updateData.sku);
    console.log('EAN recebido:', ean);
    console.log('EAN no updateData:', updateData.ean);
    console.log('Estoque recebido:', estoque);
    console.log('Estoque no updateData:', updateData.estoque);

    // Atualizar produto - NUNCA usar .single() após update
    console.log('Atualizando produto com dados:', JSON.stringify(updateData, null, 2));
    const { error: produtoError, data: updateResult } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (produtoError) {
      console.error('Erro ao atualizar produto:', produtoError);
      throw produtoError;
    }
    
    console.log('Produto atualizado com sucesso. Resultado:', updateResult);

    // Buscar produto atualizado separadamente (sem .single() para evitar erro)
    // Aguardar um pouco para garantir que o update foi commitado
    await new Promise(resolve => setTimeout(resolve, 50));
    
    let produtosBuscados;
    try {
      const produtoResult = await supabase
        .from('produtos')
        .select('*')
        .eq('id', req.params.id)
        .limit(1);

      if (produtoResult.error) {
        console.error('Erro ao buscar produto após atualização:', produtoResult.error);
        // Se o erro for de coerção, tentar buscar sem limit
        if (produtoResult.error.message && produtoResult.error.message.includes('coerce')) {
          console.warn('Tentando buscar produto sem limit devido a erro de coerção');
          const produtoResult2 = await supabase
            .from('produtos')
            .select('*')
            .eq('id', req.params.id);
          
          if (produtoResult2.error) {
            throw produtoResult2.error;
          }
          
          if (!produtoResult2.data || produtoResult2.data.length === 0) {
            throw new Error('Produto não encontrado após atualização');
          }
          
          produtosBuscados = produtoResult2.data;
        } else {
          throw produtoResult.error;
        }
      } else {
        produtosBuscados = produtoResult.data;
      }

      if (!produtosBuscados || produtosBuscados.length === 0) {
        throw new Error('Produto não encontrado após atualização');
      }
    } catch (buscaError) {
      console.error('Erro na busca do produto:', buscaError);
      throw buscaError;
    }

    // Processar novas imagens se houver - Upload para Supabase Storage
    const files = req.files || [];
    if (files.length > 0) {
      // Buscar imagens existentes para determinar a ordem
      const { data: imagensExistentes } = await supabase
        .from('produto_imagens')
        .select('ordem')
        .eq('produto_id', req.params.id)
        .order('ordem', { ascending: false })
        .limit(1);

      const ultimaOrdem = imagensExistentes && imagensExistentes.length > 0 
        ? imagensExistentes[0].ordem + 1 
        : 0;
      
      const imagensData = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Fazer upload para Supabase Storage
          const urlImagem = await uploadImageToSupabase(file, req.params.id);
          
          imagensData.push({
            produto_id: req.params.id,
            url_imagem: urlImagem,
            ordem: ultimaOrdem + i
          });
          
          console.log(`✅ Imagem ${i + 1} enviada para Supabase Storage: ${urlImagem}`);
        } catch (error) {
          console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, error);
          // Continuar com outras imagens mesmo se uma falhar
        }
      }

      if (imagensData.length > 0) {
        const { error: imagensError } = await supabase
          .from('produto_imagens')
          .insert(imagensData);

        if (imagensError) throw imagensError;
      }
    }

    // Usar o produto buscado
    const produtoData = produtosBuscados[0];
    
    // Debug: verificar se SKU está no produto buscado
    console.log('Produto buscado após atualização - SKU:', produtoData.sku);
    console.log('Produto completo:', JSON.stringify(produtoData, null, 2));

    // Buscar imagens do produto separadamente - com tratamento MUITO robusto
    let imagensData = [];
    try {
      // Buscar imagens com select explícito de campos
      const imagensResult = await supabase
        .from('produto_imagens')
        .select('id, produto_id, url_imagem, ordem, created_at')
        .eq('produto_id', req.params.id)
        .order('ordem', { ascending: true });

      // Verificar se há erro
      if (imagensResult.error) {
        console.error('Erro ao buscar imagens do Supabase:', imagensResult.error);
        imagensData = [];
      } 
      // Verificar se data existe e é array
      else if (imagensResult.data && Array.isArray(imagensResult.data)) {
        // Limpar cada imagem individualmente - garantir tipos primitivos
        imagensData = imagensResult.data.map(img => {
          try {
            return {
              id: img.id ? Number(img.id) : null,
              produto_id: img.produto_id ? Number(img.produto_id) : null,
              url_imagem: img.url_imagem ? String(img.url_imagem) : '',
              ordem: img.ordem !== undefined && img.ordem !== null ? Number(img.ordem) : 0,
              created_at: img.created_at ? String(img.created_at) : null
            };
          } catch (mapError) {
            console.warn('Erro ao mapear imagem:', mapError);
            return null;
          }
        }).filter(img => img !== null); // Remover nulls
      } else {
        console.warn('Resposta de imagens não é array:', typeof imagensResult.data);
        imagensData = [];
      }
    } catch (imgError) {
      console.error('Erro ao processar busca de imagens:', imgError);
      imagensData = [];
    }

    // Criar objeto de resposta SIMPLES e DIRETO - sem referências complexas
    const produtoResposta = {
      id: Number(produtoData.id),
      nome: String(produtoData.nome || ''),
      descricao: String(produtoData.descricao || ''),
      preco: Number(produtoData.preco || 0),
      categoria: String(produtoData.categoria || ''),
      marca: String(produtoData.marca || ''),
      sku: produtoData.sku ? String(produtoData.sku) : null,
      variacoes: Array.isArray(produtoData.variacoes) ? produtoData.variacoes : [],
      created_at: produtoData.created_at ? (produtoData.created_at instanceof Date ? produtoData.created_at.toISOString() : String(produtoData.created_at)) : null,
      updated_at: produtoData.updated_at ? (produtoData.updated_at instanceof Date ? produtoData.updated_at.toISOString() : String(produtoData.updated_at)) : null,
      produto_imagens: imagensData
    };

    // Resposta final - objeto simples
    const resposta = {
      success: true,
      produto: produtoResposta
    };

    console.log('Enviando resposta:', {
      success: true,
      produtoId: produtoResposta.id,
      totalImagens: produtoResposta.produto_imagens.length
    });

    // Enviar resposta diretamente - sem tentar serializar antes
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(resposta);
  } catch (error) {
    console.error('Erro completo na atualização do produto:', {
      message: error.message,
      stack: error.stack,
      produtoId: req.params.id
    });

    // Limpar arquivos em caso de erro
    const files = req.files || [];
    if (files.length > 0) {
      const fs = await import('fs/promises');
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (e) {
          console.error('Erro ao deletar arquivo:', e);
        }
      }
    }
    
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Deletar imagem específica
router.delete('/produtos/:id/imagens/:imagemId', async (req, res) => {
  try {
    const { imagemId, id } = req.params;
    
    console.log('=== DELETANDO IMAGEM ===');
    console.log('Produto ID:', id);
    console.log('Imagem ID:', imagemId);
    
    // Buscar a imagem para verificar se pertence ao produto correto
    const { data: imagens, error: fetchError } = await supabase
      .from('produto_imagens')
      .select('id, produto_id, url_imagem')
      .eq('id', imagemId)
      .eq('produto_id', id) // IMPORTANTE: Verificar se a imagem pertence ao produto
      .limit(1);

    if (fetchError) {
      console.error('Erro ao buscar imagem para deletar:', fetchError);
      throw fetchError;
    }

    const imagem = imagens && imagens.length > 0 ? imagens[0] : null;

    if (!imagem) {
      console.warn(`Imagem ${imagemId} não encontrada ou não pertence ao produto ${id}`);
      // Retornar sucesso mesmo se a imagem não existir (idempotência)
      return res.json({ success: true, message: 'Imagem já foi deletada ou não pertence a este produto' });
    }
    
    // Verificação adicional de segurança
    if (imagem.produto_id !== parseInt(id)) {
      console.error(`Tentativa de deletar imagem ${imagemId} do produto errado!`);
      console.error(`Imagem pertence ao produto ${imagem.produto_id}, mas foi solicitado deletar do produto ${id}`);
      return res.status(403).json({ error: 'Imagem não pertence a este produto' });
    }

    console.log('Imagem encontrada e validada:', imagem);

    // Deletar do banco - com verificação dupla de segurança
    const { data: deletedData, error: deleteError } = await supabase
      .from('produto_imagens')
      .delete()
      .eq('id', imagemId)
      .eq('produto_id', id) // Verificação dupla: só deleta se pertencer ao produto correto
      .select();

    if (deleteError) {
      console.error('Erro ao deletar imagem do banco:', deleteError);
      throw deleteError;
    }

    console.log('Imagem', imagemId, 'deletada com sucesso do banco');

    // Tentar deletar o arquivo físico (opcional)
    if (imagem && imagem.url_imagem) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filename = imagem.url_imagem.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads', 'produtos', filename);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Erro ao deletar arquivo físico:', fileError);
        // Não falhar se o arquivo não existir
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos os produtos (incluindo desabilitados) para admin
router.get('/produtos', async (req, res) => {
  try {
    const { page = 1, limit = 1000 } = req.query;
    const offset = (page - 1) * limit;

    // Buscar TODOS os produtos (incluindo desabilitados)
    let query = supabase
      .from('produtos')
      .select('*')
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: produtosData, error: produtosError } = await query;

    if (produtosError) throw produtosError;

    // Buscar imagens para cada produto
    const produtosComImagens = await Promise.all(
      (produtosData || []).map(async (produto) => {
        try {
          const { data: imagensData, error: imagensError } = await supabase
            .from('produto_imagens')
            .select('*')
            .eq('produto_id', produto.id)
            .order('ordem', { ascending: true });

          if (imagensError) {
            console.warn(`Erro ao buscar imagens do produto ${produto.id}:`, imagensError);
          }

          const imagensArray = Array.isArray(imagensData) ? imagensData : [];
          
          // Função helper para garantir URL correta
          // URLs do Supabase Storage já vêm corretas, não precisam correção
          const fixImageUrl = (url) => {
            if (!url) return url;
            
            // Se é URL do Supabase Storage, retornar como está
            if (url.includes('supabase.co') || url.includes('storage.googleapis.com')) {
              return url;
            }
            
            // Para URLs antigas (uploads locais), corrigir se necessário
            const correctBaseUrl = process.env.API_URL || 
                                 (process.env.NODE_ENV === 'production' 
                                   ? 'https://api.slothempresas.com.br' 
                                   : `http://localhost:${process.env.PORT || 3000}`);
            
            // Extrair o caminho da URL (ex: /uploads/produtos/filename.jpg)
            const pathMatch = url.match(/\/uploads\/.*$/);
            if (!pathMatch) return url; // Se não tem /uploads, retornar como está
            
            const path = pathMatch[0];
            
            // Se a URL já está correta, retornar como está
            if (url.startsWith(correctBaseUrl)) {
              return url;
            }
            
            // Se contém localhost OU não começa com https://api.slothempresas.com.br, CORRIGIR
            if (url.includes('localhost') || !url.startsWith('https://api.slothempresas.com.br')) {
              return `${correctBaseUrl}${path}`;
            }
            
            return url;
          };
          
          return {
            ...produto,
            produto_imagens: imagensArray.map(img => ({
              id: img.id,
              produto_id: img.produto_id,
              url_imagem: fixImageUrl(img.url_imagem), // Corrigir URL se necessário
              ordem: img.ordem || 0,
              created_at: img.created_at
            }))
          };
        } catch (err) {
          console.error(`Erro ao processar imagens do produto ${produto.id}:`, err);
          return {
            ...produto,
            produto_imagens: []
          };
        }
      })
    );

    // Buscar total de produtos
    const { count: total } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true });

    res.json({
      produtos: produtosComImagens || [],
      paginacao: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔒 CÓDIGO PROTEGIDO - NUNCA REMOVER
// Esta rota é crítica para desativar/ativar produtos
// Ver: INVENTARIO_CODIGO_PROTEGIDO.md
// Toggle ativo/inativo do produto
router.put('/produtos/:id/toggle-ativo', async (req, res) => {
  try {
    const { ativo } = req.body;
    const produtoId = req.params.id;

    if (ativo === undefined || ativo === null) {
      return res.status(400).json({ error: 'Campo ativo é obrigatório' });
    }

    const { data, error } = await supabase
      .from('produtos')
      .update({ ativo: ativo === true || ativo === 'true' })
      .eq('id', produtoId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, produto: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/produtos/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PEDIDOS (Gestor) ==========
router.get('/pedidos', async (req, res) => {
  try {
    const { empresa_id, status, data_inicio, data_fim, funcionario_nome } = req.query;

    let query = supabase
      .from('pedidos')
      .select(`
        *,
        funcionarios (
          nome_completo,
          cadastro_empresa,
          cadastro_clube,
          empresa_id,
          empresas (id, nome, cadastro_empresa),
          clubes (id, nome, cadastro_clube)
        ),
        pedido_itens (
          *,
          produtos (*)
        )
      `)
      .order('created_at', { ascending: false });

    // Não filtrar por empresa_id na query (Supabase pode não suportar filtro em relação aninhada)
    // Vamos filtrar depois de buscar os dados
    if (status) {
      query = query.eq('status', status);
    }
    if (data_inicio) {
      query = query.gte('created_at', data_inicio);
    }
    if (data_fim) {
      query = query.lte('created_at', data_fim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }

    // Debug: verificar estrutura dos dados retornados
    if (data && data.length > 0) {
      console.log('DEBUG PEDIDOS - Total de pedidos retornados:', data.length);
      console.log('DEBUG PEDIDOS - Primeiro pedido ID:', data[0].id);
      console.log('DEBUG PEDIDOS - Funcionarios do primeiro pedido:', JSON.stringify(data[0].funcionarios, null, 2));
      console.log('DEBUG PEDIDOS - Tipo de funcionarios:', Array.isArray(data[0].funcionarios) ? 'array' : typeof data[0].funcionarios);
    } else {
      console.log('DEBUG PEDIDOS - Nenhum pedido retornado');
    }

    // Filtrar por empresa_id se fornecido (após buscar os dados)
    let pedidos = data || [];
    if (empresa_id) {
      pedidos = pedidos.filter(p => {
        // Normalizar funcionarios (pode vir como array ou objeto)
        const funcionario = Array.isArray(p.funcionarios) ? p.funcionarios[0] : p.funcionarios;
        if (!funcionario) return false;
        
        // Normalizar empresas (pode vir como array ou objeto)
        const empresa = Array.isArray(funcionario.empresas) ? funcionario.empresas[0] : funcionario.empresas;
        const empresaId = empresa?.id || funcionario?.empresa_id;
        
        return empresaId === parseInt(empresa_id, 10);
      });
      console.log(`DEBUG PEDIDOS - Após filtrar por empresa_id ${empresa_id}: ${pedidos.length} pedidos`);
    }
    
    // Filtrar por nome do funcionário se fornecido
    if (funcionario_nome) {
      pedidos = pedidos.filter(p => {
        const funcionario = Array.isArray(p.funcionarios) ? p.funcionarios[0] : p.funcionarios;
        return funcionario?.nome_completo?.toLowerCase().includes(funcionario_nome.toLowerCase());
      });
    }


    // Debug: verificar se SKU está sendo retornado
    if (pedidos.length > 0 && pedidos[0].pedido_itens && pedidos[0].pedido_itens.length > 0) {
      const primeiroItem = pedidos[0].pedido_itens[0];
      console.log('DEBUG SKU - Produto completo:', JSON.stringify(primeiroItem.produtos, null, 2));
      console.log('DEBUG SKU - SKU do produto:', primeiroItem.produtos?.sku);
    }

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprovar pedido (Gestor) - aprova TODOS os itens do pedido para "aguardando aprovação de estoque"
router.put('/pedidos/:id/aprovar', async (req, res) => {
  try {
    // Buscar todos os itens do pedido
    const { data: itens, error: errorBuscar } = await supabase
      .from('pedido_itens')
      .select('id, status')
      .eq('pedido_id', req.params.id);

    if (errorBuscar) throw errorBuscar;
    if (!itens || itens.length === 0) {
      return res.status(404).json({ error: 'Nenhum item encontrado no pedido' });
    }

    // Atualizar TODOS os itens pendentes para "aguardando aprovação de estoque"
    // Atualizar apenas itens que estão pendentes ou null (não atualizar itens já aprovados/rejeitados)
    const { error: updateError } = await supabase
      .from('pedido_itens')
      .update({ status: 'aguardando aprovação de estoque' })
      .eq('pedido_id', req.params.id)
      .in('status', ['pendente', null]);
    
    // Verificar se algum item foi atualizado
    if (updateError) {
      console.error('Erro ao atualizar itens:', updateError);
      throw updateError;
    }
    
    // Verificar quantos itens foram atualizados
    const itensPendentes = itens.filter(item => !item.status || item.status === 'pendente');
    console.log('Itens pendentes encontrados:', itensPendentes.length);
    console.log('Total de itens no pedido:', itens.length);
    
    if (itensPendentes.length === 0) {
      return res.status(400).json({ error: 'Nenhum item pendente encontrado para aprovar' });
    }

    // NÃO atualizar status do pedido - status fica apenas nos itens

    // Aguardar um pouco para garantir que o update foi commitado
    await new Promise(resolve => setTimeout(resolve, 50));

    // Buscar pedido atualizado com itens
    const { data: pedidoAtualizado, error: fetchError } = await supabase
      .from('pedidos')
      .select('*, pedido_itens(*)')
      .eq('id', req.params.id)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!pedidoAtualizado || pedidoAtualizado.length === 0) {
      throw new Error('Pedido não encontrado após atualização');
    }

    res.json({ success: true, pedido: pedidoAtualizado[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprovar pedido (Admin) - aprova itens "aguardando aprovação de estoque" para "Produto autorizado"
router.put('/pedidos/:id/aprovar-admin', async (req, res) => {
  try {
    // Buscar itens que estão "aguardando aprovação de estoque"
    const { data: itens, error: errorBuscar } = await supabase
      .from('pedido_itens')
      .select('id, status, produto_id, quantidade')
      .eq('pedido_id', req.params.id)
      .eq('status', 'aguardando aprovação de estoque');

    if (errorBuscar) throw errorBuscar;
    if (!itens || itens.length === 0) {
      return res.status(404).json({ error: 'Nenhum item aguardando aprovação encontrado' });
    }

    // Atualizar itens para "Produto autorizado"
    const { error: updateError } = await supabase
      .from('pedido_itens')
      .update({ status: 'Produto autorizado' })
      .eq('pedido_id', req.params.id)
      .eq('status', 'aguardando aprovação de estoque');

    if (updateError) throw updateError;

    // NÃO mudar status do pedido - status fica apenas nos itens

    // Aguardar um pouco para garantir que o update foi commitado
    await new Promise(resolve => setTimeout(resolve, 50));

    // Reduzir estoque dos produtos aprovados
    for (const item of itens) {
      if (item.produto_id) {
        const { data: produto, error: errorProduto } = await supabase
          .from('produtos')
          .select('estoque, ativo')
          .eq('id', item.produto_id)
          .single();

        if (!errorProduto && produto) {
          const novoEstoque = Math.max(0, (produto.estoque || 0) - (item.quantidade || 0));
          const novoAtivo = novoEstoque > 0;

          await supabase
            .from('produtos')
            .update({ 
              estoque: novoEstoque,
              ativo: novoAtivo
            })
            .eq('id', item.produto_id);
        }
      }
    }

    // Buscar pedido atualizado com itens para verificar se todos foram autorizados
    const { data: pedidoAtualizado, error: fetchError } = await supabase
      .from('pedidos')
      .select('*, pedido_itens(*)')
      .eq('id', req.params.id)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!pedidoAtualizado || pedidoAtualizado.length === 0) {
      throw new Error('Pedido não encontrado após atualização');
    }

    res.json({ success: true, pedido: pedidoAtualizado[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rejeitar pedido
router.put('/pedidos/:id/rejeitar', async (req, res) => {
  try {
    // Buscar o pedido atual para verificar o status
    const { data: pedidoAtual, error: errorBuscar } = await supabase
      .from('pedidos')
      .select('status')
      .eq('id', req.params.id)
      .single();

    if (errorBuscar) throw errorBuscar;

    // Determinar o novo status baseado no status atual
    let novoStatus;
    if (pedidoAtual.status === 'verificando estoque') {
      novoStatus = 'produto sem estoque';
    } else {
      // Se for pendente ou outro status, usar rejeitado (comportamento padrão)
      novoStatus = 'rejeitado';
    }

    // Atualizar pedido - NUNCA usar .single() após update
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    // Aguardar um pouco para garantir que o update foi commitado
    await new Promise(resolve => setTimeout(resolve, 50));

    // Buscar pedido atualizado separadamente
    const { data: pedidoAtualizado, error: fetchError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!pedidoAtualizado || pedidoAtualizado.length === 0) {
      throw new Error('Pedido não encontrado após atualização');
    }

    res.json({ success: true, pedido: pedidoAtualizado[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprovar item do pedido
router.put('/pedidos/:pedidoId/itens/:itemId/aprovar', async (req, res) => {
  try {
    const { pedidoId, itemId } = req.params;
    
    // Buscar o item atual com TODAS as informações necessárias
    const { data: itemAtual, error: errorBuscar } = await supabase
      .from('pedido_itens')
      .select('*')
      .eq('id', itemId)
      .eq('pedido_id', pedidoId)
      .single();

    if (errorBuscar) throw errorBuscar;
    if (!itemAtual) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const quantidadeAtual = itemAtual.quantidade || 1;
    const statusAtual = itemAtual.status || 'pendente';

    // Determinar o novo status baseado no status atual
    let novoStatus;
    if (statusAtual === 'pendente' || !statusAtual) {
      novoStatus = 'aguardando aprovação de estoque';
    } else if (statusAtual === 'aguardando aprovação de estoque') {
      novoStatus = 'Produto autorizado';
    } else {
      novoStatus = 'Produto autorizado';
    }

    // Se o item tem quantidade > 1, dividir em dois itens: um aprovado e outro(s) pendente(s)
    if (quantidadeAtual > 1) {
      // 1. Atualizar o item atual para quantidade 1 com o novo status
      const { error: updateError } = await supabase
        .from('pedido_itens')
        .update({ 
          quantidade: 1,
          status: novoStatus
        })
        .eq('id', itemId)
        .eq('pedido_id', pedidoId);

      if (updateError) throw updateError;

      // 2. Criar novo(s) item(s) pendente(s) com o restante da quantidade
      const quantidadeRestante = quantidadeAtual - 1;
      if (quantidadeRestante > 0) {
        const novoItem = {
          pedido_id: pedidoId,
          produto_id: itemAtual.produto_id,
          quantidade: quantidadeRestante,
          variacao: itemAtual.variacao || null,
          preco: itemAtual.preco,
          status: statusAtual === 'aguardando aprovação de estoque' ? 'aguardando aprovação de estoque' : 'pendente'
        };

        const { error: insertError } = await supabase
          .from('pedido_itens')
          .insert(novoItem);

        if (insertError) throw insertError;
      }

      // 3. Reduzir estoque apenas da quantidade aprovada (1 unidade)
      if (novoStatus === 'Produto autorizado' && itemAtual.produto_id) {
        const { data: produto, error: errorProduto } = await supabase
          .from('produtos')
          .select('estoque, ativo')
          .eq('id', itemAtual.produto_id)
          .single();

        if (!errorProduto && produto) {
          const novoEstoque = Math.max(0, (produto.estoque || 0) - 1); // Reduzir apenas 1 unidade
          const novoAtivo = novoEstoque > 0;

          await supabase
            .from('produtos')
            .update({ 
              estoque: novoEstoque,
              ativo: novoAtivo
            })
            .eq('id', itemAtual.produto_id);
        }
      }

      // 4. Buscar o item atualizado
      const { data: itemAtualizado, error: fetchError } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('id', itemId)
        .eq('pedido_id', pedidoId)
        .limit(1);

      if (fetchError) throw fetchError;
      if (!itemAtualizado || itemAtualizado.length === 0) {
        throw new Error('Item não encontrado após atualização');
      }

      res.json({ success: true, item: itemAtualizado[0], dividido: true });
    } else {
      // Se quantidade = 1, apenas atualizar o status normalmente
      const { error: updateError } = await supabase
        .from('pedido_itens')
        .update({ status: novoStatus })
        .eq('id', itemId)
        .eq('pedido_id', pedidoId);

      if (updateError) throw updateError;

      // Aguardar um pouco para garantir que o update foi commitado
      await new Promise(resolve => setTimeout(resolve, 50));

      // Buscar item atualizado separadamente
      const { data: itemAtualizado, error: fetchError } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('id', itemId)
        .eq('pedido_id', pedidoId)
        .limit(1);

      if (fetchError) throw fetchError;
      if (!itemAtualizado || itemAtualizado.length === 0) {
        throw new Error('Item não encontrado após atualização');
      }

      // 🔒 CÓDIGO PROTEGIDO - NUNCA REMOVER
      // Lógica de redução de estoque ao aprovar item - Ver: INVENTARIO_CODIGO_PROTEGIDO.md
      // Se o status mudou para 'Produto autorizado', reduzir estoque do produto
      if (novoStatus === 'Produto autorizado' && itemAtual.produto_id) {
        // Buscar produto atual
        const { data: produto, error: errorProduto } = await supabase
          .from('produtos')
          .select('estoque, ativo')
          .eq('id', itemAtual.produto_id)
          .single();

        if (!errorProduto && produto) {
          const novoEstoque = Math.max(0, (produto.estoque || 0) - 1);
          const novoAtivo = novoEstoque > 0;

          // Atualizar estoque e status ativo do produto
          await supabase
            .from('produtos')
            .update({ 
              estoque: novoEstoque,
              ativo: novoAtivo
            })
            .eq('id', itemAtual.produto_id);
        }

        // NÃO mudar status do pedido - status fica apenas nos itens
      }

      res.json({ success: true, item: itemAtualizado[0] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rejeitar item do pedido
router.put('/pedidos/:pedidoId/itens/:itemId/rejeitar', async (req, res) => {
  try {
    const { pedidoId, itemId } = req.params;
    
    // Buscar o item atual para verificar o status
    const { data: itemAtual, error: errorBuscar } = await supabase
      .from('pedido_itens')
      .select('status')
      .eq('id', itemId)
      .eq('pedido_id', pedidoId)
      .single();

    if (errorBuscar) throw errorBuscar;
    if (!itemAtual) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Determinar o novo status baseado no status atual
    let novoStatus;
    if (itemAtual.status === 'verificando estoque') {
      novoStatus = 'produto sem estoque';
    } else {
      novoStatus = 'rejeitado';
    }

    // Atualizar status do item - NUNCA usar .single() após update
    const { error: updateError } = await supabase
      .from('pedido_itens')
      .update({ status: novoStatus })
      .eq('id', itemId)
      .eq('pedido_id', pedidoId);

    if (updateError) throw updateError;

    // Aguardar um pouco para garantir que o update foi commitado
    await new Promise(resolve => setTimeout(resolve, 50));

    // Buscar item atualizado separadamente
    const { data: itemAtualizado, error: fetchError } = await supabase
      .from('pedido_itens')
      .select('*')
      .eq('id', itemId)
      .eq('pedido_id', pedidoId)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!itemAtualizado || itemAtualizado.length === 0) {
      throw new Error('Item não encontrado após atualização');
    }

    res.json({ success: true, item: itemAtualizado[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MARKETING ==========
// Salvar link do YouTube
router.post('/marketing/youtube', async (req, res) => {
  try {
    console.log('🔍 POST /admin/marketing/youtube - Body recebido:', req.body);
    const { youtube_link } = req.body;
    
    if (!youtube_link || (typeof youtube_link === 'string' && youtube_link.trim() === '')) {
      return res.status(400).json({ error: 'Link do YouTube é obrigatório' });
    }
    
    // USAR APENAS SUPABASE CLIENT - SEM FALLBACK SQL DIRETO
    // O SQL direto está causando ENETUNREACH no Render
    console.log('   Usando APENAS Supabase Client (sem fallback SQL)...');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ NÃO configurada');
    console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ NÃO configurada');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
      return res.status(500).json({ 
        error: 'Configuração do servidor incompleta. Contate o administrador.' 
      });
    }
    
    // Verificar se já existe
    const { data: existingData, error: checkError } = await supabase
      .from('configuracoes')
      .select('id')
      .eq('chave', 'youtube_link')
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, é OK
      console.error('❌ Erro ao verificar configuração:', checkError);
      return res.status(500).json({ 
        error: `Erro ao verificar configuração: ${checkError.message}` 
      });
    }
    
    let result;
    if (existingData) {
      // Atualizar se já existe
      console.log('   🔄 Atualizando configuração existente...');
      result = await supabase
        .from('configuracoes')
        .update({ valor: youtube_link.trim(), updated_at: new Date().toISOString() })
        .eq('chave', 'youtube_link')
        .select();
    } else {
      // Inserir se não existe
      console.log('   ➕ Criando nova configuração...');
      result = await supabase
        .from('configuracoes')
        .insert({ chave: 'youtube_link', valor: youtube_link.trim() })
        .select();
    }
    
    const { data, error } = result;
    
    if (error) {
      console.error('❌ Erro ao salvar com Supabase Client:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      console.error('   Detalhes:', error.details);
      console.error('   Hint:', error.hint);
      return res.status(500).json({ 
        error: `Erro ao salvar: ${error.message}` 
      });
    }
    
    console.log('✅ Link salvo com sucesso via Supabase Client');
    return res.json({ success: true, message: 'Link do YouTube salvo com sucesso', data });
    
  } catch (error) {
    console.error('❌ Erro inesperado ao salvar link do YouTube:', error);
    console.error('   Tipo:', error.constructor.name);
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    return res.status(500).json({ 
      error: `Erro inesperado: ${error.message}` 
    });
  }
});

// Buscar link do YouTube
router.get('/marketing/youtube', async (req, res) => {
  try {
    // USAR APENAS SUPABASE CLIENT - SEM FALLBACK SQL DIRETO
    console.log('🔍 GET /admin/marketing/youtube - Buscando link...');
    
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'youtube_link')
      .maybeSingle();
    
    if (error) {
      // Se não encontrou (PGRST116), retornar vazio (não é erro)
      if (error.code === 'PGRST116') {
        console.log('   Link não encontrado, retornando vazio');
        return res.json({ youtube_link: '' });
      }
      
      console.error('❌ Erro ao buscar link:', error);
      // Em caso de erro real, retornar vazio para não quebrar a página
      return res.json({ youtube_link: '' });
    }
    
    const youtubeLink = data?.valor || '';
    console.log('✅ Link encontrado:', youtubeLink || '(vazio)');
    return res.json({ youtube_link: youtubeLink });
    
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar link do YouTube:', error);
    // Retornar vazio em caso de erro para não quebrar a página
    return res.json({ youtube_link: '' });
  }
});

// Excluir item do pedido
router.delete('/pedidos/:pedidoId/itens/:itemId', async (req, res) => {
  try {
    const { pedidoId, itemId } = req.params;
    
    // Verificar se o item existe
    const { data: itemAtual, error: errorBuscar } = await supabase
      .from('pedido_itens')
      .select('id, produto_id, quantidade, status')
      .eq('id', itemId)
      .eq('pedido_id', pedidoId)
      .single();

    if (errorBuscar) throw errorBuscar;
    if (!itemAtual) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Se o item estava autorizado, devolver o estoque
    if (itemAtual.status === 'Produto autorizado' && itemAtual.produto_id) {
      const { data: produto, error: errorProduto } = await supabase
        .from('produtos')
        .select('estoque, ativo')
        .eq('id', itemAtual.produto_id)
        .single();

      if (!errorProduto && produto) {
        const novoEstoque = (produto.estoque || 0) + (itemAtual.quantidade || 0);
        const novoAtivo = novoEstoque > 0;

        await supabase
          .from('produtos')
          .update({ 
            estoque: novoEstoque,
            ativo: novoAtivo
          })
          .eq('id', itemAtual.produto_id);
      }
    }

    // Excluir o item
    const { error: deleteError } = await supabase
      .from('pedido_itens')
      .delete()
      .eq('id', itemId)
      .eq('pedido_id', pedidoId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Item excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excluir pedido
router.delete('/pedidos/:id', async (req, res) => {
  try {
    // Primeiro, buscar os itens do pedido para verificar se há itens aprovados
    const { data: itensPedido, error: errorBuscarItens } = await supabase
      .from('pedido_itens')
      .select('id, produto_id, quantidade, status')
      .eq('pedido_id', req.params.id);

    if (errorBuscarItens) {
      console.error('Erro ao buscar itens do pedido:', errorBuscarItens);
      throw errorBuscarItens;
    }

    // Se houver itens aprovados, devolver o estoque
    if (itensPedido && itensPedido.length > 0) {
      const itensAprovados = itensPedido.filter(item => 
        item.status === 'Produto autorizado' || item.status === 'aprovado'
      );

      if (itensAprovados.length > 0) {
        // Agrupar por produto_id para somar as quantidades
        const produtosParaAtualizar = {};
        itensAprovados.forEach(item => {
          if (item.produto_id) {
            if (!produtosParaAtualizar[item.produto_id]) {
              produtosParaAtualizar[item.produto_id] = 0;
            }
            produtosParaAtualizar[item.produto_id] += item.quantidade || 0;
          }
        });

        // Atualizar estoque de cada produto
        for (const [produtoId, quantidadeDevolver] of Object.entries(produtosParaAtualizar)) {
          const { data: produto, error: errorProduto } = await supabase
            .from('produtos')
            .select('estoque, ativo')
            .eq('id', produtoId)
            .single();

          if (!errorProduto && produto) {
            const novoEstoque = (produto.estoque || 0) + quantidadeDevolver;
            const novoAtivo = novoEstoque > 0;

            await supabase
              .from('produtos')
              .update({ 
                estoque: novoEstoque,
                ativo: novoAtivo
              })
              .eq('id', produtoId);
          }
        }
      }
    }

    // Depois, excluir os itens do pedido (pedido_itens)
    const { error: deleteItensError } = await supabase
      .from('pedido_itens')
      .delete()
      .eq('pedido_id', req.params.id);

    if (deleteItensError) {
      console.error('Erro ao excluir itens do pedido:', deleteItensError);
      throw deleteItensError;
    }

    // Por fim, excluir o pedido
    const { error: deleteError } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;
    res.json({ success: true, message: 'Pedido excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir pedido' });
  }
});

// ========== CADASTROS (Categorias, Marcas, Tamanhos) ==========

// Categorias
router.get('/cadastros/categorias', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cadastros/categorias', async (req, res) => {
  try {
    const { nome } = req.body;
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, categoria: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cadastros/categorias/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcas
router.get('/cadastros/marcas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cadastros/marcas', async (req, res) => {
  try {
    const { nome } = req.body;
    const { data, error } = await supabase
      .from('marcas')
      .insert({ nome })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, marca: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cadastros/marcas/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('marcas')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tamanhos
router.get('/cadastros/tamanhos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tamanhos')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cadastros/tamanhos', async (req, res) => {
  try {
    const { nome } = req.body;
    const { data, error } = await supabase
      .from('tamanhos')
      .insert({ nome })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, tamanho: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cadastros/tamanhos/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tamanhos')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SKUs
router.get('/cadastros/skus', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sku')
      .select('*')
      .order('codigo');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MARKETING ==========
// Upload de banner (mobile ou desktop)
router.post('/marketing/banner', uploadBanner.single('banner'), async (req, res) => {
  try {
    console.log('🔍 Upload recebido:', {
      hasFile: !!req.file,
      body: req.body,
      fileInfo: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { tipo } = req.body;
    
    if (!tipo || (tipo !== 'mobile' && tipo !== 'desktop')) {
      return res.status(400).json({ error: 'Tipo de banner inválido. Use "mobile" ou "desktop"' });
    }

    // Verificar se o arquivo foi salvo corretamente
    const filePath = req.file.path;
    const bannersPath = path.join(__dirname, '../../client/public/banners/');
    const expectedFilename = tipo === 'mobile' ? 'banner_mobile.jpeg' : 'banner_site.jpeg';
    const expectedPath = path.join(bannersPath, expectedFilename);
    
    console.log('🔍 Verificando arquivo:', {
      filePath: req.file.path,
      expectedPath,
      filename: req.file.filename,
      tipo
    });
    
    // Aguardar um pouco para garantir que o arquivo foi escrito
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verificar tanto no caminho do multer quanto no caminho esperado
    const pathsToCheck = [filePath, expectedPath];
    let fileFound = false;
    let actualPath = null;
    
    for (const checkPath of pathsToCheck) {
      if (fs.existsSync(checkPath)) {
        const stats = fs.statSync(checkPath);
        console.log('✅ Arquivo encontrado em:', {
          path: checkPath,
          size: stats.size,
          modified: stats.mtime
        });
        
        if (stats.size > 0) {
          fileFound = true;
          actualPath = checkPath;
          break;
        }
      }
    }
    
    if (!fileFound) {
      console.error('❌ Arquivo não encontrado após upload em nenhum dos caminhos:', pathsToCheck);
      return res.status(500).json({ error: 'Arquivo não foi salvo corretamente' });
    }
    
    // Se o arquivo foi salvo em um caminho diferente do esperado, mover para o lugar correto
    if (actualPath !== expectedPath && fs.existsSync(actualPath)) {
      try {
        // Garantir que o diretório de destino existe
        if (!fs.existsSync(bannersPath)) {
          fs.mkdirSync(bannersPath, { recursive: true });
        }
        // Copiar o arquivo para o local correto
        fs.copyFileSync(actualPath, expectedPath);
        console.log('📋 Arquivo copiado para:', expectedPath);
      } catch (err) {
        console.error('⚠️ Erro ao copiar arquivo:', err);
      }
    }

    res.json({ 
      success: true, 
      message: `Banner ${tipo} atualizado com sucesso`,
      filename: req.file.filename,
      path: `/banners/${req.file.filename}`,
      timestamp: Date.now(),
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upload do banner:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

export default router;

