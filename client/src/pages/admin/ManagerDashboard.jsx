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
  const [empresaNome, setEmpresaNome] = useState('');
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
    loadEmpresa();
    loadPedidos();
    loadTodosPedidos(); // Carregar todos os pedidos para contadores
  }, [user, filters]);

  const loadEmpresa = async () => {
    try {
      if (user.empresa_id) {
        // Buscar todas as empresas e filtrar pelo ID
        const response = await api.get('/admin/empresas');
        const empresa = response.data?.find(emp => emp.id === user.empresa_id);
        if (empresa) {
          setEmpresaNome(empresa.nome || '');
        }
      } else if (user.empresas?.nome) {
        // Se a empresa já vier no objeto user
        setEmpresaNome(user.empresas.nome);
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    }
  };

  const loadPedidos = async () => {
    setLoading(true);
    try {
      // Não enviar filtro de status para o backend - vamos filtrar no frontend baseado nos itens
      const { status, ...filtersSemStatus } = filters;
      const response = await api.get('/admin/pedidos', {
        params: {
          empresa_id: user.empresa_id,
          ...filtersSemStatus
        }
      });
      
      // Filtrar no frontend baseado nos status dos itens
      let pedidosFiltrados = response.data || [];
      
      if (status) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => {
          if (!pedido.pedido_itens || pedido.pedido_itens.length === 0) {
            // Se não tem itens, usar status do pedido como fallback
            return pedido.status === status;
          }
          
          // Filtrar baseado nos status dos itens
          switch (status) {
            case 'pendente':
              return pedido.pedido_itens.some(item => item.status === 'pendente' || !item.status);
            case 'aprovado':
              return pedido.pedido_itens.some(item => item.status === 'Produto autorizado' || item.status === 'aprovado');
            case 'rejeitado':
              return pedido.pedido_itens.some(item => item.status === 'rejeitado');
            case 'aguardando aprovação de estoque':
              return pedido.pedido_itens.some(item => 
                item.status === 'aguardando aprovação de estoque' || 
                item.status === 'verificando estoque'
              );
            case 'produto sem estoque':
              return pedido.pedido_itens.some(item => item.status === 'produto sem estoque');
            default:
              return true;
          }
        });
      }
      
      setPedidos(pedidosFiltrados);
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
      console.log('Aprovando pedido:', pedidoId);
      const response = await api.put(`/admin/pedidos/${pedidoId}/aprovar`);
      console.log('Resposta da aprovação:', response.data);
      await loadPedidos();
      await loadTodosPedidos(); // Recarregar contadores
      alert('Pedido aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      console.error('Detalhes do erro:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
      alert(`Erro ao aprovar pedido: ${errorMessage}`);
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
      console.error('Erro ao rejeitar pedido:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
      alert(`Erro ao rejeitar pedido: ${errorMessage}`);
    }
  };

  const handlePrint = (pedido) => {
    // Remover iframe anterior se existir para evitar conflitos
    const existingFrame = document.getElementById('print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }
    
    // Criar novo iframe oculto
    const printFrame = document.createElement('iframe');
    printFrame.id = 'print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const data = new Date(pedido.created_at);
    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const totalPedido = pedido.pedido_itens?.reduce((sum, item) => sum + (parseFloat(item.preco || 0) * (item.quantidade || 0)), 0) || 0;

    // Normalizar dados antes de criar a template string
    const { funcionario: func, empresa: emp, clube: clb } = normalizarDadosPedido(pedido);

    const content = `
      <html>
        <head>
          <title>Pedido #${pedido.id}</title>
          <style>
            @media print {
              .pedido { page-break-inside: avoid; }
            }
            body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
            .logo-container { text-align: center; margin-bottom: 20px; }
            .logo-container img { max-height: 80px; max-width: 200px; }
            .pedido { margin-bottom: 20px; border: 1px solid #333; padding: 10px; max-width: 100%; }
            h1 { text-align: center; margin-bottom: 15px; font-size: 18px; }
            h2 { color: #6B46C1; border-bottom: 1px solid #6B46C1; padding-bottom: 5px; margin-bottom: 10px; font-size: 14px; }
            .info-pedido { background-color: #f0f0f0; padding: 8px; margin-bottom: 10px; border-radius: 3px; font-size: 11px; }
            .info-pedido p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
            th { background-color: #6B46C1; color: white; font-size: 10px; font-weight: bold; }
            td { font-size: 9px; }
            .sku-destaque { font-weight: bold; color: #6B46C1; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <img src="/logo.png" alt="Logo" onerror="this.style.display='none'" />
          </div>
          <div class="pedido">
            <h2>Pedido #${pedido.id}</h2>
            <div class="info-pedido">
              <p><strong>Funcionário:</strong> ${func?.nome_completo || 'N/A'}</p>
              <p><strong>Empresa:</strong> ${emp?.nome || 'N/A'}</p>
              ${(func?.cadastro_empresa || emp?.cadastro_empresa) ? `<p><strong>Cadastro Empresa:</strong> ${func?.cadastro_empresa || emp?.cadastro_empresa}</p>` : ''}
              <p><strong>Clube:</strong> ${clb?.nome || 'N/A'}</p>
              ${(func?.cadastro_clube || clb?.cadastro_clube) ? `<p><strong>Cadastro Clube:</strong> ${func?.cadastro_clube || clb?.cadastro_clube}</p>` : ''}
              <p><strong>Data:</strong> ${dataFormatada} às ${horaFormatada}</p>
              <p><strong>Status:</strong> ${pedido.status}</p>
            </div>
            <table>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Variação</th>
                <th>Quantidade</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
              ${pedido.pedido_itens?.map(item => {
                const sku = item.produtos?.sku || item.produtos?.codigo || item.sku || '-';
                return `
                  <tr>
                    <td>${item.produtos?.nome || 'Produto não encontrado'}</td>
                    <td><span class="sku-destaque">${sku !== '-' ? sku : 'NÃO CADASTRADO'}</span></td>
                    <td>${item.variacao || '-'}</td>
                    <td><strong>${item.quantidade || 0}</strong></td>
                    <td>R$ ${parseFloat(item.preco || 0).toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${(parseFloat(item.preco || 0) * (item.quantidade || 0)).toFixed(2).replace('.', ',')}</td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="6" style="text-align: center;">Nenhum item encontrado</td></tr>'}
            </table>
            <div style="margin-top: 10px; text-align: right; font-size: 12px; font-weight: bold;">
              <p><strong>Total:</strong> R$ ${totalPedido.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Flag para garantir apenas uma impressão por clique
    let hasPrinted = false;
    
    const executePrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      
      try {
        const printDoc = printFrame.contentWindow.document || printFrame.contentDocument;
        printDoc.open();
        printDoc.write(content);
        printDoc.close();
        
        // Aguardar um momento para garantir que o conteúdo foi renderizado
        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
          } catch (e) {
            console.error('Erro ao imprimir:', e);
          }
        }, 200);
      } catch (e) {
        console.error('Erro ao escrever no iframe:', e);
      }
    };
    
    // Aguardar o iframe estar pronto
    printFrame.onload = executePrint;
    
    // Fallback: se o onload não disparar, executar após um tempo
    setTimeout(() => {
      if (!hasPrinted) {
        executePrint();
      }
    }, 300);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'verificando estoque':
        return 'bg-blue-100 text-blue-800';
      case 'aguardando aprovação de estoque':
        return 'bg-blue-100 text-blue-800';
      case 'Produto autorizado':
        return 'bg-green-100 text-green-800';
      case 'produto sem estoque':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Pendente';
    
    // Normalizar status (trim e case insensitive)
    const normalizedStatus = String(status).trim();
    
    // Verificar se é "Produto autorizado" (case insensitive)
    if (normalizedStatus.toLowerCase() === 'produto autorizado') {
      return 'Produto autorizado';
    }
    
    switch (normalizedStatus.toLowerCase()) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'verificando estoque':
        return 'Verificando Estoque';
      case 'aguardando aprovação de estoque':
        return 'Verificando Estoque';
      case 'produto autorizado':
        return 'Produto autorizado';
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

  // Função robusta para normalizar dados do pedido (conforme documentação SOLUCAO_PROBLEMAS_PEDIDOS_GESTOR.md)
  const normalizarDadosPedido = (pedido) => {
    // Normalizar funcionarios (pode vir como array, objeto, null ou undefined)
    let funcionario = null;
    if (pedido.funcionarios) {
      if (Array.isArray(pedido.funcionarios)) {
        funcionario = pedido.funcionarios.length > 0 ? pedido.funcionarios[0] : null;
      } else if (typeof pedido.funcionarios === 'object') {
        funcionario = pedido.funcionarios;
      }
    }

    // Normalizar empresas
    let empresa = null;
    if (funcionario) {
      if (Array.isArray(funcionario.empresas)) {
        empresa = funcionario.empresas.length > 0 ? funcionario.empresas[0] : null;
      } else if (funcionario.empresas && typeof funcionario.empresas === 'object') {
        empresa = funcionario.empresas;
      }
    }

    // Normalizar clubes
    let clube = null;
    if (funcionario) {
      if (Array.isArray(funcionario.clubes)) {
        clube = funcionario.clubes.length > 0 ? funcionario.clubes[0] : null;
      } else if (funcionario.clubes && typeof funcionario.clubes === 'object') {
        clube = funcionario.clubes;
      }
    }

    return {
      funcionario,
      empresa,
      clube
    };
  };

  if (!user || user.tipo !== 'gestor') return null;

  // Calcular contadores com base nos STATUS DOS ITENS, não do pedido
  const pedidosPendentes = todosPedidos.filter(p => {
    if (!p.pedido_itens || p.pedido_itens.length === 0) return p.status === 'pendente';
    return p.pedido_itens.some(item => item.status === 'pendente' || !item.status);
  });
  
  const pedidosAprovados = todosPedidos.filter(p => {
    if (!p.pedido_itens || p.pedido_itens.length === 0) return false;
    return p.pedido_itens.some(item => item.status === 'Produto autorizado' || item.status === 'aprovado');
  });
  
  const pedidosRejeitados = todosPedidos.filter(p => {
    if (!p.pedido_itens || p.pedido_itens.length === 0) return p.status === 'rejeitado';
    return p.pedido_itens.some(item => item.status === 'rejeitado');
  });
  
  const pedidosVerificandoEstoque = todosPedidos.filter(p => {
    if (!p.pedido_itens || p.pedido_itens.length === 0) return false;
    return p.pedido_itens.some(item => 
      item.status === 'aguardando aprovação de estoque' || 
      item.status === 'verificando estoque'
    );
  });
  
  const pedidosSemEstoque = todosPedidos.filter(p => {
    if (!p.pedido_itens || p.pedido_itens.length === 0) return p.status === 'produto sem estoque';
    return p.pedido_itens.some(item => item.status === 'produto sem estoque');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <h1 className="text-xl font-bold text-primary-purple absolute left-1/2 transform -translate-x-1/2">PAINEL GESTOR</h1>
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
        {/* Mensagem de boas-vindas */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-gray-800">
              Olá GESTOR <span className="text-primary-purple">{user.nome || user.usuario || ''}</span>
            </p>
            {empresaNome && (
              <p className="text-lg font-bold text-gray-800">
                {empresaNome}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aguardando aprovação de estoque">Aguardando Aprovação de Estoque</option>
                <option value="Produto autorizado">Produto Autorizado</option>
                <option value="aprovado">Aprovado</option>
                <option value="produto sem estoque">Produto Sem Estoque</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.data_inicio}
                onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.data_fim}
                onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Funcionário
              </label>
              <input
                type="text"
                value={filters.funcionario_nome}
                onChange={(e) => setFilters({ ...filters, funcionario_nome: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                placeholder="Nome do funcionário"
              />
            </div>
            {(filters.status || filters.data_inicio || filters.data_fim || filters.funcionario_nome) && (
              <button
                onClick={() => setFilters({ status: '', data_inicio: '', data_fim: '', funcionario_nome: '' })}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-primary-purple hover:bg-gray-50 rounded-md transition-colors"
              >
                Limpar
              </button>
            )}
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
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === 'aguardando aprovação de estoque' ? 'bg-blue-100 border-2 border-blue-400 shadow-md' : 'bg-blue-50'}`}
                onClick={() => setFilters({ ...filters, status: filters.status === 'aguardando aprovação de estoque' ? '' : 'aguardando aprovação de estoque' })}
              >
                <p className="text-sm text-gray-600">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-blue-800">{pedidosVerificandoEstoque.length}</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${filters.status === 'aprovado' ? 'bg-green-100 border-2 border-green-400 shadow-md' : 'bg-green-50'}`}
                onClick={() => {
                  if (filters.status === 'aprovado') {
                    setFilters({ ...filters, status: '' });
                  } else {
                    setFilters({ ...filters, status: 'aprovado' });
                  }
                }}
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
                // Normalizar dados do pedido usando função robusta
                const { funcionario, empresa, clube } = normalizarDadosPedido(pedido);
                
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
                          <strong>Funcionário:</strong> {funcionario?.nome_completo || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Empresa:</strong> {empresa?.nome || 'N/A'}
                        </p>
                        {(funcionario?.cadastro_empresa || empresa?.cadastro_empresa) && (
                          <p className="text-sm text-gray-600">
                            <strong>Cadastro Empresa:</strong> {funcionario?.cadastro_empresa || empresa?.cadastro_empresa}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Clube:</strong> {clube?.nome || 'N/A'}
                        </p>
                        {(funcionario?.cadastro_clube || clube?.cadastro_clube) && (
                          <p className="text-sm text-gray-600">
                            <strong>Cadastro Clube:</strong> {funcionario?.cadastro_clube || clube?.cadastro_clube}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {new Date(pedido.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        {/* Verificar se tem algum item aprovado para mostrar botão de imprimir */}
                        {pedido.pedido_itens?.some(item => 
                          item.status === 'Produto autorizado' || item.status === 'aprovado'
                        ) && (
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
                          {pedido.pedido_itens?.map((item) => {
                            const itemStatus = item.status || 'pendente';
                            return (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                <div className="flex-1">
                                  <p className="font-medium">{item.produtos?.nome}</p>
                                  {item.variacao && (
                                    <p className="text-sm text-gray-600">Variação: {item.variacao}</p>
                                  )}
                                  <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(itemStatus)}`}>
                                    {getStatusText(itemStatus)}
                                  </span>
                                </div>
                                <p className="font-semibold">
                                  R$ {(parseFloat(item.preco || 0) * item.quantidade).toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total do pedido:</p>
                            <p className="text-2xl font-bold text-primary-purple">
                              R$ {total.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          {pedido.pedido_itens?.some(item => 
                            !item.status || item.status === 'pendente' || item.status === 'verificando estoque'
                          ) && (
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

