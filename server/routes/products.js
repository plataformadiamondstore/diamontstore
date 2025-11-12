import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Listar produtos com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, categoria, marca, nome } = req.query;
    const offset = (page - 1) * limit;

    // Buscar produtos sem imagens primeiro (mais confiável)
    // Filtrar apenas produtos ativos e com estoque > 0 (para funcionários)
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .gt('estoque', 0)
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (marca) {
      query = query.eq('marca', marca);
    }
    if (nome) {
      query = query.ilike('nome', `%${nome}%`);
    }

    const { data: produtosData, error: produtosError } = await query;

    if (produtosError) throw produtosError;

    // Buscar imagens para cada produto separadamente (GARANTIDO FUNCIONAR)
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
          
          // Função helper para corrigir URLs antigas (localhost) para URLs de produção
          const fixImageUrl = (url) => {
            if (!url) return url;
            // Se a URL contém localhost, substituir pela URL correta da API
            if (url.includes('localhost:3000') || url.includes('localhost')) {
              const baseUrl = process.env.API_URL || 
                             (process.env.NODE_ENV === 'production' 
                               ? 'https://api.slothempresas.com.br' 
                               : `http://localhost:${process.env.PORT || 3000}`);
              // Extrair o caminho da URL antiga (ex: /uploads/produtos/filename.jpg)
              const pathMatch = url.match(/\/uploads\/.*$/);
              if (pathMatch) {
                return `${baseUrl}${pathMatch[0]}`;
              }
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

    // Buscar total de produtos para paginação
    // Filtrar apenas produtos ativos e com estoque > 0 (para funcionários)
    let countQuery = supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .gt('estoque', 0);
    if (categoria) countQuery = countQuery.eq('categoria', categoria);
    if (marca) countQuery = countQuery.eq('marca', marca);
    if (nome) countQuery = countQuery.ilike('nome', `%${nome}%`);

    const { count: total } = await countQuery;

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

// Buscar categorias
router.get('/categorias', async (req, res) => {
  try {
    // Filtrar apenas produtos ativos e com estoque > 0 (para funcionários)
    const { data, error } = await supabase
      .from('produtos')
      .select('categoria')
      .eq('ativo', true)
      .gt('estoque', 0)
      .order('categoria');

    if (error) throw error;

    const categorias = [...new Set(data.map(p => p.categoria))].filter(Boolean);
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar marcas
router.get('/marcas', async (req, res) => {
  try {
    // Filtrar apenas produtos ativos e com estoque > 0 (para funcionários)
    const { data, error } = await supabase
      .from('produtos')
      .select('marca')
      .eq('ativo', true)
      .gt('estoque', 0)
      .order('marca');

    if (error) throw error;

    const marcas = [...new Set(data.map(p => p.marca))].filter(Boolean);
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    // Buscar produto e imagens separadamente para evitar erro de coerção
    const { data: produtoData, error: produtoError } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);

    if (produtoError) throw produtoError;
    if (!produtoData || produtoData.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Buscar imagens separadamente
    const { data: imagensData, error: imagensError } = await supabase
      .from('produto_imagens')
      .select('*')
      .eq('produto_id', req.params.id)
      .order('ordem', { ascending: true });

    if (imagensError) {
      console.warn('Erro ao buscar imagens:', imagensError);
    }

    // Função helper para corrigir URLs antigas (localhost) para URLs de produção
    const fixImageUrl = (url) => {
      if (!url) return url;
      // Se a URL contém localhost, substituir pela URL correta da API
      if (url.includes('localhost:3000') || url.includes('localhost')) {
        const baseUrl = process.env.API_URL || 
                       (process.env.NODE_ENV === 'production' 
                         ? 'https://api.slothempresas.com.br' 
                         : `http://localhost:${process.env.PORT || 3000}`);
        // Extrair o caminho da URL antiga (ex: /uploads/produtos/filename.jpg)
        const pathMatch = url.match(/\/uploads\/.*$/);
        if (pathMatch) {
          return `${baseUrl}${pathMatch[0]}`;
        }
      }
      return url;
    };
    
    // Combinar produto com imagens e corrigir URLs
    const produtoCompleto = {
      ...produtoData[0],
      produto_imagens: (imagensData || []).map(img => ({
        ...img,
        url_imagem: fixImageUrl(img.url_imagem) // Corrigir URL se necessário
      }))
    };

    res.json(produtoCompleto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

