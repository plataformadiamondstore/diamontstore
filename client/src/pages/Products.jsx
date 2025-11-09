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
      setProducts(response.data.produtos);
      setTotalPages(response.data.paginacao.totalPages);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
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
      alert('Produto adicionado ao carrinho!');
      // Atualizar contador do carrinho
      loadCartCount();
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
              <button
                onClick={() => navigate('/carrinho')}
                className="relative bg-primary-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Carrinho
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
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

