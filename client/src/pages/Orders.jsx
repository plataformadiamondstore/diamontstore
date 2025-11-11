import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPedidos, setExpandedPedidos] = useState(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await api.get(`/orders/funcionario/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'verificando estoque':
        return 'bg-blue-100 text-blue-800';
      case 'produto sem estoque':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'verificando estoque':
        return 'Verificando Estoque';
      case 'produto sem estoque':
        return 'Produto Sem Estoque';
      default:
        return 'Pendente';
    }
  };

  const togglePedido = (pedidoId) => {
    setExpandedPedidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoId)) {
        newSet.delete(pedidoId);
      } else {
        newSet.add(pedidoId);
      }
      return newSet;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/produtos')} className="cursor-pointer hover:opacity-80 transition-opacity">
              <Logo />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/produtos')}
                className="text-gray-700 hover:text-primary-purple"
              >
                Ver Produtos
              </button>
              <button
                onClick={() => navigate('/carrinho')}
                className="text-gray-700 hover:text-primary-purple"
              >
                Carrinho
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">Você ainda não fez nenhum pedido</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const total = order.pedido_itens?.reduce((sum, item) => {
                return sum + (parseFloat(item.preco || 0) * item.quantidade);
              }, 0) || 0;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div 
                    className="flex justify-between items-start mb-4 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                    onClick={() => togglePedido(order.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          Pedido #{order.numero_pedido_funcionario || order.id}
                        </h3>
                        <svg 
                          className={`w-5 h-5 text-gray-500 transition-transform ${expandedPedidos.has(order.id) ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {expandedPedidos.has(order.id) && (
                    <>
                      <div className="space-y-2 mb-4">
                        {order.pedido_itens?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">{item.produtos?.nome}</p>
                              {item.variacao && (
                                <p className="text-sm text-gray-600">Variação: {item.variacao}</p>
                              )}
                              <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                            </div>
                            <p className="font-semibold">
                              R$ {(parseFloat(item.preco || 0) * item.quantidade).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total do pedido:</p>
                          <p className="text-2xl font-bold text-primary-purple">
                            R$ {total.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

