import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Criar pedido
router.post('/', async (req, res) => {
  try {
    const { funcionario_id, itens } = req.body;

    // Criar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        funcionario_id,
        status: 'pendente'
      })
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Criar itens do pedido
    const itensPedido = itens.map(item => ({
      pedido_id: pedido.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      variacao: item.variacao || null,
      preco: item.preco,
      status: 'pendente'
    }));

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(itensPedido);

    if (itensError) throw itensError;

    // Limpar carrinho
    await supabase
      .from('carrinho')
      .delete()
      .eq('funcionario_id', funcionario_id);

    res.json({ success: true, pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar pedidos do funcionário
router.get('/funcionario/:funcionario_id', async (req, res) => {
  try {
    // Buscar todos os pedidos do funcionário ordenados por data de criação (mais antigo primeiro)
    // para calcular o número sequencial corretamente
    const { data: allPedidos, error: allError } = await supabase
      .from('pedidos')
      .select('id, created_at')
      .eq('funcionario_id', req.params.funcionario_id)
      .order('created_at', { ascending: true });

    if (allError) throw allError;

    // Criar mapa de ID do pedido para número sequencial
    const pedidoNumeroMap = {};
    if (allPedidos && allPedidos.length > 0) {
      allPedidos.forEach((pedido, index) => {
        pedidoNumeroMap[pedido.id] = index + 1;
      });
    }

    // Buscar pedidos com itens (ordenados por data descendente para exibição)
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_itens (
          *,
          produtos (*)
        )
      `)
      .eq('funcionario_id', req.params.funcionario_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Adicionar número sequencial do funcionário a cada pedido
    const pedidosComNumero = (data || []).map(pedido => ({
      ...pedido,
      numero_pedido_funcionario: pedidoNumeroMap[pedido.id] || 0
    }));

    res.json(pedidosComNumero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

