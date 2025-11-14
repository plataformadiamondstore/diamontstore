import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { logProductAccess } from '../utils/logAccess';

export default function ProductCard({ product, onAddToCart }) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState('');
  const isProcessingRef = useRef(false); // Flag para evitar múltiplos cliques simultâneos
  
  // Resetar seleção quando o produto mudar
  useEffect(() => {
    setVariacaoSelecionada('');
    setCurrentImageIndex(0);
  }, [product.id]);
  
  // Usar imagens da tabela produto_imagens ou fallback para imagens antigas (JSONB)
  const images = product.produto_imagens && product.produto_imagens.length > 0
    ? product.produto_imagens
        .filter(img => img && img.url_imagem) // Filtrar imagens inválidas
        .map(img => img.url_imagem)
        .sort((a, b) => {
          // Ordenar por ordem se disponível
          const imgA = product.produto_imagens.find(i => i.url_imagem === a);
          const imgB = product.produto_imagens.find(i => i.url_imagem === b);
          return (imgA?.ordem || 0) - (imgB?.ordem || 0);
        })
    : (product.imagens || []);
  
  // Log para debug se não houver imagens
  if (images.length === 0 && product.nome) {
    console.warn(`Produto "${product.nome}" (ID: ${product.id}) não possui imagens:`, {
      produto_imagens: product.produto_imagens,
      imagens: product.imagens
    });
  }
  
  const variacoes = product.variacoes || [];
  
  // Verificar se o botão deve estar habilitado
  // Se não houver variações, está habilitado. Se houver, só habilita se uma variação foi selecionada
  const botaoHabilitado = variacoes.length === 0 || variacaoSelecionada !== '';

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = (e) => {
    // Prevenir propagação do evento
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevenir múltiplos cliques simultâneos
    if (isProcessingRef.current) {
      console.log('⚠️ Clique ignorado - já processando...', {
        produtoId: product.id,
        produtoNome: product.nome
      });
      return;
    }

    isProcessingRef.current = true;

    // Registrar acesso ao produto ANTES de adicionar ao carrinho
    if (user?.id && user?.empresa_id && product?.id) {
      console.log('📝 [ProductCard] Registrando acesso ao produto:', {
        produtoId: product.id,
        produtoNome: product.nome,
        funcionarioId: user.id,
        empresaId: user.empresa_id,
        timestamp: new Date().toISOString()
      });
      logProductAccess(user.id, user.empresa_id, product.id);
    } else {
      console.warn('⚠️ [ProductCard] Não foi possível registrar log - dados faltando:', {
        temUser: !!user,
        temUserId: !!user?.id,
        temEmpresaId: !!user?.empresa_id,
        temProductId: !!product?.id
      });
    }

    // Adicionar ao carrinho
    onAddToCart(product.id, variacaoSelecionada || null);
    
    // Resetar seleção de variação após adicionar (se houver variações)
    if (variacoes.length > 0) {
      setVariacaoSelecionada('');
    }

    // Liberar flag após um pequeno delay para evitar cliques muito rápidos
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1000); // 1 segundo
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={product.nome}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem do produto:', {
                  produtoId: product.id,
                  produtoNome: product.nome,
                  url: images[currentImageIndex],
                  todasUrls: images
                });
                // Tentar próxima imagem se houver
                if (images.length > currentImageIndex + 1) {
                  setCurrentImageIndex(currentImageIndex + 1);
                } else {
                  // Se não houver mais imagens, mostrar placeholder
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">Imagem não disponível</div>';
                }
              }}
              onLoad={() => {
                console.log('✅ Imagem do produto carregada:', {
                  produtoId: product.id,
                  url: images[currentImageIndex]
                });
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sem imagem
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.nome}</h3>
        {product.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.descricao}</p>
        )}
        <p className="text-2xl font-bold text-primary-purple mb-4">
          R$ {parseFloat(product.preco).toFixed(2).replace('.', ',')}
        </p>

        {variacoes.length > 0 && (
          <select
            value={variacaoSelecionada}
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
            onChange={(e) => {
              setVariacaoSelecionada(e.target.value);
            }}
          >
            <option value="">Selecione uma opção</option>
            {variacoes.map((v, idx) => (
              <option key={idx} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart(e);
          }}
          disabled={!botaoHabilitado}
          className={`w-full py-2 rounded-lg font-semibold transition-colors ${
            botaoHabilitado
              ? 'bg-primary-purple text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

