import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Adicionar item ao carrinho
router.post('/add', async (req, res) => {
  try {
    const { funcionario_id, produto_id, quantidade, variacao } = req.body;

    // Verificar se já existe no carrinho
    const { data: existing } = await supabase
      .from('carrinho')
      .select('*')
      .eq('funcionario_id', funcionario_id)
      .eq('produto_id', produto_id)
      .eq('variacao', variacao || '')
      .single();

    if (existing) {
      // Atualizar quantidade
      const { data, error } = await supabase
        .from('carrinho')
        .update({ quantidade: existing.quantidade + quantidade })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, item: data });
    }

    // Criar novo item
    const { data, error } = await supabase
      .from('carrinho')
      .insert({
        funcionario_id,
        produto_id,
        quantidade,
        variacao: variacao || null
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, item: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar carrinho do funcionário
router.get('/:funcionario_id', async (req, res) => {
  try {
    // SEMPRE usar método alternativo que busca imagens separadamente
    // O select aninhado do Supabase não funciona bem em relações profundas (carrinho -> produtos -> produto_imagens)
    console.log(`[CART] Buscando carrinho para funcionário ${req.params.funcionario_id}`);
    
    // Buscar itens do carrinho com produtos (sem imagens primeiro)
    const { data: cartData, error: cartError } = await supabase
      .from('carrinho')
      .select(`
        *,
        produtos (*)
      `)
      .eq('funcionario_id', req.params.funcionario_id);

    if (cartError) {
      console.error('[CART] Erro ao buscar carrinho:', cartError);
      throw cartError;
    }

    if (!cartData || cartData.length === 0) {
      console.log('[CART] Carrinho vazio');
      return res.json([]);
    }

    console.log(`[CART] Encontrados ${cartData.length} itens no carrinho`);

    // Buscar imagens para cada produto separadamente (GARANTIDO FUNCIONAR)
    const cartItemsWithImages = await Promise.all(
      cartData.map(async (item) => {
        try {
          // Normalizar produtos - pode vir como array ou objeto
          let produto = item.produtos;
          if (Array.isArray(produto)) {
            produto = produto[0] || {};
          }
          if (!produto || typeof produto !== 'object') {
            console.warn(`[CART] Produto inválido para item ${item.id}`);
            produto = {};
          }

          // Buscar imagens separadamente (MESMO MÉTODO DA ROTA /products/:id QUE FUNCIONA)
          const { data: imagensData, error: imagensError } = await supabase
            .from('produto_imagens')
            .select('*')
            .eq('produto_id', item.produto_id)
            .order('ordem', { ascending: true });

          if (imagensError) {
            console.error(`[CART] Erro ao buscar imagens do produto ${item.produto_id}:`, imagensError);
          }

          // Garantir que imagensData seja um array válido
          const imagensArray = Array.isArray(imagensData) ? imagensData : [];

          console.log(`[CART] Produto ${item.produto_id} (${produto.nome}): ${imagensArray.length} imagens encontradas`);

          // Criar estrutura EXATAMENTE igual à rota de produtos
          const produtoCompleto = {
            ...produto,
            produto_imagens: imagensArray.map(img => ({
              id: img.id,
              produto_id: img.produto_id,
              url_imagem: img.url_imagem,
              ordem: img.ordem || 0,
              created_at: img.created_at
            }))
          };

          return {
            ...item,
            produtos: produtoCompleto
          };
        } catch (err) {
          console.error(`[CART] Erro ao processar item ${item.id}:`, err);
          const produtoNormalizado = Array.isArray(item.produtos) ? (item.produtos[0] || {}) : (item.produtos || {});
          return {
            ...item,
            produtos: {
              ...produtoNormalizado,
              produto_imagens: []
            }
          };
        }
      })
    );

    console.log(`[CART] Retornando ${cartItemsWithImages.length} itens com imagens`);
    res.json(cartItemsWithImages);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ error: error.message });
  }
});

// Método alternativo caso o select aninhado falhe
async function buscarCarrinhoAlternativo(req, res) {
  try {
    console.log('[CART] Usando método alternativo para buscar carrinho');
    
    // Buscar itens do carrinho com produtos (sem imagens primeiro)
    const { data: cartData, error: cartError } = await supabase
      .from('carrinho')
      .select(`
        *,
        produtos (*)
      `)
      .eq('funcionario_id', req.params.funcionario_id);

    if (cartError) throw cartError;

    if (!cartData || cartData.length === 0) {
      return res.json([]);
    }

    // Buscar imagens para cada produto separadamente
    const cartItemsWithImages = await Promise.all(
      cartData.map(async (item) => {
        try {
          // Normalizar produtos - pode vir como array ou objeto
          let produto = item.produtos;
          if (Array.isArray(produto)) {
            produto = produto[0] || {};
          }
          if (!produto || typeof produto !== 'object') {
            produto = {};
          }

          // Buscar imagens separadamente
          const { data: imagensData, error: imagensError } = await supabase
            .from('produto_imagens')
            .select('*')
            .eq('produto_id', item.produto_id)
            .order('ordem', { ascending: true });

          if (imagensError) {
            console.warn('Erro ao buscar imagens:', imagensError);
          }

          // Garantir que imagensData seja um array válido
          const imagensArray = Array.isArray(imagensData) ? imagensData : [];

          // Criar estrutura EXATAMENTE igual à rota de produtos
          const produtoCompleto = {
            ...produto,
            produto_imagens: imagensArray.map(img => ({
              id: img.id,
              produto_id: img.produto_id,
              url_imagem: img.url_imagem,
              ordem: img.ordem || 0,
              created_at: img.created_at
            }))
          };

          // Log detalhado para debug
          console.log(`[CART ALT] Produto ${produto.id || item.produto_id}:`, {
            produto_id: item.produto_id,
            produto_nome: produto.nome,
            imagens_encontradas: imagensArray.length,
            produto_completo_imagens: produtoCompleto.produto_imagens?.length || 0
          });

          return {
            ...item,
            produtos: produtoCompleto
          };
        } catch (err) {
          console.error('Erro ao processar item do carrinho:', err);
          const produtoNormalizado = Array.isArray(item.produtos) ? (item.produtos[0] || {}) : (item.produtos || {});
          return {
            ...item,
            produtos: {
              ...produtoNormalizado,
              produto_imagens: []
            }
          };
        }
      })
    );

    res.json(cartItemsWithImages);
  } catch (error) {
    console.error('Erro no método alternativo:', error);
    res.status(500).json({ error: error.message });
  }
}

// Atualizar quantidade
router.put('/:id', async (req, res) => {
  try {
    const { quantidade } = req.body;
    const { data, error } = await supabase
      .from('carrinho')
      .update({ quantidade })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, item: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover item
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('carrinho')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

