import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { supabase } from '../index.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Configurar multer para múltiplas imagens (até 5)
const uploadImages = multer({
  dest: 'uploads/produtos/',
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
    
    // Gerar cadastro_empresa único se não foi fornecido ou está vazio
    let cadastroEmpresaFinal = cadastro_empresa;
    if (!cadastroEmpresaFinal || cadastroEmpresaFinal.trim() === '') {
      // Gerar um cadastro único baseado no nome da empresa e timestamp
      const timestamp = Date.now();
      const nomeNormalizado = nome.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
      cadastroEmpresaFinal = `${nomeNormalizado}${timestamp.toString().slice(-6)}`;
      
      // Verificar se o cadastro gerado já existe (improvável, mas verificar)
      const { data: cadastroExistente } = await supabase
        .from('empresas')
        .select('id')
        .eq('cadastro_empresa', cadastroEmpresaFinal)
        .limit(1);
      
      if (cadastroExistente && cadastroExistente.length > 0) {
        // Se por acaso existir, adicionar mais números
        cadastroEmpresaFinal = `${nomeNormalizado}${timestamp}`;
      }
    }
    
    // Inserir empresa
    const { data: empresasInseridas, error: insertError } = await supabase
      .from('empresas')
      .insert({ nome, cadastro_empresa: cadastroEmpresaFinal.trim() })
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
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log('Total de linhas no Excel:', data.length);

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'O arquivo Excel está vazio ou não contém dados válidos' });
    }

    // Processar e validar dados
    const funcionarios = [];
    const erros = [];

    // Função auxiliar para buscar valor ignorando maiúsculas/minúsculas e espaços
    const buscarValor = (obj, possiveisChaves) => {
      const chavesObj = Object.keys(obj || {});
      for (const chavePossivel of possiveisChaves) {
        // Buscar exata
        if (obj[chavePossivel] !== undefined && obj[chavePossivel] !== null) {
          return obj[chavePossivel];
        }
        // Buscar ignorando case e espaços
        const chaveEncontrada = chavesObj.find((k) => {
          const regex = /\s+/g;
          const kNormalized = k.toLowerCase().replace(regex, '');
          const chaveNormalized = chavePossivel.toLowerCase().replace(regex, '');
          return kNormalized === chaveNormalized;
        });
        if (chaveEncontrada && obj[chaveEncontrada] !== undefined && obj[chaveEncontrada] !== null) {
          return obj[chaveEncontrada];
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

    data.forEach(function(row, index) {
      // Suportar múltiplas variações de nomes de colunas (incluindo nome_empregado da planilha)
      const possiveisNomes = [
        'nome_empregado', 'Nome Empregado', 'NOME EMPREGADO', 'nome empregado', 'Nome empregado',
        'nome_completo', 'Nome Completo', 'NOME COMPLETO', 'nome completo', 'Nome completo'
      ];
      const nomeCompleto = buscarValor(row, possiveisNomes);
      const possiveisCadastrosEmpresa = [
        'cadastro_empresa', 'Cadastro Empresa', 'CADASTRO EMPRESA', 'cadastro empresa', 'Cadastro empresa'
      ];
      const cadastroEmpresa = buscarValor(row, possiveisCadastrosEmpresa);
      
      const possiveisCadastrosClube = [
        'cadastro_clube', 'Cadastro Clube', 'CADASTRO CLUBE', 'cadastro clube', 'Cadastro clube'
      ];
      const cadastroClube = buscarValor(row, possiveisCadastrosClube);

      // Validar e converter para string, removendo espaços
      const nomeCompletoStr = nomeCompleto ? String(nomeCompleto).trim() : null;
      const cadastroEmpresaStr = cadastroEmpresa ? String(cadastroEmpresa).trim() : null;
      const cadastroClubeStr = cadastroClube ? String(cadastroClube).trim() : null;

      // Validação rigorosa - não permitir null, undefined, ou strings vazias
      if (!nomeCompletoStr || nomeCompletoStr === '' || nomeCompletoStr === 'null' || nomeCompletoStr === 'undefined') {
        const chavesEncontradas = Object.keys(row).join(', ');
        const linhaNum = index + 2;
        erros.push('Linha ' + linhaNum + ': Nome Empregado é obrigatório e não pode estar vazio. Chaves encontradas: ' + chavesEncontradas);
        console.error('Linha ' + linhaNum + ' - Nome não encontrado. Chaves disponíveis:', Object.keys(row));
        console.error('Linha ' + linhaNum + ' - Valores da linha:', row);
        return;
      }

      if (!cadastroEmpresaStr || cadastroEmpresaStr === '' || cadastroEmpresaStr === 'null' || cadastroEmpresaStr === 'undefined') {
        const linhaNum2 = index + 2;
        erros.push('Linha ' + linhaNum2 + ': Cadastro Empresa é obrigatório e não pode estar vazio');
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
      // Buscar funcionários deste upload (mesma empresa e mesma data aproximada)
      // Como não temos um upload_id na tabela funcionarios, vamos buscar por empresa_id
      // e data próxima (dentro de 1 hora do upload)
      const dataUpload = new Date(upload.created_at);
      const dataInicio = new Date(dataUpload.getTime() - 60 * 60 * 1000); // 1 hora antes
      const dataFim = new Date(dataUpload.getTime() + 60 * 60 * 1000); // 1 hora depois

      const { data: funcionarios, error: funcError } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, cadastro_empresa, cadastro_clube')
        .eq('empresa_id', upload.empresa_id)
        .gte('created_at', dataInicio.toISOString())
        .lte('created_at', dataFim.toISOString())
        .limit(100); // Limitar a 100 para não sobrecarregar

      // Se não encontrar funcionários pela data, buscar todos da empresa (fallback)
      let funcionariosList = funcionarios || [];
      if (funcionariosList.length === 0) {
        const { data: funcionariosFallback } = await supabase
          .from('funcionarios')
          .select('id, nome_completo, cadastro_empresa, cadastro_clube')
          .eq('empresa_id', upload.empresa_id)
          .limit(100);
        funcionariosList = funcionariosFallback || [];
      }

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

    // Processar imagens se houver
    const files = req.files || [];
    if (files.length > 0) {
      const imagensData = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Criar URL da imagem (por enquanto local, depois pode migrar para Supabase Storage)
        const urlImagem = `http://localhost:3000/uploads/produtos/${file.filename}`;
        
        imagensData.push({
          produto_id: produto.id,
          url_imagem: urlImagem,
          ordem: i
        });
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
    const { data: imagensData, error: imagensFetchError } = await supabase
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
      produto_imagens: imagensData || []
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

    // Processar novas imagens se houver
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
        const urlImagem = `http://localhost:3000/uploads/produtos/${file.filename}`;
        
        imagensData.push({
          produto_id: req.params.id,
          url_imagem: urlImagem,
          ordem: ultimaOrdem + i
        });
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
          clubes (nome)
        ),
        pedido_itens (
          *,
          produtos (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (empresa_id) {
      query = query.eq('funcionarios.empresa_id', empresa_id);
    }
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

    if (error) throw error;

    // Filtrar por nome do funcionário se fornecido
    let pedidos = data || [];
    if (funcionario_nome) {
      pedidos = pedidos.filter(p => 
        p.funcionarios?.nome_completo?.toLowerCase().includes(funcionario_nome.toLowerCase())
      );
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

// Aprovar pedido
router.put('/pedidos/:id/aprovar', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status: 'aprovado' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, pedido: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rejeitar pedido
router.put('/pedidos/:id/rejeitar', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status: 'rejeitado' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, pedido: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excluir pedido
router.delete('/pedidos/:id', async (req, res) => {
  try {
    // Primeiro, excluir os itens do pedido (pedido_itens)
    const { error: deleteItensError } = await supabase
      .from('pedido_itens')
      .delete()
      .eq('pedido_id', req.params.id);

    if (deleteItensError) {
      console.error('Erro ao excluir itens do pedido:', deleteItensError);
      throw deleteItensError;
    }

    // Depois, excluir o pedido
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

export default router;

