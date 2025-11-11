import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCadastroSubmenu, setActiveCadastroSubmenu] = useState('produtos');
  const [empresas, setEmpresas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [editingGestor, setEditingGestor] = useState(null);
  const [editGestorForm, setEditGestorForm] = useState({
    nome: '',
    usuario: '',
    senha: '',
    empresa_id: ''
  });
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [editEmpresaForm, setEditEmpresaForm] = useState({
    nome: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  // Form states
  const [empresaForm, setEmpresaForm] = useState({ nome: '', cadastro_empresa: '' });
  const [clubeForm, setClubeForm] = useState({ nome: '', cadastro_clube: '', empresa_id: '' });
  const [gestorForm, setGestorForm] = useState({ nome: '', usuario: '', senha: '', empresa_id: '', clube_id: '' });
  // Formulário unificado
  const [formularioUnificado, setFormularioUnificado] = useState({
    nome_empresa: '',
    nome_clube: '',
    nome_gestor: '',
    usuario_gestor: '',
    senha_gestor: '',
    confirmar_senha_gestor: ''
  });
  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    marca: '',
    sku: '',
    ean: '',
    estoque: '',
    imagens: [],
    variacoes: []
  });
  const [variacoesPersonalizadas, setVariacoesPersonalizadas] = useState('');
  const [editVariacoesPersonalizadas, setEditVariacoesPersonalizadas] = useState('');
  const [produtoImagens, setProdutoImagens] = useState([]);
  const [imagemCapaIndex, setImagemCapaIndex] = useState(0);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedClube, setSelectedClube] = useState('');
  const [categoriaNome, setCategoriaNome] = useState('');
  const [marcaNome, setMarcaNome] = useState('');
  const [tamanhoNome, setTamanhoNome] = useState('');
  const [produtosLista, setProdutosLista] = useState([]);
  const [editingProduto, setEditingProduto] = useState(null);
  const [editProdutoForm, setEditProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    marca: '',
    sku: '',
    ean: '',
    estoque: '',
    variacoes: []
  });
  const [editProdutoImagens, setEditProdutoImagens] = useState([]);
  const [novasImagens, setNovasImagens] = useState([]);
  const [imagensParaRemover, setImagensParaRemover] = useState([]);
  const [mostrarVisualizadorImagens, setMostrarVisualizadorImagens] = useState(false);
  const [imagemAtualIndex, setImagemAtualIndex] = useState(0);
  const [imagemAtualPorProduto, setImagemAtualPorProduto] = useState({});
  const [historicoUploads, setHistoricoUploads] = useState([]);
  const [uploadsExpandidos, setUploadsExpandidos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [pedidosExpandidos, setPedidosExpandidos] = useState({});
  
  // Filtros do dashboard
  const [dashboardFilters, setDashboardFilters] = useState({
    data_inicio: '',
    data_fim: '',
    empresa_id: ''
  });
  const [filtroEmpresaPedidos, setFiltroEmpresaPedidos] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroStatusPedidos, setFiltroStatusPedidos] = useState('');
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const [filtroMarcaProdutos, setFiltroMarcaProdutos] = useState('');
  const [filtroCategoriaProdutos, setFiltroCategoriaProdutos] = useState('');

  // Navegação por teclado no visualizador de imagens
  useEffect(() => {
    if (!mostrarVisualizadorImagens) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setImagemAtualIndex((prev) => (prev > 0 ? prev - 1 : editProdutoImagens.length - 1));
      } else if (e.key === 'ArrowRight') {
        setImagemAtualIndex((prev) => (prev < editProdutoImagens.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setMostrarVisualizadorImagens(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mostrarVisualizadorImagens, editProdutoImagens.length]);

  useEffect(() => {
    if (!user || user.tipo !== 'master') {
      navigate('/adm');
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard') {
        // Carregar todos os dados necessários para o dashboard
        try {
          const [empresasRes, gestoresRes, pedidosRes, uploadsRes] = await Promise.all([
            api.get('/admin/empresas').catch(() => ({ data: [] })),
            api.get('/admin/gestores').catch(() => ({ data: [] })),
            api.get('/admin/pedidos').catch(() => ({ data: [] })),
            api.get('/admin/funcionarios/uploads').catch(() => ({ data: [] }))
          ]);
          setEmpresas(empresasRes?.data || []);
          setGestores(gestoresRes?.data || []);
          setPedidos(pedidosRes?.data || []);
          // A API retorna { success: true, uploads: [...] } ou apenas o array
          const uploadsData = uploadsRes?.data?.uploads || uploadsRes?.data || [];
          setHistoricoUploads(Array.isArray(uploadsData) ? uploadsData : []);
        } catch (error) {
          console.error('Erro ao carregar dados do dashboard:', error);
          setEmpresas([]);
          setGestores([]);
          setPedidos([]);
          setHistoricoUploads([]);
        }
      } else if (activeTab === 'empresas') {
        // Carregar empresas, clubes e gestores juntos
        const [empresasRes, clubesRes, gestoresRes] = await Promise.all([
          api.get('/admin/empresas'),
          api.get('/admin/clubes'),
          api.get('/admin/gestores')
        ]);
        console.log('Dados carregados:', {
          empresas: empresasRes.data?.length || 0,
          clubes: clubesRes.data?.length || 0,
          gestores: gestoresRes.data?.length || 0
        });
        setEmpresas(empresasRes.data || []);
        setClubes(clubesRes.data || []);
        setGestores(gestoresRes.data || []);
      } else if (activeTab === 'produtos') {
        const [prodRes, catRes, marRes] = await Promise.all([
          api.get('/admin/produtos', { params: { page: 1, limit: 1000 } }).catch(err => {
            console.error('Erro ao buscar produtos:', err);
            return { data: { produtos: [], paginacao: { total: 0 } } };
          }),
          api.get('/admin/cadastros/categorias'),
          api.get('/admin/cadastros/marcas')
        ]);
        setProdutosLista(prodRes.data.produtos || []);
        setCategorias(catRes.data || []);
        setPaginaProdutos(1); // Resetar para primeira página ao carregar produtos
        setMarcas(marRes.data || []);
      } else if (activeTab === 'pedidos') {
        // Carregar pedidos
        try {
          const pedidosRes = await api.get('/admin/pedidos');
          setPedidos(pedidosRes.data || []);
        } catch (error) {
          console.error('Erro ao carregar pedidos:', error);
          setPedidos([]);
        }
      } else if (activeTab === 'cadastros') {
        // Carregar produtos (incluindo desabilitados), categorias, marcas e tamanhos
        const [prodRes, catRes, marRes, tamRes] = await Promise.all([
          api.get('/admin/produtos', { params: { page: 1, limit: 1000 } }).catch(err => {
            console.error('Erro ao buscar produtos:', err);
            return { data: { produtos: [], paginacao: { total: 0 } } };
          }),
          api.get('/admin/cadastros/categorias'),
          api.get('/admin/cadastros/marcas'),
          api.get('/admin/cadastros/tamanhos')
        ]);
        setProdutos(prodRes.data.produtos || []);
        setCategorias(catRes.data || []);
        setMarcas(marRes.data || []);
        setTamanhos(tamRes.data || []);
      } else if (activeTab === 'funcionarios') {
        // Carregar empresas e histórico de uploads
        try {
          const [empresasRes, uploadsRes] = await Promise.all([
            api.get('/admin/empresas'),
            api.get('/admin/funcionarios/uploads')
          ]);
          setEmpresas(empresasRes.data || []);
          console.log('Resposta completa do histórico de uploads:', uploadsRes);
          console.log('Dados do histórico de uploads:', uploadsRes.data);
          console.log('Uploads array:', uploadsRes.data?.uploads);
          const uploads = uploadsRes.data?.uploads || uploadsRes.data || [];
          console.log('Uploads processados:', uploads);
          setHistoricoUploads(uploads);
        } catch (error) {
          console.error('Erro ao carregar dados de funcionários:', error);
          console.error('Detalhes do erro:', error.response?.data || error.message);
          setEmpresas([]);
          setHistoricoUploads([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleCreateEmpresa = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/empresas', empresaForm);
      setEmpresaForm({ nome: '', cadastro_empresa: '' });
      loadData();
      alert('Empresa criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar empresa');
    }
  };

  const handleCreateUnificado = async (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formularioUnificado.nome_empresa) {
      alert('Nome da Empresa é obrigatório');
      return;
    }

    // Validar senha do gestor (sempre obrigatória)
    if (!formularioUnificado.senha_gestor) {
      alert('Senha do Gestor é obrigatória');
      return;
    }

    if (!formularioUnificado.confirmar_senha_gestor) {
      alert('Confirmação de Senha do Gestor é obrigatória');
      return;
    }

    // Verificar se as senhas são iguais
    if (formularioUnificado.senha_gestor !== formularioUnificado.confirmar_senha_gestor) {
      alert('As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }

    try {
      // 1. Criar empresa (sem cadastro_empresa)
      const empresaRes = await api.post('/admin/empresas', {
        nome: formularioUnificado.nome_empresa,
        cadastro_empresa: '' // Campo vazio já que não é mais necessário
      });

      const empresaId = empresaRes.data?.id || empresaRes.data?.empresa?.id;
      if (!empresaId) {
        throw new Error('Erro ao criar empresa - ID não retornado');
      }

      let clubeId = null;

      // 2. Criar clube (se preenchido, sem cadastro_clube)
      if (formularioUnificado.nome_clube) {
        const clubeRes = await api.post('/admin/clubes', {
          nome: formularioUnificado.nome_clube,
          cadastro_clube: '', // Campo vazio já que não é mais necessário
          empresa_id: empresaId
        });

        clubeId = clubeRes.data?.id || clubeRes.data?.clube?.id;
      }

      // 3. Criar gestor (se preenchido)
      if (formularioUnificado.nome_gestor && formularioUnificado.usuario_gestor && formularioUnificado.senha_gestor) {
        const gestorData = {
          nome: formularioUnificado.nome_gestor,
          usuario: formularioUnificado.usuario_gestor,
          senha: formularioUnificado.senha_gestor,
          empresa_id: empresaId
        };
        
        // Adicionar clube_id apenas se existir
        if (clubeId && clubeId !== null) {
          gestorData.clube_id = clubeId;
        }
        
        const gestorRes = await api.post('/admin/gestores', gestorData);
        console.log('Gestor criado:', gestorRes.data);
      }

      // Limpar formulário
      setFormularioUnificado({
        nome_empresa: '',
        nome_clube: '',
        nome_gestor: '',
        usuario_gestor: '',
        senha_gestor: '',
        confirmar_senha_gestor: ''
      });

      // Aguardar um pouco para garantir que os dados foram commitados no banco
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recarregar todos os dados
      await loadData();
      
      alert('Cadastro realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cadastro unificado:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao realizar cadastro';
      alert('Erro ao realizar cadastro: ' + errorMessage);
    }
  };

  const handleCreateClube = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/clubes', clubeForm);
      setClubeForm({ nome: '', cadastro_clube: '', empresa_id: '' });
      loadData();
      alert('Clube criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar clube');
    }
  };

  const handleCreateClubeNaEmpresa = async (empresaId) => {
    if (!clubeForm.nome || !clubeForm.cadastro_clube) {
      alert('Preencha nome e cadastro do clube');
      return;
    }
    try {
      await api.post('/admin/clubes', { ...clubeForm, empresa_id: empresaId });
      setClubeForm({ nome: '', cadastro_clube: '', empresa_id: '' });
      setSelectedEmpresaParaClube('');
      loadData();
      alert('Clube criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar clube');
    }
  };

  const handleCreateGestorNaEmpresa = async (empresaId, clubeId) => {
    if (!gestorForm.nome || !gestorForm.usuario || !gestorForm.senha) {
      alert('Preencha todos os campos do gestor');
      return;
    }
    try {
      const response = await api.post('/admin/gestores', { 
        ...gestorForm, 
        empresa_id: empresaId,
        clube_id: clubeId || null
      });
      
      if (response.data && response.data.success) {
        setGestorForm({ nome: '', usuario: '', senha: '', empresa_id: '', clube_id: '' });
        setSelectedEmpresaParaGestor('');
        setSelectedClubeParaGestor('');
        loadData();
        alert('Gestor criado com sucesso!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar gestor';
      alert('Erro ao criar gestor: ' + errorMessage);
    }
  };

  const handleCreateGestor = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/gestores', gestorForm);
      
      if (response.data && response.data.success) {
      setGestorForm({ nome: '', usuario: '', senha: '', empresa_id: '' });
        
        // Recarregar gestores imediatamente
        try {
          const gestoresRes = await api.get('/admin/gestores');
          console.log('Gestores recarregados após criação:', gestoresRes.data);
          setGestores(gestoresRes.data || []);
        } catch (loadError) {
          console.error('Erro ao recarregar gestores:', loadError);
          // Tentar recarregar via loadData como fallback
          if (activeTab === 'gestores') {
      loadData();
          }
        }
        
      alert('Gestor criado com sucesso!');
      } else {
        throw new Error(response.data?.error || 'Erro ao criar gestor');
      }
    } catch (error) {
      console.error('Erro ao criar gestor:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar gestor';
      alert('Erro ao criar gestor: ' + errorMessage);
    }
  };

  const handleEditGestor = (gestor) => {
    setEditingGestor(gestor);
    setEditGestorForm({
      nome: gestor.nome || '',
      usuario: gestor.usuario || '',
      senha: '', // Não preencher senha por segurança
      empresa_id: gestor.empresa_id || '',
      clube_id: gestor.clube_id || ''
    });
  };

  const handleUpdateGestor = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...editGestorForm };
      // Se a senha estiver vazia, não enviar
      if (!updateData.senha || updateData.senha.trim() === '') {
        delete updateData.senha;
      }

      const response = await api.put(`/admin/gestores/${editingGestor.id}`, updateData);
      
      if (response.data && response.data.success) {
        setEditingGestor(null);
        setEditGestorForm({ nome: '', usuario: '', senha: '', empresa_id: '', clube_id: '' });
        
        // Recarregar dados se estiver na aba empresas
        if (activeTab === 'empresas') {
          loadData();
        } else {
          const gestoresRes = await api.get('/admin/gestores');
          setGestores(gestoresRes.data || []);
        }
        
        alert('Gestor atualizado com sucesso!');
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar gestor');
      }
    } catch (error) {
      console.error('Erro ao atualizar gestor:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar gestor';
      alert('Erro ao atualizar gestor: ' + errorMessage);
    }
  };

  const handleDeleteGestor = async (id) => {
    if (!confirm('Deseja realmente excluir este gestor?')) return;
    try {
      await api.delete(`/admin/gestores/${id}`);
      
      // Recarregar gestores
      const gestoresRes = await api.get('/admin/gestores');
      setGestores(gestoresRes.data || []);
      
      alert('Gestor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir gestor:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao excluir gestor';
      alert('Erro ao excluir gestor: ' + errorMessage);
    }
  };

  const handleEditEmpresa = (empresa) => {
    setEditingEmpresa(empresa);
    setEditEmpresaForm({
      nome: empresa.nome || ''
    });
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/empresas/${editingEmpresa.id}`, editEmpresaForm);
      
      if (response.data && response.data.success) {
        setEditingEmpresa(null);
        setEditEmpresaForm({ nome: '' });
        loadData();
        alert('Empresa atualizada com sucesso!');
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar empresa');
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar empresa';
      alert('Erro ao atualizar empresa: ' + errorMessage);
    }
  };

  const handleDeleteEmpresa = async (id) => {
    if (!confirm('Deseja realmente excluir esta empresa? Isso também excluirá os clubes e gestores vinculados.')) return;
    try {
      await api.delete(`/admin/empresas/${id}`);
      loadData();
      alert('Empresa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao excluir empresa';
      alert('Erro ao excluir empresa: ' + errorMessage);
    }
  };

  const handleImprimirPorProduto = () => {
    if (pedidos.length === 0) {
      alert('Nenhum pedido para imprimir');
      return;
    }

    // Filtrar pedidos por empresa e data se os filtros estiverem ativos
    let pedidosFiltrados = pedidos;
    
    // Filtro por status
    if (filtroStatusPedidos) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.status === filtroStatusPedidos
      );
    }
    
    // Filtro por empresa
    if (filtroEmpresaPedidos) {
      const empresaId = parseInt(filtroEmpresaPedidos, 10);
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.funcionarios?.empresas?.id === empresaId || pedido.funcionarios?.empresa_id === empresaId
      );
    }
    
    // Filtro por data
    if (filtroDataInicio || filtroDataFim) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => {
        if (!pedido.created_at) return false;
        
        // Converter data do pedido para apenas data (sem hora) no timezone local
        const dataPedido = new Date(pedido.created_at);
        const anoPedido = dataPedido.getFullYear();
        const mesPedido = dataPedido.getMonth();
        const diaPedido = dataPedido.getDate();
        const dataPedidoLocal = new Date(anoPedido, mesPedido, diaPedido);
        
        if (filtroDataInicio) {
          // Converter data de início para apenas data no timezone local
          const [anoInicio, mesInicio, diaInicio] = filtroDataInicio.split('-').map(Number);
          const dataInicioLocal = new Date(anoInicio, mesInicio - 1, diaInicio);
          
          if (dataPedidoLocal < dataInicioLocal) return false;
        }
        
        if (filtroDataFim) {
          // Converter data de fim para apenas data no timezone local
          const [anoFim, mesFim, diaFim] = filtroDataFim.split('-').map(Number);
          const dataFimLocal = new Date(anoFim, mesFim - 1, diaFim);
          
          if (dataPedidoLocal > dataFimLocal) return false;
        }
        
        return true;
      });
    }
    
    if (pedidosFiltrados.length === 0) {
      const temFiltros = filtroStatusPedidos || filtroEmpresaPedidos || filtroDataInicio || filtroDataFim;
      alert(temFiltros 
        ? 'Nenhum pedido encontrado com os filtros selecionados.' 
        : 'Nenhum pedido para imprimir');
      return;
    }

    // Agrupar por pedido
    const pedidosAgrupados = {};
    pedidosFiltrados.forEach(pedido => {
      if (pedido.pedido_itens && pedido.pedido_itens.length > 0) {
        const itensPedido = [];
        let valorTotalPedido = 0;
        let quantidadeTotalPedido = 0;
        
        pedido.pedido_itens.forEach(item => {
          const sku = item.produtos?.sku || item.produtos?.codigo || item.sku || '-';
          const quantidade = item.quantidade || 0;
          const preco = parseFloat(item.preco || 0);
          
          itensPedido.push({
            produtoNome: item.produtos?.nome || 'Produto não encontrado',
            variacao: item.variacao || null,
            quantidade: quantidade,
            preco: preco,
            sku: sku,
            subtotal: preco * quantidade
          });
          
          valorTotalPedido += (preco * quantidade);
          quantidadeTotalPedido += quantidade;
        });
        
        pedidosAgrupados[pedido.id] = {
          pedidoId: pedido.id,
          funcionario: pedido.funcionarios?.nome_completo || 'N/A',
          empresa: pedido.funcionarios?.empresas?.nome || 'N/A',
          cadastroEmpresa: pedido.funcionarios?.cadastro_empresa || 'N/A',
          clube: pedido.funcionarios?.clubes?.nome || 'N/A',
          cadastroClube: pedido.funcionarios?.cadastro_clube || 'N/A',
          data: pedido.created_at,
          status: pedido.status,
          itens: itensPedido,
          valorTotal: valorTotalPedido,
          quantidadeTotal: quantidadeTotalPedido
        };
      }
    });

    // Ordenar pedidos por data (mais recente primeiro)
    const pedidosOrdenados = Object.values(pedidosAgrupados)
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    // Gerar conteúdo para impressão usando iframe oculto
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

    let content = `
      <html>
        <head>
          <title>Impressão de Pedidos</title>
          <style>
            @media print {
              .pedido { page-break-inside: avoid; margin-bottom: 15px; }
              .pedido:last-child { margin-bottom: 0; }
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
          <h1>Impressão de Pedidos</h1>
          ${(filtroStatusPedidos || filtroEmpresaPedidos || filtroDataInicio || filtroDataFim) ? `
            <div style="text-align: center; margin-bottom: 10px; padding: 8px; background-color: #e0e0e0; border-radius: 3px; font-size: 11px;">
              ${filtroStatusPedidos ? `<p><strong>Status:</strong> ${filtroStatusPedidos === 'pendente' ? 'Pendentes de Aprovação' : filtroStatusPedidos === 'aprovado' ? 'Aprovados' : 'Rejeitados'}</p>` : ''}
              ${filtroEmpresaPedidos ? `<p><strong>Empresa:</strong> ${empresas.find(e => e.id === parseInt(filtroEmpresaPedidos, 10))?.nome || 'N/A'}</p>` : ''}
              ${filtroDataInicio || filtroDataFim ? `
                <p><strong>Período:</strong> 
                  ${filtroDataInicio ? new Date(filtroDataInicio).toLocaleDateString('pt-BR') : 'Início'} 
                  até 
                  ${filtroDataFim ? new Date(filtroDataFim).toLocaleDateString('pt-BR') : 'Fim'}
                </p>
              ` : ''}
            </div>
          ` : ''}
    `;

    pedidosOrdenados.forEach(pedido => {
      const data = new Date(pedido.data);
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      content += `
        <div class="pedido">
          <h2>Pedido #${pedido.pedidoId}</h2>
          <div class="info-pedido">
            <p><strong>Funcionário:</strong> ${pedido.funcionario}</p>
            <p><strong>Empresa:</strong> ${pedido.empresa}</p>
            <p><strong>Cadastro Empresa:</strong> ${pedido.cadastroEmpresa}</p>
            <p><strong>Clube:</strong> ${pedido.clube}</p>
            <p><strong>Cadastro Clube:</strong> ${pedido.cadastroClube}</p>
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
            ${pedido.itens.map(item => `
              <tr>
                <td>${item.produtoNome}</td>
                <td><span class="sku-destaque">${item.sku && item.sku !== '-' ? item.sku : 'NÃO CADASTRADO'}</span></td>
                <td>${item.variacao || '-'}</td>
                <td><strong>${item.quantidade}</strong></td>
                <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.subtotal.toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    });

    content += `
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

  const handleCreateProduto = async (e) => {
    e.preventDefault();
    
    // Validações obrigatórias
    if (produtoImagens.length < 3) {
      alert('É obrigatório adicionar pelo menos 3 imagens do produto');
      return;
    }
    
    if (produtoImagens.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }
    
    if (!produtoForm.nome || produtoForm.nome.trim() === '') {
      alert('Nome do produto é obrigatório');
      return;
    }
    
    if (!produtoForm.preco || parseFloat(produtoForm.preco) <= 0) {
      alert('Preço do produto é obrigatório e deve ser maior que zero');
      return;
    }
    
    if (!produtoForm.sku || produtoForm.sku.trim() === '') {
      alert('SKU do produto é obrigatório');
      return;
    }
    
    if (!produtoForm.ean || produtoForm.ean.trim() === '') {
      alert('EAN do produto é obrigatório');
      return;
    }
    
    if (!produtoForm.categoria || produtoForm.categoria.trim() === '') {
      alert('Categoria do produto é obrigatória');
      return;
    }
    
    if (!produtoForm.marca || produtoForm.marca.trim() === '') {
      alert('Marca do produto é obrigatória');
      return;
    }
    
    if (!produtoForm.estoque || produtoForm.estoque.trim() === '' || parseInt(produtoForm.estoque) < 0) {
      alert('Estoque do produto é obrigatório e deve ser um número maior ou igual a zero');
      return;
    }
    
    if (!produtoForm.descricao || produtoForm.descricao.trim() === '') {
      alert('Descrição do produto é obrigatória');
      return;
    }

    try {
      const formData = new FormData();
      
      // Adicionar imagens na ordem correta (capa primeiro)
      const imagensOrdenadas = [...produtoImagens];
      if (imagensOrdenadas.length > 0 && imagemCapaIndex > 0) {
        // Mover a imagem de capa para o início
        const [imagemCapa] = imagensOrdenadas.splice(imagemCapaIndex, 1);
        imagensOrdenadas.unshift(imagemCapa);
      }
      
      imagensOrdenadas.forEach((imagem) => {
        formData.append('imagens', imagem);
      });
      
      // Enviar índice da capa para o backend
      formData.append('imagemCapaIndex', '0'); // Sempre 0 porque já ordenamos

      // Adicionar outros campos
      formData.append('nome', produtoForm.nome);
      formData.append('descricao', produtoForm.descricao || '');
      formData.append('preco', produtoForm.preco);
      formData.append('categoria', produtoForm.categoria || '');
      formData.append('marca', produtoForm.marca || '');
      formData.append('sku', produtoForm.sku || '');
      formData.append('ean', produtoForm.ean || '');
      formData.append('estoque', produtoForm.estoque || '0');
      formData.append('variacoes', JSON.stringify(produtoForm.variacoes || []));

      await api.post('/admin/produtos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProdutoForm({
        nome: '',
        descricao: '',
        preco: '',
        categoria: '',
        marca: '',
        sku: '',
        ean: '',
        estoque: '',
        imagens: [],
        variacoes: []
      });
      setProdutoImagens([]);
      setImagemCapaIndex(0);
      setVariacoesPersonalizadas('');
      loadData();
      alert('Produto criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar produto: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) {
      return;
    }

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)');
    }

    if (validFiles.length === 0) {
      return;
    }

    // Verificar se o total de imagens não excede 5
    const totalImagens = produtoImagens.length + validFiles.length;
    if (totalImagens > 5) {
      alert(`Máximo de 5 imagens permitidas. Você já tem ${produtoImagens.length} imagem(ns) e está tentando adicionar ${validFiles.length}.`);
      // Adicionar apenas o que couber
      const imagensParaAdicionar = validFiles.slice(0, 5 - produtoImagens.length);
      if (imagensParaAdicionar.length > 0) {
        const novasImagens = [...produtoImagens, ...imagensParaAdicionar];
        setProdutoImagens(novasImagens);
        // Se é a primeira imagem, definir como capa
        if (produtoImagens.length === 0) {
          setImagemCapaIndex(0);
        }
      }
      return;
    }

    // Adicionar imagens válidas
    const novasImagens = [...produtoImagens, ...validFiles];
    console.log('Adicionando imagens:', validFiles.length, 'Total:', novasImagens.length);
    setProdutoImagens(novasImagens);
    
    // Se é a primeira imagem, definir como capa automaticamente
    if (produtoImagens.length === 0 && novasImagens.length > 0) {
      setImagemCapaIndex(0);
    }
    
    // Resetar o input para permitir selecionar os mesmos arquivos novamente se necessário
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const newImagens = produtoImagens.filter((_, i) => i !== index);
    setProdutoImagens(newImagens);
    
    // Ajustar índice da capa se necessário
    if (index === imagemCapaIndex) {
      // Se a capa foi removida, definir a primeira como capa
      setImagemCapaIndex(0);
    } else if (index < imagemCapaIndex) {
      // Se uma imagem antes da capa foi removida, ajustar o índice
      setImagemCapaIndex(imagemCapaIndex - 1);
    }
  };

  // Funções para cadastros
  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/cadastros/categorias', { nome: categoriaNome });
      setCategoriaNome('');
      loadData();
      alert('Categoria criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar categoria: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCreateMarca = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/cadastros/marcas', { nome: marcaNome });
      setMarcaNome('');
      loadData();
      alert('Marca criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar marca: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCreateTamanho = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/cadastros/tamanhos', { nome: tamanhoNome });
      setTamanhoNome('');
      loadData();
      alert('Tamanho criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar tamanho: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    try {
      await api.delete(`/admin/cadastros/categorias/${id}`);
      loadData();
      alert('Categoria excluída!');
    } catch (error) {
      alert('Erro ao excluir categoria');
    }
  };

  const handleDeleteMarca = async (id) => {
    if (!confirm('Deseja realmente excluir esta marca?')) return;
    try {
      await api.delete(`/admin/cadastros/marcas/${id}`);
      loadData();
      alert('Marca excluída!');
    } catch (error) {
      alert('Erro ao excluir marca');
    }
  };

  const handleDeleteTamanho = async (id) => {
    if (!confirm('Deseja realmente excluir este tamanho?')) return;
    try {
      await api.delete(`/admin/cadastros/tamanhos/${id}`);
      loadData();
      alert('Tamanho excluído!');
    } catch (error) {
      alert('Erro ao excluir tamanho');
    }
  };

  const handleToggleAtivo = async (id, ativoAtual) => {
    try {
      const novoStatus = !ativoAtual;
      const response = await api.put(`/admin/produtos/${id}/toggle-ativo`, { ativo: novoStatus });
      
      if (response.data && response.data.success === true) {
        loadData();
        alert(`Produto ${novoStatus ? 'habilitado' : 'desabilitado'} com sucesso!`);
      } else {
        throw new Error(response.data?.error || 'Erro ao alterar status do produto');
      }
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao alterar status do produto';
      alert('Erro ao alterar status do produto: ' + errorMessage);
    }
  };

  // Funções para gerenciar produtos
  const handleEditProduto = (produto) => {
    console.log('Editando produto:', produto);
    console.log('Imagens do produto:', produto.produto_imagens);
    
    setEditingProduto(produto);
    setEditProdutoForm({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: produto.preco || '',
      categoria: produto.categoria || '',
      marca: produto.marca || '',
      sku: produto.sku || '',
      ean: produto.ean || '',
      estoque: produto.estoque !== undefined && produto.estoque !== null ? produto.estoque.toString() : '0',
      variacoes: produto.variacoes || []
    });
    setEditVariacoesPersonalizadas('');
    
    // Garantir que produto_imagens é um array
    const imagens = Array.isArray(produto.produto_imagens) 
      ? produto.produto_imagens 
      : (produto.produto_imagens ? [produto.produto_imagens] : []);
    
    console.log('Imagens processadas:', imagens);
    setEditProdutoImagens(imagens);
    setNovasImagens([]);
    setImagensParaRemover([]);
  };

  const handleRemoveImagem = (imagemId) => {
    setEditProdutoImagens(editProdutoImagens.filter(img => img.id !== imagemId));
    setImagensParaRemover([...imagensParaRemover, imagemId]);
  };

  const handleAddNovasImagens = (e) => {
    const files = Array.from(e.target.files);
    const totalImagens = editProdutoImagens.length + novasImagens.length + files.length;
    
    if (totalImagens > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)');
      return;
    }

    setNovasImagens([...novasImagens, ...files]);
  };

  const handleRemoveNovaImagem = (index) => {
    setNovasImagens(novasImagens.filter((_, i) => i !== index));
  };

  const handleUpdateProduto = async (e) => {
    e.preventDefault();
    try {
      // Verificar se há um produto sendo editado
      if (!editingProduto || !editingProduto.id) {
        console.error('Erro: Nenhum produto sendo editado');
        alert('Erro: Nenhum produto selecionado para edição');
        return;
      }
      
      // Primeiro, remover imagens marcadas para remoção
      if (imagensParaRemover.length > 0) {
        console.log('Removendo imagens:', imagensParaRemover, 'do produto:', editingProduto.id);
        for (const imagemId of imagensParaRemover) {
          try {
            console.log(`Deletando imagem ${imagemId} do produto ${editingProduto.id}`);
            const deleteResponse = await api.delete(`/admin/produtos/${editingProduto.id}/imagens/${imagemId}`);
            if (!deleteResponse.data || !deleteResponse.data.success) {
              console.warn('Aviso: Imagem pode não ter sido deletada corretamente:', imagemId);
            } else {
              console.log('Imagem deletada com sucesso:', imagemId);
            }
          } catch (error) {
            console.error('Erro ao remover imagem:', error);
            console.error('Produto ID:', editingProduto.id, 'Imagem ID:', imagemId);
            // Continuar mesmo se houver erro ao deletar uma imagem
          }
        }
      }

      // Aguardar um pouco para garantir que as deleções foram processadas
      await new Promise(resolve => setTimeout(resolve, 100));

      // Criar FormData para enviar dados e novas imagens
      const formData = new FormData();
      formData.append('nome', editProdutoForm.nome);
      formData.append('descricao', editProdutoForm.descricao || '');
      formData.append('preco', editProdutoForm.preco);
      formData.append('categoria', editProdutoForm.categoria || '');
      formData.append('marca', editProdutoForm.marca || '');
      formData.append('sku', editProdutoForm.sku || '');
      formData.append('ean', editProdutoForm.ean || '');
      formData.append('estoque', editProdutoForm.estoque !== undefined && editProdutoForm.estoque !== null ? editProdutoForm.estoque : '0');
      formData.append('variacoes', JSON.stringify(editProdutoForm.variacoes || []));

      // Adicionar novas imagens
      novasImagens.forEach((imagem) => {
        formData.append('imagens', imagem);
      });

      let response;
      try {
        response = await api.put(`/admin/produtos/${editingProduto.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (requestError) {
        // Se o erro for de parsing JSON, pode ser o problema
        if (requestError.message && requestError.message.includes('JSON')) {
          console.error('Erro ao parsear JSON da resposta:', requestError);
          throw new Error('Erro ao processar resposta do servidor. Tente novamente.');
        }
        throw requestError;
      }

      // Verificar se a resposta é válida
      if (!response) {
        throw new Error('Nenhuma resposta recebida do servidor');
      }

      if (!response.data) {
        console.error('Resposta sem data:', response);
        throw new Error('Resposta do servidor sem dados');
      }

      // Verificar se a resposta tem a estrutura esperada
      if (response.data.success === true) {
        // Se tiver produto, usar. Se não, apenas sucesso já é suficiente
        if (response.data.produto) {
          console.log('Produto atualizado com sucesso:', response.data.produto.id);
        }
        
        setEditingProduto(null);
        setNovasImagens([]);
        setImagensParaRemover([]);
        loadData();
        alert('Produto atualizado com sucesso!');
      } else {
        console.error('Resposta inesperada:', response.data);
        throw new Error(response.data.error || 'Resposta do servidor não contém sucesso');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Erro desconhecido';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Erro ao atualizar produto: ' + errorMessage);
    }
  };

  const handleDeleteProduto = async (id) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      await api.delete(`/admin/produtos/${id}`);
      loadData();
      alert('Produto excluído!');
    } catch (error) {
      alert('Erro ao excluir produto');
    }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!excelFile || !selectedEmpresa) {
      alert('Selecione a empresa e o arquivo Excel');
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('empresa_id', selectedEmpresa);
    // clube_id não é mais necessário

    try {
      const response = await api.post('/admin/funcionarios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.success) {
        alert(`Funcionários cadastrados com sucesso! Total: ${response.data.count || 0}`);
      setExcelFile(null);
      setSelectedEmpresa('');
        // Resetar input de arquivo
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        // Recarregar histórico de uploads
        loadData();
      } else {
        throw new Error(response.data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao fazer upload';
      const detalhes = error.response?.data?.detalhes;
      
      if (detalhes && Array.isArray(detalhes)) {
        alert('Erro ao fazer upload:\n' + detalhes.join('\n'));
      } else {
        alert('Erro ao fazer upload: ' + errorMessage);
      }
    }
  };

  if (!user || user.tipo !== 'master') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <h1 className="text-xl font-bold text-primary-purple absolute left-1/2 transform -translate-x-1/2">PAINEL ADMINISTRATIVO</h1>
            <button
              onClick={logout}
              className="text-gray-700 hover:text-primary-purple"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {['dashboard', 'empresas', 'funcionarios', 'cadastros', 'produtos', 'pedidos'].map((tab) => {
              const tabNames = {
                'dashboard': 'Dashboard',
                'empresas': 'Cadastro Empresas',
                'funcionarios': 'Cadastro Funcionarios',
                'cadastros': 'Cadastro Produto',
                'produtos': 'Produtos',
                'pedidos': 'Pedidos'
              };
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'cadastros') {
                      setActiveCadastroSubmenu('produtos');
                    }
                  }}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-purple text-primary-purple'
                      : 'text-gray-600 hover:text-primary-purple'
                  }`}
                >
                  {tabNames[tab] || tab}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Filtros do Dashboard */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dashboardFilters.data_inicio}
                    onChange={(e) => setDashboardFilters(prev => ({ ...prev, data_inicio: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dashboardFilters.data_fim}
                    onChange={(e) => setDashboardFilters(prev => ({ ...prev, data_fim: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Empresa
                  </label>
                  <select
                    value={dashboardFilters.empresa_id}
                    onChange={(e) => setDashboardFilters(prev => ({ ...prev, empresa_id: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                  >
                    <option value="">Todas as Empresas</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setDashboardFilters({ data_inicio: '', data_fim: '', empresa_id: '' })}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-primary-purple hover:bg-gray-50 rounded-md transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {(() => {
              // Aplicar filtros aos pedidos
              let pedidosFiltrados = pedidos || [];
              
              if (dashboardFilters.data_inicio) {
                const dataInicio = new Date(dashboardFilters.data_inicio);
                dataInicio.setHours(0, 0, 0, 0);
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                  const dataPedido = new Date(p.created_at);
                  return dataPedido >= dataInicio;
                });
              }
              
              if (dashboardFilters.data_fim) {
                const dataFim = new Date(dashboardFilters.data_fim);
                dataFim.setHours(23, 59, 59, 999);
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                  const dataPedido = new Date(p.created_at);
                  return dataPedido <= dataFim;
                });
              }
              
              if (dashboardFilters.empresa_id) {
                const empresaId = parseInt(dashboardFilters.empresa_id);
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                  return p.funcionarios?.empresas?.id === empresaId || p.funcionarios?.empresa_id === empresaId;
                });
              }
              
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card: Vendas Totais */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Vendas Totais</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        R$ {(() => {
                          if (pedidosFiltrados.length === 0) return '0,00';
                          const vendasTotais = pedidosFiltrados
                            .filter(p => p.status === 'aprovado')
                            .reduce((sum, pedido) => {
                              const totalPedido = pedido.pedido_itens?.reduce((s, item) => 
                                s + (parseFloat(item.preco || 0) * (item.quantidade || 0)), 0) || 0;
                              return sum + totalPedido;
                            }, 0);
                          return vendasTotais.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {pedidosFiltrados.filter(p => p.status === 'aprovado').length} pedidos aprovados
                      </p>
                    </div>

                    {/* Card: Total de Pedidos */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Pedidos</h3>
                      <p className="text-3xl font-bold text-gray-900">{pedidosFiltrados.length}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-green-600">
                          {pedidosFiltrados.filter(p => p.status === 'aprovado').length} Aprovados
                        </span>
                        <span className="text-yellow-600">
                          {pedidosFiltrados.filter(p => p.status === 'pendente').length} Pendentes
                        </span>
                        <span className="text-red-600">
                          {pedidosFiltrados.filter(p => p.status === 'rejeitado').length} Rejeitados
                        </span>
                      </div>
                    </div>

                    {/* Card: Total de Empresas */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Empresas</h3>
                      <p className="text-3xl font-bold text-gray-900">{empresas ? empresas.length : 0}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {gestores ? gestores.length : 0} gestores cadastrados
                      </p>
                    </div>

                    {/* Card: Total de Funcionários */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Funcionários</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {(() => {
                          try {
                            // Somar apenas o último upload de cada empresa
                            if (!historicoUploads || !Array.isArray(historicoUploads) || historicoUploads.length === 0) {
                              console.log('historicoUploads vazio ou inválido:', historicoUploads);
                              return 0;
                            }
                            
                            console.log('Total de uploads encontrados:', historicoUploads.length);
                            console.log('Primeiro upload exemplo:', historicoUploads[0]);
                            
                            // Agrupar uploads por empresa e pegar o mais recente de cada uma
                            const uploadsPorEmpresa = {};
                            historicoUploads.forEach((upload, index) => {
                              if (!upload) {
                                console.warn(`Upload ${index} é null ou undefined`);
                                return;
                              }
                              
                              const empresaId = upload.empresa_id;
                              if (!empresaId) {
                                console.warn(`Upload ${index} não tem empresa_id:`, upload);
                                return;
                              }
                              
                              const uploadDate = upload.created_at ? new Date(upload.created_at) : new Date(0);
                              const existingDate = uploadsPorEmpresa[empresaId]?.created_at 
                                ? new Date(uploadsPorEmpresa[empresaId].created_at) 
                                : new Date(0);
                              
                              if (!uploadsPorEmpresa[empresaId] || uploadDate > existingDate) {
                                uploadsPorEmpresa[empresaId] = upload;
                              }
                            });
                            
                            console.log('Uploads por empresa:', Object.keys(uploadsPorEmpresa).length);
                            
                            // Somar a quantidade de funcionários do último upload de cada empresa
                            const totalFuncionarios = Object.values(uploadsPorEmpresa).reduce((sum, upload) => {
                              const quantidade = parseInt(upload?.quantidade_funcionarios) || 0;
                              console.log(`Empresa ${upload?.empresa_id}: ${quantidade} funcionários`);
                              return sum + quantidade;
                            }, 0);
                            
                            console.log('Total de funcionários calculado:', totalFuncionarios);
                            return totalFuncionarios;
                          } catch (error) {
                            console.error('Erro ao calcular total de funcionários:', error);
                            return 0;
                          }
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Funcionários cadastrados (último upload de cada empresa)</p>
                    </div>
                  </div>

            {/* Vendas por Empresa */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Vendas por Empresa</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Empresa</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Vendas Totais</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Pedidos</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Funcionários</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      try {
                        // Agrupar vendas por empresa
                        if (!empresas || !Array.isArray(empresas)) {
                          return (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-500">
                                {empresas === undefined || empresas === null ? 'Carregando empresas...' : 'Nenhuma empresa cadastrada'}
                              </td>
                            </tr>
                          );
                        }

                        if (!pedidos || !Array.isArray(pedidos)) {
                          return (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-500">
                                {pedidos === undefined || pedidos === null ? 'Carregando pedidos...' : 'Nenhum pedido encontrado'}
                              </td>
                            </tr>
                          );
                        }
                        
                        // Aplicar filtros aos pedidos para a tabela
                        let pedidosParaTabela = pedidos;
                        if (dashboardFilters.data_inicio) {
                          const dataInicio = new Date(dashboardFilters.data_inicio);
                          dataInicio.setHours(0, 0, 0, 0);
                          pedidosParaTabela = pedidosParaTabela.filter(p => {
                            const dataPedido = new Date(p.created_at);
                            return dataPedido >= dataInicio;
                          });
                        }
                        if (dashboardFilters.data_fim) {
                          const dataFim = new Date(dashboardFilters.data_fim);
                          dataFim.setHours(23, 59, 59, 999);
                          pedidosParaTabela = pedidosParaTabela.filter(p => {
                            const dataPedido = new Date(p.created_at);
                            return dataPedido <= dataFim;
                          });
                        }
                        if (dashboardFilters.empresa_id) {
                          const empresaId = parseInt(dashboardFilters.empresa_id);
                          pedidosParaTabela = pedidosParaTabela.filter(p => {
                            return p.funcionarios?.empresas?.id === empresaId || p.funcionarios?.empresa_id === empresaId;
                          });
                        }
                        
                        const vendasPorEmpresa = {};
                        // Criar mapa de cadastro_empresa para id da empresa
                        const empresaPorCadastro = {};
                        // Mapa de funcionários por empresa (do último upload)
                        const funcionariosPorEmpresa = {};
                        
                        // Processar uploads para obter quantidade de funcionários por empresa
                        if (historicoUploads && Array.isArray(historicoUploads) && historicoUploads.length > 0) {
                          historicoUploads.forEach(upload => {
                            if (upload && upload.empresa_id) {
                              const empresaId = upload.empresa_id;
                              const uploadDate = upload.created_at ? new Date(upload.created_at) : new Date(0);
                              const existingDate = funcionariosPorEmpresa[empresaId]?.created_at 
                                ? new Date(funcionariosPorEmpresa[empresaId].created_at) 
                                : new Date(0);
                              
                              // Manter apenas o upload mais recente de cada empresa
                              if (!funcionariosPorEmpresa[empresaId] || uploadDate > existingDate) {
                                funcionariosPorEmpresa[empresaId] = {
                                  quantidade: parseInt(upload?.quantidade_funcionarios) || 0,
                                  created_at: upload.created_at
                                };
                              }
                            }
                          });
                        }
                        
                        empresas.forEach(empresa => {
                          try {
                            if (empresa && empresa.id) {
                              vendasPorEmpresa[empresa.id] = {
                                nome: empresa.nome || 'Sem nome',
                                vendas: 0,
                                pedidos: 0,
                                funcionarios: funcionariosPorEmpresa[empresa.id]?.quantidade || 0
                              };
                              // Mapear cadastro_empresa para id
                              if (empresa.cadastro_empresa) {
                                empresaPorCadastro[empresa.cadastro_empresa] = empresa.id;
                              }
                            }
                          } catch (e) {
                            console.error('Erro ao processar empresa:', e, empresa);
                          }
                        });
                        
                        console.log('Empresas mapeadas:', Object.keys(vendasPorEmpresa));
                        console.log('Empresas por cadastro:', empresaPorCadastro);

                        pedidosParaTabela.forEach(pedido => {
                          try {
                            if (pedido && pedido.status === 'aprovado') {
                              // Tentar múltiplas formas de obter o empresa_id
                              let empresaId = pedido.funcionarios?.empresas?.id 
                                || pedido.funcionarios?.empresa_id
                                || pedido.empresa_id;
                              
                              // Se não encontrou por id, tentar por cadastro_empresa
                              if (!empresaId && pedido.funcionarios?.cadastro_empresa) {
                                empresaId = empresaPorCadastro[pedido.funcionarios.cadastro_empresa];
                                console.log(`Encontrou empresa por cadastro_empresa ${pedido.funcionarios.cadastro_empresa}: ${empresaId}`);
                              }
                              
                              console.log('Processando pedido:', {
                                pedidoId: pedido.id,
                                empresaId: empresaId,
                                cadastroEmpresa: pedido.funcionarios?.cadastro_empresa,
                                funcionario: pedido.funcionarios?.nome_completo,
                                estruturaFuncionario: pedido.funcionarios
                              });
                              
                              if (empresaId && vendasPorEmpresa[empresaId]) {
                                const totalPedido = (pedido.pedido_itens || []).reduce((sum, item) => {
                                  if (!item) return sum;
                                  try {
                                    const preco = parseFloat(item.preco || 0);
                                    const quantidade = parseInt(item.quantidade || 0);
                                    return sum + (preco * quantidade);
                                  } catch (e) {
                                    console.error('Erro ao calcular item:', e, item);
                                    return sum;
                                  }
                                }, 0);
                                
                                console.log(`Adicionando venda para empresa ${empresaId}: R$ ${totalPedido}`);
                                
                                vendasPorEmpresa[empresaId].vendas += totalPedido;
                                vendasPorEmpresa[empresaId].pedidos += 1;
                                // Não precisa adicionar funcionários aqui, já temos do upload
                              } else if (pedido.status === 'aprovado') {
                                console.warn('Pedido aprovado sem empresa associada:', {
                                  pedidoId: pedido.id,
                                  empresaId: empresaId,
                                  empresasDisponiveis: Object.keys(vendasPorEmpresa),
                                  funcionario: pedido.funcionarios
                                });
                              }
                            }
                          } catch (e) {
                            console.error('Erro ao processar pedido:', e, pedido);
                          }
                        });

                        // Converter para array e ordenar por vendas
                        // Mostrar todas as empresas que têm funcionários cadastrados OU vendas
                        const empresasOrdenadas = Object.values(vendasPorEmpresa)
                          .filter(emp => {
                            // Mostrar se tem funcionários cadastrados OU se tem vendas
                            return emp && (emp.funcionarios > 0 || emp.pedidos > 0);
                          })
                          .sort((a, b) => {
                            try {
                              // Ordenar primeiro por vendas, depois por quantidade de funcionários
                              if ((b.vendas || 0) !== (a.vendas || 0)) {
                                return (b.vendas || 0) - (a.vendas || 0);
                              }
                              return (b.funcionarios || 0) - (a.funcionarios || 0);
                            } catch {
                              return 0;
                            }
                          });

                        console.log('Empresas com funcionários ou vendas:', empresasOrdenadas.length);
                        console.log('Total de empresas no sistema:', empresas.length);
                        console.log('Empresas mapeadas:', Object.keys(vendasPorEmpresa).length);
                        console.log('Detalhes das empresas ordenadas:', empresasOrdenadas);
                        console.log('Funcionários por empresa:', funcionariosPorEmpresa);

                        if (empresasOrdenadas.length === 0) {
                          // Verificar se há pedidos aprovados mas não estão sendo associados às empresas
                          const pedidosAprovados = pedidosParaTabela.filter(p => p && p.status === 'aprovado');
                          console.log('Pedidos aprovados encontrados:', pedidosAprovados.length);
                          if (pedidosAprovados.length > 0) {
                            console.log('Primeiro pedido aprovado:', pedidosAprovados[0]);
                            console.log('Estrutura do funcionário:', pedidosAprovados[0]?.funcionarios);
                          }
                          
                          return (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-500">
                                Nenhuma venda registrada ainda
                              </td>
                            </tr>
                          );
                        }

                        return empresasOrdenadas.map((emp, index) => {
                          try {
                            return (
                              <tr key={`emp-${emp.nome}-${index}`} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{emp.nome || 'Sem nome'}</td>
                                <td className="py-3 px-4 text-right font-semibold text-green-600">
                                  R$ {(emp.vendas || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                </td>
                                <td className="py-3 px-4 text-right">{emp.pedidos || 0}</td>
                                <td className="py-3 px-4 text-right">{emp.funcionarios || 0}</td>
                                <td className="py-3 px-4 text-right text-gray-600">
                                  R$ {emp.pedidos > 0 ? ((emp.vendas || 0) / emp.pedidos).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0,00'}
                                </td>
                              </tr>
                            );
                          } catch (e) {
                            console.error('Erro ao renderizar linha da empresa:', e);
                            return null;
                          }
                        });
                      } catch (error) {
                        console.error('Erro ao processar vendas por empresa:', error);
                        return (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-red-500">
                              Erro ao carregar dados. Tente recarregar a página.
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          );
        })()}
        </div>
        )}

        {activeTab === 'empresas' && (
          <div className="space-y-6">
            {/* Formulário Unificado de Cadastro */}
          <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">CADASTRO EMPRESAS</h2>
              <form onSubmit={handleCreateUnificado} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                <input
                  type="text"
                  placeholder="Nome da Empresa"
                      value={formularioUnificado.nome_empresa}
                      onChange={(e) => setFormularioUnificado({ ...formularioUnificado, nome_empresa: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Clube *</label>
                <input
                  type="text"
                      placeholder="Nome do Clube"
                      value={formularioUnificado.nome_clube}
                      onChange={(e) => setFormularioUnificado({ ...formularioUnificado, nome_clube: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Gestor *</label>
                    <input
                      type="text"
                      placeholder="Nome do Gestor"
                      value={formularioUnificado.nome_gestor}
                      onChange={(e) => setFormularioUnificado({ ...formularioUnificado, nome_gestor: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usuário do Gestor *</label>
                    <input
                      type="text"
                      placeholder="Usuário do Gestor"
                      value={formularioUnificado.usuario_gestor}
                      onChange={(e) => setFormularioUnificado({ ...formularioUnificado, usuario_gestor: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha do Gestor *</label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha do Gestor"
                        value={formularioUnificado.senha_gestor}
                        onChange={(e) => setFormularioUnificado({ ...formularioUnificado, senha_gestor: e.target.value })}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                          formularioUnificado.confirmar_senha_gestor && 
                          formularioUnificado.senha_gestor !== formularioUnificado.confirmar_senha_gestor
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                  required
                />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {mostrarSenha ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
              </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha do Gestor *</label>
                    <div className="relative">
                      <input
                        type={mostrarConfirmarSenha ? "text" : "password"}
                        placeholder="Confirmar Senha do Gestor"
                        value={formularioUnificado.confirmar_senha_gestor}
                        onChange={(e) => setFormularioUnificado({ ...formularioUnificado, confirmar_senha_gestor: e.target.value })}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                          formularioUnificado.confirmar_senha_gestor && 
                          formularioUnificado.senha_gestor !== formularioUnificado.confirmar_senha_gestor
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {mostrarConfirmarSenha ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
              </button>
                    </div>
                    {formularioUnificado.confirmar_senha_gestor && 
                     formularioUnificado.senha_gestor !== formularioUnificado.confirmar_senha_gestor && (
                      <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  {formularioUnificado.nome_empresa && 
                   formularioUnificado.nome_clube && 
                   formularioUnificado.nome_gestor && 
                   formularioUnificado.usuario_gestor && 
                   formularioUnificado.senha_gestor && 
                   formularioUnificado.confirmar_senha_gestor &&
                   formularioUnificado.senha_gestor === formularioUnificado.confirmar_senha_gestor ? (
                    <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Cadastrar
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      disabled
                      className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed"
                    >
                      Preencha todos os campos obrigatórios
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  * Campos obrigatórios: Nome da Empresa, Nome do Clube, Nome do Gestor, Usuário do Gestor, Senha do Gestor e Confirmar Senha do Gestor.
                </p>
            </form>
            </div>

            {/* Lista de Empresas Cadastradas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Empresas Cadastradas</h3>
              <div className="space-y-4">
                {empresas.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma empresa cadastrada ainda.</p>
                ) : (
                  empresas.map((empresa) => {
                    const clubesDaEmpresa = clubes.filter(c => c.empresa_id === empresa.id);
                    const gestoresDaEmpresa = gestores.filter(g => g.empresa_id === empresa.id);
                    const primeiroClube = clubesDaEmpresa.length > 0 ? clubesDaEmpresa[0] : null;
                    const primeiroGestor = gestoresDaEmpresa.length > 0 ? gestoresDaEmpresa[0] : null;
                    
                    return (
                      <div key={empresa.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Empresa</p>
                            <p className="font-semibold text-gray-900">{empresa.nome}</p>
                            <p className="text-sm text-gray-600">{empresa.cadastro_empresa}</p>
                </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Clube</p>
                            {primeiroClube ? (
                              <>
                                <p className="font-medium text-gray-900">{primeiroClube.nome}</p>
                                <p className="text-sm text-gray-600">{primeiroClube.cadastro_clube}</p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 italic">-</p>
                            )}
            </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Gestor</p>
                            {primeiroGestor ? (
                              <p className="font-medium text-gray-900">{primeiroGestor.nome}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">-</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Usuário</p>
                            {primeiroGestor ? (
                              <p className="text-sm text-gray-900">{primeiroGestor.usuario}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">-</p>
                            )}
                          </div>
                          <div className="md:col-span-2 flex gap-2 items-end">
                            <button
                              onClick={() => handleEditEmpresa(empresa)}
                              className="flex-1 bg-primary-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteEmpresa(empresa.id)}
                              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Empresa */}
        {editingEmpresa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Editar Empresa</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmpresa(null);
                      setEditEmpresaForm({ nome: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleUpdateEmpresa} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                <input
                  type="text"
                      placeholder="Nome da Empresa"
                      value={editEmpresaForm.nome}
                      onChange={(e) => setEditEmpresaForm({ ...editEmpresaForm, nome: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Salvar Alterações
              </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmpresa(null);
                        setEditEmpresaForm({ nome: '' });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
            </form>
                </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Gestor (global - usado na aba empresas) */}
        {editingGestor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Editar Gestor</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGestor(null);
                      setEditGestorForm({ nome: '', usuario: '', senha: '', empresa_id: '', clube_id: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleUpdateGestor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                      value={editGestorForm.empresa_id}
                      onChange={(e) => setEditGestorForm({ ...editGestorForm, empresa_id: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione a Empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nome do Gestor"
                      value={editGestorForm.nome}
                      onChange={(e) => setEditGestorForm({ ...editGestorForm, nome: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Usuário"
                      value={editGestorForm.usuario}
                      onChange={(e) => setEditGestorForm({ ...editGestorForm, usuario: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="password"
                      placeholder="Nova Senha (deixe em branco para manter)"
                      value={editGestorForm.senha}
                      onChange={(e) => setEditGestorForm({ ...editGestorForm, senha: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Salvar Alterações
              </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGestor(null);
                        setEditGestorForm({ nome: '', usuario: '', senha: '', empresa_id: '', clube_id: '' });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
            </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produtos Cadastrados</h2>
            
            {/* Filtros de Marca e Categoria */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filtroCategoriaProdutos}
                    onChange={(e) => {
                      setFiltroCategoriaProdutos(e.target.value);
                      setPaginaProdutos(1);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                  >
                    <option value="">Todas as Categorias</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Marca
                  </label>
                  <select
                    value={filtroMarcaProdutos}
                    onChange={(e) => {
                      setFiltroMarcaProdutos(e.target.value);
                      setPaginaProdutos(1);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                  >
                    <option value="">Todas as Marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.nome}>
                        {marca.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(filtroCategoriaProdutos || filtroMarcaProdutos) && (
                  <button
                    onClick={() => {
                      setFiltroCategoriaProdutos('');
                      setFiltroMarcaProdutos('');
                      setPaginaProdutos(1);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-primary-purple hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
            
            {/* Cálculo de paginação: 10 linhas x 3 produtos = 30 produtos por página */}
            {(() => {
              // Aplicar filtros antes da paginação
              let produtosFiltrados = produtosLista;
              
              if (filtroCategoriaProdutos) {
                produtosFiltrados = produtosFiltrados.filter(produto => 
                  produto.categoria === filtroCategoriaProdutos
                );
              }
              
              if (filtroMarcaProdutos) {
                produtosFiltrados = produtosFiltrados.filter(produto => 
                  produto.marca === filtroMarcaProdutos
                );
              }
              
              const produtosPorPagina = 30; // 10 linhas x 3 produtos
              const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
              const inicio = (paginaProdutos - 1) * produtosPorPagina;
              const fim = inicio + produtosPorPagina;
              const produtosPaginaAtual = produtosFiltrados.slice(inicio, fim);
              
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {produtosPaginaAtual.map((produto) => (
                <div key={produto.id} className="bg-white rounded-lg shadow-sm p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="mb-4 relative">
                    {produto.produto_imagens && produto.produto_imagens.length > 0 ? (
                      <>
                        <div className="relative">
                          <img
                            src={produto.produto_imagens[imagemAtualPorProduto[produto.id] || 0].url_imagem}
                            alt={produto.nome}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          
                          {/* Botões de Navegação - apenas se houver mais de 1 imagem */}
                          {produto.produto_imagens.length > 1 && (
                            <>
                              <button
                                onClick={() => {
                                  const currentIndex = imagemAtualPorProduto[produto.id] || 0;
                                  const newIndex = currentIndex > 0 ? currentIndex - 1 : produto.produto_imagens.length - 1;
                                  setImagemAtualPorProduto({
                                    ...imagemAtualPorProduto,
                                    [produto.id]: newIndex
                                  });
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all text-xl font-bold z-10"
                                title="Imagem anterior"
                              >
                                ‹
                              </button>
                              <button
                                onClick={() => {
                                  const currentIndex = imagemAtualPorProduto[produto.id] || 0;
                                  const newIndex = currentIndex < produto.produto_imagens.length - 1 ? currentIndex + 1 : 0;
                                  setImagemAtualPorProduto({
                                    ...imagemAtualPorProduto,
                                    [produto.id]: newIndex
                                  });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all text-xl font-bold z-10"
                                title="Próxima imagem"
                              >
                                ›
                              </button>
                              
                              {/* Contador de Imagens */}
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-xs font-semibold z-10">
                                {(imagemAtualPorProduto[produto.id] || 0) + 1} / {produto.produto_imagens.length}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{produto.nome}</h3>
                    {produto.ativo === false && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                        DESABILITADO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {produto.categoria && <span className="mr-2">{produto.categoria}</span>}
                    {produto.marca && <span>• {produto.marca}</span>}
                  </p>
                  {produto.descricao && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{produto.descricao}</p>
                  )}
                  <p className="text-xl font-bold text-primary-purple mb-4">
                    R$ {parseFloat(produto.preco).toFixed(2)}
                  </p>
                  <div className="mb-4 flex items-center justify-between">
                    {produto.variacoes && produto.variacoes.length > 0 ? (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Variações:</p>
                        <div className="flex flex-wrap gap-1">
                          {produto.variacoes.slice(0, 3).map((variacao, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {variacao}
                            </span>
                          ))}
                          {produto.variacoes.length > 3 && (
                            <span className="text-xs text-gray-500">+{produto.variacoes.length - 3}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1"></div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Estoque:</p>
                      <span className="text-sm font-semibold text-gray-700">{produto.estoque !== undefined && produto.estoque !== null ? produto.estoque : 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <button
                        onClick={() => handleToggleAtivo(produto.id, produto.ativo !== false)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          produto.ativo !== false ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            produto.ativo !== false ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-600">
                        {produto.ativo !== false ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduto(produto)}
                        className="flex-1 bg-primary-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduto(produto.id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
                    ))}
                  </div>
                  
                  {/* Controles de Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6 mb-6">
                      <button
                        onClick={() => setPaginaProdutos(Math.max(1, paginaProdutos - 1))}
                        disabled={paginaProdutos === 1}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          paginaProdutos === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-purple text-white hover:bg-purple-700'
                        }`}
                      >
                        Anterior
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Página</span>
                        <span className="font-semibold text-primary-purple">{paginaProdutos}</span>
                        <span className="text-gray-600">de</span>
                        <span className="font-semibold">{totalPaginas}</span>
                        <span className="text-gray-500 text-sm">
                          ({produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
                          {produtosFiltrados.length !== produtosLista.length && ` de ${produtosLista.length} total`})
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setPaginaProdutos(Math.min(totalPaginas, paginaProdutos + 1))}
                        disabled={paginaProdutos === totalPaginas}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          paginaProdutos === totalPaginas
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-purple text-white hover:bg-purple-700'
                        }`}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                  
                  {produtosLista.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Nenhum produto cadastrado ainda.</p>
                    </div>
                  ) : produtosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Nenhum produto encontrado com os filtros selecionados.</p>
                    </div>
                  ) : null}
                </>
              );
            })()}

            {/* Modal de Edição */}
            {editingProduto && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Editar Produto</h2>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduto(null);
                          setNovasImagens([]);
                          setImagensParaRemover([]);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleUpdateProduto} className="space-y-4">
                      {/* Seção de Imagens - NO TOPO */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Imagens do Produto (máximo 5 imagens)
                          </label>
                          {editProdutoImagens.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setMostrarVisualizadorImagens(true);
                                setImagemAtualIndex(0);
                              }}
                              className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Ver Todas as Imagens
                            </button>
                          )}
                        </div>
                        
                        {/* Imagens Existentes */}
                        {editProdutoImagens && editProdutoImagens.length > 0 ? (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Imagens atuais ({editProdutoImagens.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {editProdutoImagens.map((imagem, index) => (
                                <div key={imagem.id || index} className="relative group">
                                  <img
                                    src={imagem.url_imagem}
                                    alt={`Imagem ${imagem.id || index}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImagem(imagem.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-red-600 shadow-lg transition-all opacity-100 cursor-pointer"
                                    title="Remover imagem"
                                    style={{ zIndex: 20 }}
                                  >
                                    ×
                </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-sm text-gray-500">
                            Nenhuma imagem cadastrada para este produto.
                          </div>
                        )}

                        {/* Novas Imagens (Preview) */}
                        {novasImagens.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Novas imagens:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {novasImagens.map((imagem, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(imagem)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                    <button
                                    type="button"
                                    onClick={() => handleRemoveNovaImagem(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-red-600 shadow-lg z-10 transition-all opacity-100"
                                    title="Remover imagem"
                                  >
                                    ×
                    </button>
                                  <p className="text-xs text-center mt-1 truncate">{imagem.name}</p>
                  </div>
                ))}
              </div>
            </div>
                        )}

                      </div>

                      {/* Card de Upload de Imagem - ABAIXO DAS IMAGENS */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 max-w-md">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          multiple
                          onChange={handleAddNovasImagens}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                          <span>Selecione novas imagens (JPEG, JPG, PNG, GIF ou WEBP)</span>
                          <span className="text-gray-400 ml-2">Total: {editProdutoImagens.length + novasImagens.length} de 5 imagens</span>
                        </p>
                      </div>

                      {/* Outras Informações - ABAIXO DO UPLOAD */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Produto
                          </label>
                          <input
                            type="text"
                            value={editProdutoForm.nome}
                            onChange={(e) => setEditProdutoForm({ ...editProdutoForm, nome: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preço
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editProdutoForm.preco}
                              onChange={(e) => setEditProdutoForm({ ...editProdutoForm, preco: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={editProdutoForm.sku}
                            onChange={(e) => setEditProdutoForm({ ...editProdutoForm, sku: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            EAN
                          </label>
                          <input
                            type="text"
                            value={editProdutoForm.ean}
                            onChange={(e) => setEditProdutoForm({ ...editProdutoForm, ean: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoria
                          </label>
                          <select
                            value={editProdutoForm.categoria}
                            onChange={(e) => setEditProdutoForm({ ...editProdutoForm, categoria: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="">Selecione a Categoria</option>
                            {categorias.map((cat) => (
                              <option key={cat.id} value={cat.nome}>
                                {cat.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marca
                          </label>
                          <select
                            value={editProdutoForm.marca}
                            onChange={(e) => setEditProdutoForm({ ...editProdutoForm, marca: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="">Selecione a Marca</option>
                            {marcas.map((marca) => (
                              <option key={marca.id} value={marca.nome}>
                                {marca.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={editProdutoForm.descricao}
                          onChange={(e) => setEditProdutoForm({ ...editProdutoForm, descricao: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          rows="4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estoque
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editProdutoForm.estoque}
                          onChange={(e) => setEditProdutoForm({ ...editProdutoForm, estoque: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>

                      {/* Seção de Variações */}
                      <div>
                        <label className="block mb-2">Variações</label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {tamanhos.map((tamanho) => {
                              const isSelected = editProdutoForm.variacoes?.includes(tamanho.nome) || false;
                              return (
                                <button
                                  key={tamanho.id}
                                  type="button"
                                  onClick={() => {
                                    const novasVariacoes = isSelected
                                      ? editProdutoForm.variacoes.filter(v => v !== tamanho.nome)
                                      : [...(editProdutoForm.variacoes || []), tamanho.nome];
                                    setEditProdutoForm({ ...editProdutoForm, variacoes: novasVariacoes });
                                  }}
                                  className={`px-4 py-2 rounded-lg border ${
                                    isSelected
                                      ? 'bg-primary-purple text-white border-primary-purple'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-purple'
                                  }`}
                                >
                                  {tamanho.nome}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-sm text-gray-500">
                            Ou adicione variações personalizadas (uma por linha):
                          </p>
                          <textarea
                            placeholder="Cor Azul&#10;Cor Vermelha&#10;Material Algodão"
                            value={editVariacoesPersonalizadas}
                            onChange={(e) => {
                              setEditVariacoesPersonalizadas(e.target.value);
                              const vars = e.target.value.split('\n').filter(v => v.trim());
                              // Combinar tamanhos selecionados com variações personalizadas
                              const tamanhosSelecionados = (editProdutoForm.variacoes || []).filter(v => 
                                tamanhos.some(t => t.nome === v)
                              );
                              setEditProdutoForm({ 
                                ...editProdutoForm, 
                                variacoes: [...tamanhosSelecionados, ...vars]
                              });
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                            rows="3"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Salvar Alterações
                </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduto(null);
                            setNovasImagens([]);
                            setImagensParaRemover([]);
                            setMostrarVisualizadorImagens(false);
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
              </form>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Visualizador de Imagens */}
            {mostrarVisualizadorImagens && editingProduto && editProdutoImagens.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
                <div className="relative max-w-4xl w-full">
                  {/* Botão Fechar */}
                    <button
                    onClick={() => setMostrarVisualizadorImagens(false)}
                    className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-200 z-10 shadow-lg"
                    >
                    ×
                    </button>

                  {/* Imagem Principal */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="relative">
                      <img
                        src={editProdutoImagens[imagemAtualIndex].url_imagem}
                        alt={`Imagem ${imagemAtualIndex + 1} de ${editProdutoImagens.length}`}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                      />
                      
                      {/* Contador */}
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                        {imagemAtualIndex + 1} / {editProdutoImagens.length}
                  </div>

                      {/* Botões de Navegação */}
                      {editProdutoImagens.length > 1 && (
                        <>
                          <button
                            onClick={() => setImagemAtualIndex((prev) => (prev > 0 ? prev - 1 : editProdutoImagens.length - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all text-2xl font-bold"
                            title="Imagem anterior"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => setImagemAtualIndex((prev) => (prev < editProdutoImagens.length - 1 ? prev + 1 : 0))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-all text-2xl font-bold"
                            title="Próxima imagem"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    {/* Miniaturas */}
                    {editProdutoImagens.length > 1 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {editProdutoImagens.map((imagem, index) => (
                          <button
                            key={imagem.id}
                            onClick={() => setImagemAtualIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              index === imagemAtualIndex
                                ? 'border-blue-500 ring-2 ring-blue-300 scale-105'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={imagem.url_imagem}
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                ))}
              </div>
                    )}

                    {/* Informações da Imagem */}
                    <div className="mt-4 text-center space-y-1">
                      <p className="text-sm text-gray-600">Ordem: {editProdutoImagens[imagemAtualIndex].ordem + 1}</p>
                      {editProdutoImagens.length > 1 && (
                        <p className="text-xs text-gray-400">Use ← → para navegar ou ESC para fechar</p>
                      )}
            </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'funcionarios' && (
          <div className="space-y-6">
            {/* Formulário de Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Upload de Funcionários (Excel)</h2>
              <form onSubmit={handleUploadExcel} className="space-y-4">
                <div>
                  <select
                    value={selectedEmpresa}
                    onChange={(e) => setSelectedEmpresa(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Selecione a Empresa</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg">
                  Upload Excel
                </button>
              </form>
            </div>

            {/* Listagem de Uploads */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Histórico de Uploads</h2>
              {historicoUploads.length === 0 ? (
                <div>
                  <p className="text-gray-500 text-center py-8">Nenhum upload realizado ainda.</p>
                  <p className="text-xs text-gray-400 text-center mt-2">Debug: historicoUploads.length = {historicoUploads.length}</p>
                  {historicoUploads.length === 0 && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Verifique o console do navegador (F12) para mais detalhes
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {historicoUploads.map((upload) => {
                    if (!upload) return null;
                    
                    const dataHora = upload.created_at ? new Date(upload.created_at) : null;
                    const dataFormatada = dataHora ? dataHora.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'N/A';
                    const horaFormatada = dataHora ? dataHora.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A';
                    const mostrarFuncionarios = uploadsExpandidos[upload.id] || false;
                    
                    return (
                      <div key={upload.id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* Cabeçalho do Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Empresa</p>
                            <p className="font-semibold text-gray-800">{upload.nome_empresa || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Quantidade</p>
                            <p className="font-semibold text-gray-800">{upload.quantidade_funcionarios || 0} funcionários</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Arquivo</p>
                            <p className="text-sm text-gray-600">{upload.nome_arquivo || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Data e Hora</p>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">{dataFormatada}</span>
                              <span className="text-xs text-gray-400">{horaFormatada}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botão para mostrar/ocultar funcionários */}
                        {upload.funcionarios && upload.funcionarios.length > 0 && (
                          <div>
                    <button
                              onClick={() => setUploadsExpandidos({
                                ...uploadsExpandidos,
                                [upload.id]: !mostrarFuncionarios
                              })}
                              className="flex items-center gap-2 text-primary-purple hover:text-purple-700 text-sm font-medium mb-3"
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform ${mostrarFuncionarios ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              {mostrarFuncionarios ? 'Ocultar' : 'Mostrar'} funcionários ({upload.funcionarios.length} de {upload.quantidade_funcionarios})
                    </button>

                            {/* Lista de Funcionários */}
                            {mostrarFuncionarios && (
                              <div className="border-t border-gray-200 pt-4">
                                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Cadastro Empresa</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Cadastro Clube</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {upload.funcionarios.map((funcionario) => (
                                        <tr key={funcionario.id} className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="py-2 px-3 text-gray-800">{funcionario.nome_completo}</td>
                                          <td className="py-2 px-3 text-gray-600">{funcionario.cadastro_empresa || 'N/A'}</td>
                                          <td className="py-2 px-3 text-gray-600">{funcionario.cadastro_clube || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {upload.quantidade_funcionarios > upload.funcionarios.length && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                      Mostrando {upload.funcionarios.length} de {upload.quantidade_funcionarios} funcionários
                                    </p>
                                  )}
              </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cadastros' && (
          <div className="flex gap-6">
            {/* Menu Lateral */}
            <div className="w-64 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-bold mb-4 text-primary-purple">Cadastros</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveCadastroSubmenu('produtos')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCadastroSubmenu === 'produtos'
                      ? 'bg-primary-purple text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cadastro de Produtos
                </button>
                <button
                  onClick={() => setActiveCadastroSubmenu('categorias')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCadastroSubmenu === 'categorias'
                      ? 'bg-primary-purple text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cadastro de Categorias
                </button>
                <button
                  onClick={() => setActiveCadastroSubmenu('marcas')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCadastroSubmenu === 'marcas'
                      ? 'bg-primary-purple text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cadastro de Marcas
                </button>
                <button
                  onClick={() => setActiveCadastroSubmenu('tamanhos')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCadastroSubmenu === 'tamanhos'
                      ? 'bg-primary-purple text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cadastro de Tamanhos
                </button>
              </nav>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              {activeCadastroSubmenu === 'produtos' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Cadastrar Produto</h2>
            <form onSubmit={handleCreateProduto} className="space-y-4 mb-6">
              {/* Upload de Imagens - NO TOPO */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="block mb-2 font-semibold">
                  Imagens do Produto (máximo 5 imagens)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Selecione até 5 imagens (JPEG, JPG, PNG, GIF ou WEBP)
                </p>
                
                {/* Preview das imagens */}
                {produtoImagens.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Selecione a imagem de capa (primeira imagem exibida):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {produtoImagens.map((imagem, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(imagem)}
                          alt={`Preview ${index + 1}`}
                              className={`w-full h-32 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                index === imagemCapaIndex
                                  ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={() => setImagemCapaIndex(index)}
                            />
                            {index === imagemCapaIndex && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                CAPA
                              </div>
                            )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                              title="Remover imagem"
                        >
                          ×
                        </button>
                            <button
                              type="button"
                              onClick={() => setImagemCapaIndex(index)}
                              className={`absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                                index === imagemCapaIndex
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white bg-opacity-75 text-gray-700 hover:bg-opacity-90'
                              }`}
                              title="Definir como capa"
                            >
                              {index === imagemCapaIndex ? '✓ Capa' : 'Definir Capa'}
                            </button>
                        <p className="text-xs text-center mt-1 truncate">{imagem.name}</p>
                      </div>
                    ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Clique em uma imagem para defini-la como capa do anúncio
                      </p>
                  </div>
                )}
                {produtoImagens.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {produtoImagens.length} de 5 imagens selecionadas
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Produto *"
                  value={produtoForm.nome}
                  onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor *"
                    value={produtoForm.preco}
                    onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                  <input
                    type="text"
                    placeholder="SKU *"
                    value={produtoForm.sku}
                    onChange={(e) => setProdutoForm({ ...produtoForm, sku: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="EAN *"
                    value={produtoForm.ean}
                    onChange={(e) => setProdutoForm({ ...produtoForm, ean: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                <select
                  value={produtoForm.categoria}
                  onChange={(e) => setProdutoForm({ ...produtoForm, categoria: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione a Categoria *</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={produtoForm.marca}
                  onChange={(e) => setProdutoForm({ ...produtoForm, marca: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione a Marca *</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.nome}>
                      {marca.nome}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Descrição *"
                value={produtoForm.descricao}
                onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
                required
              />
              <input
                type="number"
                placeholder="Estoque *"
                min="0"
                value={produtoForm.estoque}
                onChange={(e) => setProdutoForm({ ...produtoForm, estoque: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />
              <div>
                <label className="block mb-2">Variações</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tamanhos.map((tamanho) => {
                      const isSelected = produtoForm.variacoes.includes(tamanho.nome);
                      return (
                        <button
                          key={tamanho.id}
                          type="button"
                          onClick={() => {
                            const novasVariacoes = isSelected
                              ? produtoForm.variacoes.filter(v => v !== tamanho.nome)
                              : [...produtoForm.variacoes, tamanho.nome];
                            setProdutoForm({ ...produtoForm, variacoes: novasVariacoes });
                          }}
                          className={`px-4 py-2 rounded-lg border ${
                            isSelected
                              ? 'bg-primary-purple text-white border-primary-purple'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-purple'
                          }`}
                        >
                          {tamanho.nome}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500">
                    Ou adicione variações personalizadas (uma por linha):
                  </p>
                  <textarea
                    placeholder="Cor Azul&#10;Cor Vermelha&#10;Material Algodão"
                    value={variacoesPersonalizadas}
                    onChange={(e) => {
                      setVariacoesPersonalizadas(e.target.value);
                      const vars = e.target.value.split('\n').filter(v => v.trim());
                      // Combinar tamanhos selecionados com variações personalizadas
                      const tamanhosSelecionados = produtoForm.variacoes.filter(v => 
                        tamanhos.some(t => t.nome === v)
                      );
                      setProdutoForm({ 
                        ...produtoForm, 
                        variacoes: [...tamanhosSelecionados, ...vars]
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
              </div>
              <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg">
                Criar Produto
              </button>
            </form>
          </div>
        )}

              {activeCadastroSubmenu === 'categorias' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Cadastrar Categorias</h2>
                  <form onSubmit={handleCreateCategoria} className="flex gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome da Categoria"
                      value={categoriaNome}
                      onChange={(e) => setCategoriaNome(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      required
                    />
                    <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg">
                      Adicionar
                    </button>
                  </form>
                  <div className="space-y-2">
                    {categorias.map((cat) => (
                      <div key={cat.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <span>{cat.nome}</span>
                        <button
                          onClick={() => handleDeleteCategoria(cat.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
      </div>
                    ))}
    </div>
                </div>
              )}

              {activeCadastroSubmenu === 'marcas' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Cadastrar Marcas</h2>
                  <form onSubmit={handleCreateMarca} className="flex gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome da Marca"
                      value={marcaNome}
                      onChange={(e) => setMarcaNome(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      required
                    />
                    <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg">
                      Adicionar
                    </button>
                  </form>
                  <div className="space-y-2">
                    {marcas.map((marca) => (
                      <div key={marca.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <span>{marca.nome}</span>
                        <button
                          onClick={() => handleDeleteMarca(marca.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCadastroSubmenu === 'tamanhos' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Cadastrar Tamanhos</h2>
                  <form onSubmit={handleCreateTamanho} className="flex gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome do Tamanho (ex: P, M, G, GG)"
                      value={tamanhoNome}
                      onChange={(e) => setTamanhoNome(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      required
                    />
                    <button type="submit" className="bg-primary-purple text-white px-6 py-2 rounded-lg">
                      Adicionar
                    </button>
                  </form>
                  <div className="space-y-2">
                    {tamanhos.map((tamanho) => (
                      <div key={tamanho.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <span>{tamanho.nome}</span>
                        <button
                          onClick={() => handleDeleteTamanho(tamanho.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">Pedidos</h2>
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={filtroStatusPedidos}
                      onChange={(e) => setFiltroStatusPedidos(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                    >
                      <option value="">Todos os Status</option>
                      <option value="pendente">Pendentes de Aprovação</option>
                      <option value="aprovado">Aprovados</option>
                      <option value="rejeitado">Rejeitados</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      min={filtroDataInicio || undefined}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Empresa
                    </label>
                    <select
                      value={filtroEmpresaPedidos}
                      onChange={(e) => setFiltroEmpresaPedidos(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-purple focus:border-primary-purple"
                    >
                      <option value="">Todas as Empresas</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(filtroStatusPedidos || filtroDataInicio || filtroDataFim || filtroEmpresaPedidos) && (
                    <button
                      onClick={() => {
                        setFiltroStatusPedidos('');
                        setFiltroDataInicio('');
                        setFiltroDataFim('');
                        setFiltroEmpresaPedidos('');
                      }}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-primary-purple hover:bg-gray-50 rounded-md transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              {pedidos.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={handleImprimirPorProduto}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir Pedidos
                    </button>
                </div>
              )}
            </div>
              
            {pedidos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado.</p>
              ) : (
                (() => {
                  // Filtrar pedidos por empresa, status e data se os filtros estiverem ativos
                  let pedidosFiltrados = pedidos;
                  
                  // Filtro por status
                  if (filtroStatusPedidos) {
                    pedidosFiltrados = pedidosFiltrados.filter(pedido => 
                      pedido.status === filtroStatusPedidos
                    );
                  }
                  
                  // Filtro por empresa
                  if (filtroEmpresaPedidos) {
                    const empresaId = parseInt(filtroEmpresaPedidos, 10);
                    pedidosFiltrados = pedidosFiltrados.filter(pedido => 
                      pedido.funcionarios?.empresas?.id === empresaId || pedido.funcionarios?.empresa_id === empresaId
                    );
                  }
                  
                  // Filtro por data
                  if (filtroDataInicio || filtroDataFim) {
                    pedidosFiltrados = pedidosFiltrados.filter(pedido => {
                      if (!pedido.created_at) return false;
                      
                      // Converter data do pedido para apenas data (sem hora) no timezone local
                      const dataPedido = new Date(pedido.created_at);
                      const anoPedido = dataPedido.getFullYear();
                      const mesPedido = dataPedido.getMonth();
                      const diaPedido = dataPedido.getDate();
                      const dataPedidoLocal = new Date(anoPedido, mesPedido, diaPedido);
                      
                      if (filtroDataInicio) {
                        // Converter data de início para apenas data no timezone local
                        const [anoInicio, mesInicio, diaInicio] = filtroDataInicio.split('-').map(Number);
                        const dataInicioLocal = new Date(anoInicio, mesInicio - 1, diaInicio);
                        
                        if (dataPedidoLocal < dataInicioLocal) return false;
                      }
                      
                      if (filtroDataFim) {
                        // Converter data de fim para apenas data no timezone local
                        const [anoFim, mesFim, diaFim] = filtroDataFim.split('-').map(Number);
                        const dataFimLocal = new Date(anoFim, mesFim - 1, diaFim);
                        
                        if (dataPedidoLocal > dataFimLocal) return false;
                      }
                      
                      return true;
                    });
                  }

                  if (pedidosFiltrados.length === 0) {
                    const temFiltros = filtroStatusPedidos || filtroEmpresaPedidos || filtroDataInicio || filtroDataFim;
                    return (
                      <p className="text-gray-500 text-center py-8">
                        {temFiltros 
                          ? 'Nenhum pedido encontrado com os filtros selecionados.' 
                          : 'Nenhum pedido encontrado.'}
                      </p>
                    );
                  }

                  // Agrupar pedidos por empresa
                  const pedidosPorEmpresa = {};
                  pedidosFiltrados.forEach((pedido) => {
                    const empresaNome = pedido.funcionarios?.empresas?.nome || 'Sem Empresa';
                    if (!pedidosPorEmpresa[empresaNome]) {
                      pedidosPorEmpresa[empresaNome] = [];
                    }
                    pedidosPorEmpresa[empresaNome].push(pedido);
                  });

                  return (
                    <div className="space-y-6">
                      {Object.entries(pedidosPorEmpresa).map(([empresaNome, pedidosEmpresa]) => (
                        <div key={empresaNome} className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-bold mb-4 text-primary-purple border-b pb-2">
                            {empresaNome}
                            <span className="ml-2 text-sm font-normal text-gray-600">
                              ({pedidosEmpresa.length} {pedidosEmpresa.length === 1 ? 'pedido' : 'pedidos'})
                            </span>
                          </h3>
                          
                          <div className="space-y-4">
                            {pedidosEmpresa.map((pedido) => {
                              const dataHora = new Date(pedido.created_at);
                              const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                              const horaFormatada = dataHora.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              
                              const totalPedido = pedido.pedido_itens?.reduce((sum, item) => {
                                return sum + (item.preco * item.quantidade);
                              }, 0) || 0;
                              
                              const statusColors = {
                                pendente: 'bg-yellow-100 text-yellow-800',
                                'verificando estoque': 'bg-blue-100 text-blue-800',
                                aprovado: 'bg-green-100 text-green-800',
                                'produto sem estoque': 'bg-orange-100 text-orange-800',
                                rejeitado: 'bg-red-100 text-red-800'
                              };

                              const isExpanded = pedidosExpandidos[pedido.id] || false;
                              const quantidadeItens = pedido.pedido_itens?.length || 0;

                              return (
                                <div 
                                  key={pedido.id} 
                                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() => {
                                    setPedidosExpandidos({
                                      ...pedidosExpandidos,
                                      [pedido.id]: !isExpanded
                                    });
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <p className="font-semibold text-gray-800">
                                          Pedido #{pedido.id}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                          statusColors[pedido.status] || statusColors.pendente
                                        }`}>
                                          {pedido.status?.toUpperCase() || 'PENDENTE'}
                                        </span>
                                        <div className="flex gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                                          {(pedido.status === 'pendente' || pedido.status === 'verificando estoque') && (
                                            <>
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  if (confirm('Deseja aprovar este pedido?')) {
                                                    try {
                                                      await api.put(`/admin/pedidos/${pedido.id}/aprovar`);
                                                      loadData();
                                                      alert('Pedido aprovado com sucesso!');
                                                    } catch (error) {
                                                      alert('Erro ao aprovar pedido');
                                                    }
                                                  }
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors"
                                              >
                                                Aprovar
                                              </button>
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  if (confirm('Deseja rejeitar este pedido?')) {
                                                    try {
                                                      await api.put(`/admin/pedidos/${pedido.id}/rejeitar`);
                                                      loadData();
                                                      alert('Pedido rejeitado');
                                                    } catch (error) {
                                                      alert('Erro ao rejeitar pedido');
                                                    }
                                                  }
                                                }}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                                              >
                                                Rejeitar
                                              </button>
                                            </>
                                          )}
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
                                                try {
                                                  await api.delete(`/admin/pedidos/${pedido.id}`);
                                                  loadData();
                                                  alert('Pedido excluído com sucesso');
                                                } catch (error) {
                                                  alert('Erro ao excluir pedido: ' + (error.response?.data?.error || error.message));
                                                }
                                              }
                                            }}
                                            className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                                          >
                                            Excluir
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Funcionário: {pedido.funcionarios?.nome_completo || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        <strong>Empresa:</strong> {pedido.funcionarios?.empresas?.nome || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        <strong>Cadastro Empresa:</strong> {pedido.funcionarios?.empresas?.cadastro_empresa || pedido.funcionarios?.cadastro_empresa || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        <strong>Clube:</strong> {pedido.funcionarios?.clubes?.nome || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        <strong>Cadastro Clube:</strong> {pedido.funcionarios?.cadastro_clube || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Data: {dataFormatada} às {horaFormatada}
                                      </p>
                                      {!isExpanded && (
                                        <p className="text-sm text-gray-500 mt-2">
                                          {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} • Total: R$ {totalPedido.toFixed(2).replace('.', ',')}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-lg font-bold text-primary-purple">
                                        R$ {totalPedido.toFixed(2).replace('.', ',')}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPedidosExpandidos({
                                            ...pedidosExpandidos,
                                            [pedido.id]: !isExpanded
                                          });
                                        }}
                                        className="mt-2 text-primary-purple hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                            Ocultar detalhes
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Ver detalhes
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {isExpanded && (
                                    <>
                                      <div className="border-t border-gray-200 pt-4 mt-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Itens do Pedido ({quantidadeItens}):</p>
                                        <div className="space-y-2">
                                          {pedido.pedido_itens?.map((item, index) => {
                                            const itemStatus = item.status || 'pendente';
                                            const itemStatusColors = {
                                              pendente: 'bg-yellow-100 text-yellow-800',
                                              'verificando estoque': 'bg-blue-100 text-blue-800',
                                              aprovado: 'bg-green-100 text-green-800',
                                              'produto sem estoque': 'bg-orange-100 text-orange-800',
                                              rejeitado: 'bg-red-100 text-red-800'
                                            };
                                            
                                            return (
                                              <div key={index} className="flex justify-between items-start text-sm bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-800">
                                                      {item.produtos?.nome || 'Produto não encontrado'}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                      itemStatusColors[itemStatus] || itemStatusColors.pendente
                                                    }`}>
                                                      {itemStatus?.toUpperCase() || 'PENDENTE'}
                                                    </span>
                                                  </div>
                                                  {item.variacao && (
                                                    <p className="text-xs text-gray-500 mt-1">Variação: {item.variacao}</p>
                                                  )}
                                                  {item.produtos?.descricao && (
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.produtos.descricao}</p>
                                                  )}
                                                </div>
                                                <div className="text-right ml-4 flex flex-col items-end gap-2">
                                                  <div>
                                                    <p className="text-gray-600">
                                                      {item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}
                                                    </p>
                                                    <p className="font-semibold text-gray-800">
                                                      = R$ {(item.quantidade * item.preco).toFixed(2).replace('.', ',')}
                                                    </p>
                                                  </div>
                                                  {(itemStatus === 'pendente' || itemStatus === 'verificando estoque') && (
                                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                      <button
                                                        onClick={async (e) => {
                                                          e.stopPropagation();
                                                          if (confirm('Deseja aprovar este item?')) {
                                                            try {
                                                              await api.put(`/admin/pedidos/${pedido.id}/itens/${item.id}/aprovar`);
                                                              loadData();
                                                              alert('Item aprovado com sucesso!');
                                                            } catch (error) {
                                                              alert('Erro ao aprovar item');
                                                            }
                                                          }
                                                        }}
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors"
                                                      >
                                                        Aprovar
                                                      </button>
                                                      <button
                                                        onClick={async (e) => {
                                                          e.stopPropagation();
                                                          if (confirm('Deseja rejeitar este item?')) {
                                                            try {
                                                              await api.put(`/admin/pedidos/${pedido.id}/itens/${item.id}/rejeitar`);
                                                              loadData();
                                                              alert('Item rejeitado');
                                                            } catch (error) {
                                                              alert('Erro ao rejeitar item');
                                                            }
                                                          }
                                                        }}
                                                        className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                                                      >
                                                        Rejeitar
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
          </div>
        )}
      </div>
    </div>
  );
}

