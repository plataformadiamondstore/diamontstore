import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Logo from '../components/Logo';

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

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadProducts();
    loadFilters();
  }, [user, page, filters]);

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
        setProducts(response.data.produtos || []);
        setTotalPages(response.data.paginacao?.totalPages || 1);
        console.log('Produtos carregados:', response.data.produtos.length);
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
      // Mostrar popup
      setShowCartPopup(true);
      // Esconder popup após 5 segundos
      setTimeout(() => {
        setShowCartPopup(false);
      }, 5000);
    } catch (error) {
      alert('Erro ao adicionar ao carrinho');
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/produtos')} className="cursor-pointer hover:opacity-80 transition-opacity">
              <Logo />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 text-lg font-bold">Olá, {user.nome}</span>
              <div className="relative">
                <button
                  onClick={() => {
                    navigate('/carrinho');
                    setShowCartPopup(false);
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
                {showCartPopup && (
                  <div className="absolute top-full right-0 mt-2 z-50 animate-fade-in">
                    <div className="bg-gradient-to-r from-primary-purple to-purple-600 text-white rounded-lg shadow-2xl p-4 min-w-[280px] transform transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">Produto adicionado!</p>
                          <button
                            onClick={() => {
                              navigate('/carrinho');
                              setShowCartPopup(false);
                            }}
                            className="text-white text-sm underline hover:no-underline font-medium w-full text-left"
                          >
                            Clique aqui para finalizar seu pedido
                          </button>
                        </div>
                        <button
                          onClick={() => setShowCartPopup(false)}
                          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Seta apontando para o botão */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-primary-purple transform rotate-45"></div>
                  </div>
                )}
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Filters
          categorias={categorias}
          marcas={marcas}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

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
  );
}

