import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      const response = await api.get(`/cart/${user.id}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantidade: newQuantity });
      loadCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      loadCart();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const finalizeOrder = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const itens = cartItems.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        variacao: item.variacao,
        preco: item.produtos.preco
      }));

      await api.post('/orders', {
        funcionario_id: user.id,
        itens
      });

      alert('Pedido realizado com sucesso!');
      navigate('/pedidos');
    } catch (error) {
      alert('Erro ao finalizar pedido');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.produtos?.preco || 0) * item.quantidade);
  }, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-purple">Carrinho de Compras</h1>
            <button
              onClick={() => navigate('/produtos')}
              className="text-gray-700 hover:text-primary-purple"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando carrinho...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
            <button
              onClick={() => navigate('/produtos')}
              className="bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                  <img
                    src={item.produtos?.produto_imagens?.[0]?.url_imagem || '/placeholder.jpg'}
                    alt={item.produtos?.nome}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.produtos?.nome}</h3>
                    {item.variacao && (
                      <p className="text-sm text-gray-600">Variação: {item.variacao}</p>
                    )}
                    <p className="text-primary-purple font-bold mt-2">
                      R$ {parseFloat(item.produtos?.preco || 0).toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantidade}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary-purple">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <button
                  onClick={finalizeOrder}
                  disabled={submitting}
                  className="w-full bg-primary-purple text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

