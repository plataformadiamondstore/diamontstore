import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Logo from '../components/Logo';
import { logPageAccess } from '../utils/logAccess';

export default function Products() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    categoria: '',
    marca: '',
    nome: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [popupInterval, setPopupInterval] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      const widthCheck = window.innerWidth < 768;
      const userAgent = navigator.userAgent || navigator.vendor || '';
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(widthCheck || (isMobileUA && isTouchDevice));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadProducts();
    loadFilters();
  }, [user, page, filters]);

  // Registrar acesso à página de produtos apenas uma vez quando o usuário acessa
  useEffect(() => {
    if (user?.id && user?.empresa_id) {
      logPageAccess(user.id, user.empresa_id, '/produtos');
    }
  }, [user?.id]); // Apenas quando o usuário muda, não a cada mudança de filtros

  // Carregar contador do carrinho separadamente (só quando user mudar)
  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const loadCartCount = async () => {
    try {
      const response = await api.get(`/cart/${user.id}`);
      // Calcular total de itens (soma das quantidades)
      const totalItems = response.data.reduce((sum, item) => sum + item.quantidade, 0);
      setCartItemCount(totalItems);
    } catch (error) {
      console.error('Erro ao carregar quantidade do carrinho:', error);
      setCartItemCount(0);
    }
  };

  const loadFilters = async () => {
    try {
      const [catRes, marRes] = await Promise.all([
        api.get('/products/categorias'),
        api.get('/products/marcas')
      ]);
      setCategorias(catRes.data);
      setMarcas(marRes.data);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { page, ...filters }
      });
      
      console.log('Resposta da API de produtos:', response.data);
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data && response.data.produtos) {
        const produtos = response.data.produtos || [];
        console.log('Produtos carregados:', produtos.length);
        
        // Log detalhado das imagens dos produtos
        produtos.forEach((produto, index) => {
          if (index < 3) { // Log apenas os 3 primeiros para não poluir
            console.log(`📦 Produto ${index + 1} (ID: ${produto.id}):`, {
              nome: produto.nome,
              totalImagens: produto.produto_imagens?.length || 0,
              imagens: produto.produto_imagens?.map(img => ({
                url: img.url_imagem,
                ordem: img.ordem
              })) || []
            });
          }
        });
        
        setProducts(produtos);
        setTotalPages(response.data.paginacao?.totalPages || 1);
      } else {
        console.warn('Resposta da API não tem estrutura esperada:', response.data);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Não limpar produtos em caso de erro - manter os que já estão na tela
      // setProducts([]); // Comentado para não perder produtos em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleAddToCart = async (productId, variacao) => {
    try {
      await api.post('/cart/add', {
        funcionario_id: user.id,
        produto_id: productId,
        quantidade: 1,
        variacao
      });
      // Atualizar contador do carrinho
      loadCartCount();
      
      // Limpar intervalo anterior se existir
      if (popupInterval) {
        clearInterval(popupInterval);
      }
      
      // Mostrar popup imediatamente
      setShowCartPopup(true);
      
      // Criar intervalo que alterna entre mostrar e esconder
      const interval = setInterval(() => {
        setShowCartPopup(prev => !prev);
      }, 60000); // Alterna a cada 1 minuto
      
      setPopupInterval(interval);
    } catch (error) {
      alert('Erro ao adicionar ao carrinho');
      console.error(error);
    }
  };

  // Limpar intervalo quando componente desmontar ou popup for fechado
  useEffect(() => {
    return () => {
      if (popupInterval) {
        clearInterval(popupInterval);
      }
    };
  }, [popupInterval]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - FIXO no mobile */}
      <header 
        className={`bg-white shadow-sm z-50 ${
          isMobile ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <button onClick={() => navigate('/produtos')} className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
              <Logo />
            </button>
            
            {/* Desktop: Nome do usuário e botões */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-700 text-lg font-bold">Olá, {user.nome}</span>
              <div className="relative">
                <button
                  onClick={() => {
                    // Limpar intervalo quando clicar no carrinho
                    if (popupInterval) {
                      clearInterval(popupInterval);
                      setPopupInterval(null);
                    }
                    setShowCartPopup(false);
                    navigate('/carrinho');
                  }}
                  className="relative bg-primary-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Carrinho
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
                
                {/* Popup abaixo do carrinho */}
                <div className={`absolute top-full right-0 mt-3 z-[100] transition-all duration-300 ${showCartPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <div className="relative bg-gradient-to-br from-primary-purple via-purple-600 to-purple-700 text-white rounded-xl shadow-2xl p-5 min-w-[320px] max-w-[380px] border-2 border-purple-300 transform transition-all duration-300 hover:shadow-purple-500/50">
                      {/* Seta apontando para o botão */}
                      <div className="absolute -top-3 right-8 w-6 h-6 bg-gradient-to-br from-primary-purple to-purple-600 transform rotate-45 border-l-2 border-t-2 border-purple-300"></div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base mb-3 text-white">Produto adicionado ao carrinho!</p>
                          <button
                            onClick={() => {
                              // Limpar intervalo quando clicar no popup
                              if (popupInterval) {
                                clearInterval(popupInterval);
                                setPopupInterval(null);
                              }
                              setShowCartPopup(false);
                              navigate('/carrinho');
                            }}
                            className="bg-white text-primary-purple font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all duration-200 text-sm text-center shadow-md hover:shadow-lg transform hover:scale-[1.02] w-full"
                          >
                            Clique aqui para finalizar seu pedido
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            // Limpar intervalo quando fechar
                            if (popupInterval) {
                              clearInterval(popupInterval);
                              setPopupInterval(null);
                            }
                            setShowCartPopup(false);
                          }}
                          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                          aria-label="Fechar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/pedidos')}
                className="text-gray-700 hover:text-primary-purple transition-colors"
              >
                Meus Pedidos
              </button>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-primary-purple transition-colors"
              >
                Sair
              </button>
            </div>

            {/* Mobile: Carrinho e Menu Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {/* Carrinho Mobile */}
              <div className="relative">
                <button
                  onClick={() => {
                    // Limpar intervalo quando clicar no carrinho
                    if (popupInterval) {
                      clearInterval(popupInterval);
                      setPopupInterval(null);
                    }
                    setShowCartPopup(false);
                    navigate('/carrinho');
                  }}
                  className="relative bg-primary-purple text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
                
                {/* Popup Mobile - ajustado para mobile */}
                <div className={`absolute top-full right-0 mt-2 z-[100] transition-all duration-300 ${showCartPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <div className="relative bg-gradient-to-br from-primary-purple via-purple-600 to-purple-700 text-white rounded-xl shadow-2xl p-4 w-[280px] border-2 border-purple-300">
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-gradient-to-br from-primary-purple to-purple-600 transform rotate-45 border-l-2 border-t-2 border-purple-300"></div>
                      
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm mb-2 text-white">Produto adicionado!</p>
                          <button
                            onClick={() => {
                              if (popupInterval) {
                                clearInterval(popupInterval);
                                setPopupInterval(null);
                              }
                              setShowCartPopup(false);
                              navigate('/carrinho');
                            }}
                            className="bg-white text-primary-purple font-semibold py-1.5 px-3 rounded-lg hover:bg-purple-50 transition-all duration-200 text-xs text-center shadow-md w-full"
                          >
                            Finalizar pedido
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (popupInterval) {
                              clearInterval(popupInterval);
                              setPopupInterval(null);
                            }
                            setShowCartPopup(false);
                          }}
                          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                </div>
              </div>

              {/* Menu Hamburger */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 hover:text-primary-purple transition-colors"
                aria-label="Menu"
              >
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200 animate-fade-in">
              <div className="px-2 py-2 space-y-1">
                {/* Nome do usuário no mobile */}
                <div className="px-3 py-2 text-gray-700 font-semibold text-sm border-b border-gray-200 mb-2">
                  Olá, {user.nome}
                </div>
                
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate('/pedidos');
                  }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-purple rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Meus Pedidos
                </button>
                
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Container principal - com scroll independente no mobile */}
      <div 
        className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8"
        style={isMobile ? {
          paddingTop: '140px', // Espaço para header fixo (~80px) + filtros fixos (~60px)
          minHeight: 'calc(100vh - 140px)',
          height: 'auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        } : {
          paddingTop: '1rem',
          paddingBottom: '2rem'
        }}
      >
        {/* Filters - FIXO no mobile, logo abaixo do header */}
        <div
          className={isMobile ? 'fixed top-[80px] left-0 right-0 z-40 bg-white shadow-sm' : ''}
          style={isMobile ? {
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            zIndex: 40,
            width: '100%'
          } : {}}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <Filters
              categorias={categorias}
              marcas={marcas}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Container de produtos */}
        <div style={isMobile ? {} : { paddingTop: '1rem' }}>
          {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum produto encontrado</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

