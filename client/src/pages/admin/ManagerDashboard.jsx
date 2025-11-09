import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [todosPedidos, setTodosPedidos] = useState([]); // Para calcular contadores
  const [loading, setLoading] = useState(true);
  const [expandedPedidos, setExpandedPedidos] = useState(new Set());
  const [filters, setFilters] = useState({
    status: '',
    data_inicio: '',
    data_fim: '',
    funcionario_nome: ''
  });

  useEffect(() => {
    if (!user || user.tipo !== 'gestor') {
      navigate('/adm');
      return;
    }
    loadPedidos();
    loadTodosPedidos(); // Carregar todos os pedidos para contadores
  }, [user, filters]);

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pedidos', {
        params: {
          empresa_id: user.empresa_id,
          ...filters
        }
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodosPedidos = async () => {
    try {
      // Buscar todos os pedidos sem filtro de status para calcular contadores
      const response = await api.get('/admin/pedidos', {
        params: {
          empresa_id: user.empresa_id,
          data_inicio: filters.data_inicio,
          data_fim: filters.data_fim,
          funcionario_nome: filters.funcionario_nome
          // Não incluir status para pegar todos
        }
      });
      setTodosPedidos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar todos os pedidos:', error);
    }
  };

  const handleAprovar = async (pedidoId) => {
    if (!confirm('Deseja aprovar este pedido?')) return;
    try {
      await api.put(`/admin/pedidos/${pedidoId}/aprovar`);
      loadPedidos();
      loadTodosPedidos(); // Recarregar contadores
      alert('Pedido aprovado com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar pedido');
    }
  };

  const handleRejeitar = async (pedidoId) => {
    if (!confirm('Deseja rejeitar este pedido?')) return;
    try {
      await api.put(`/admin/pedidos/${pedidoId}/rejeitar`);
      loadPedidos();
      loadTodosPedidos(); // Recarregar contadores
      alert('Pedido rejeitado');
    } catch (error) {
      alert('Erro ao rejeitar pedido');
    }
  };

  const handlePrint = (pedido) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head><title>Pedido #${pedido.id}</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Pedido #${pedido.id}</h1>
          <p><strong>Funcionário:</strong> ${pedido.funcionarios?.nome_completo}</p>
          <p><strong>Empresa:</strong> ${pedido.funcionarios?.empresas?.nome} (${pedido.funcionarios?.cadastro_empresa})</p>
          <p><strong>Clube:</strong> ${pedido.funcionarios?.clubes?.nome} (${pedido.funcionarios?.cadastro_clube})</p>
          <p><strong>Data:</strong> ${new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ${pedido.status}</p>
          <hr>
          <h2>Itens:</h2>
          <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Total</th>
            </tr>
            ${pedido.pedido_itens?.map(item => `
              <tr>
                <td>${item.produtos?.nome} ${item.variacao ? `(${item.variacao})` : ''}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${parseFloat(item.preco).toFixed(2)}</td>
                <td>R$ ${(parseFloat(item.preco) * item.quantidade).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <hr>
          <p><strong>Total:</strong> R$ ${pedido.pedido_itens?.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0).toFixed(2)}</p>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  if (!user || user.tipo !== 'gestor') return null;

  // Calcular contadores com base em TODOS os pedidos (não filtrados por status)
  const pedidosPendentes = todosPedidos.filter(p => p.status === 'pendente');
  const pedidosAprovados = todosPedidos.filter(p => p.status === 'aprovado');
  const pedidosRejeitados = todosPedidos.filter(p => p.status === 'rejeitado');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo />
              <h1 className="text-xl font-bold text-primary-purple">Painel do Gestor</h1>
            </div>
            <button
              onClick={logout}
              className="text-gray-700 hover:text-primary-purple"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
            <input
              type="date"
              value={filters.data_inicio}
              onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              placeholder="Data início"
            />
            <input
              type="date"
              value={filters.data_fim}
              onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              placeholder="Data fim"
            />
            <input
              type="text"
              value={filters.funcionario_nome}
              onChange={(e) => setFilters({ ...filters, funcionario_nome: e.target.value })}
              className="px-4 py-2 border rounded-lg"
              placeholder="Nome do funcionário"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === '' ? 'bg-blue-100 border-2 border-blue-400 shadow-md' : 'bg-blue-50'}`}
                onClick={() => setFilters({ ...filters, status: '' })}
              >
                <p className="text-sm text-gray-600">Todos Pedidos</p>
                <p className="text-2xl font-bold text-blue-800">{todosPedidos.length}</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === 'pendente' ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md' : 'bg-yellow-50'}`}
                onClick={() => setFilters({ ...filters, status: filters.status === 'pendente' ? '' : 'pendente' })}
              >
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-800">{pedidosPendentes.length}</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === 'aprovado' ? 'bg-green-100 border-2 border-green-400 shadow-md' : 'bg-green-50'}`}
                onClick={() => setFilters({ ...filters, status: filters.status === 'aprovado' ? '' : 'aprovado' })}
              >
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-800">{pedidosAprovados.length}</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === 'rejeitado' ? 'bg-red-100 border-2 border-red-400 shadow-md' : 'bg-red-50'}`}
                onClick={() => setFilters({ ...filters, status: filters.status === 'rejeitado' ? '' : 'rejeitado' })}
              >
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-800">{pedidosRejeitados.length}</p>
              </div>
            </div>

            {pedidos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">Nenhum pedido encontrado</p>
              </div>
            ) : (
              pedidos.map((pedido) => {
                const total = pedido.pedido_itens?.reduce((sum, item) => {
                  return sum + (parseFloat(item.preco || 0) * item.quantidade);
                }, 0) || 0;

                return (
                  <div key={pedido.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div 
                      className="flex justify-between items-start mb-4 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                      onClick={() => togglePedido(pedido.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Pedido #{pedido.id}</h3>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedPedidos.has(pedido.id) ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Funcionário:</strong> {pedido.funcionarios?.nome_completo}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Empresa:</strong> {pedido.funcionarios?.empresas?.nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Cadastro Empresa:</strong> {pedido.funcionarios?.cadastro_empresa}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Clube:</strong> {pedido.funcionarios?.clubes?.nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Cadastro Clube:</strong> {pedido.funcionarios?.cadastro_clube}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(pedido.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(pedido.status)}`}>
                          {pedido.status}
                        </span>
                        {pedido.status === 'aprovado' && (
                          <button
                            onClick={() => handlePrint(pedido)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                          >
                            Imprimir
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedPedidos.has(pedido.id) && (
                      <>
                        <div className="space-y-2 mb-4">
                          {pedido.pedido_itens?.map((item) => (
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

                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total do pedido:</p>
                            <p className="text-2xl font-bold text-primary-purple">
                              R$ {total.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          {pedido.status === 'pendente' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAprovar(pedido.id)}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleRejeitar(pedido.id)}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                              >
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

