import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [empresaNumero, setEmpresaNumero] = useState('');
  const [clubeNumero, setClubeNumero] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [containerHeight, setContainerHeight] = useState('auto');
  const loginCardRef = useRef(null);
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Detectar se é mobile - INICIALIZAR CORRETAMENTE
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Verificar imediatamente ao montar
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Buscar link do YouTube
  useEffect(() => {
    const loadYoutubeLink = async () => {
      try {
        const response = await api.get('/marketing/youtube?' + Date.now());
        setYoutubeLink(response.data?.youtube_link || '');
      } catch (error) {
        console.error('Erro ao carregar link do YouTube:', error);
        setYoutubeLink('');
      }
    };
    loadYoutubeLink();
    
    // Recarregar o link a cada 5 segundos para verificar atualizações
    const interval = setInterval(loadYoutubeLink, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calcular altura do container baseado no card de login
  useEffect(() => {
    if (isMobile && loginCardRef.current) {
      const updateHeight = () => {
        if (loginCardRef.current) {
          const card = loginCardRef.current;
          const cardTop = card.offsetTop;
          const cardHeight = card.offsetHeight;
          // Altura necessária = posição do card + altura do card + padding inferior
          const neededHeight = cardTop + cardHeight + 40; // 40px de padding inferior
          setContainerHeight(`${neededHeight}px`);
        }
      };

      // Atualizar após renderização
      const timeoutId = setTimeout(updateHeight, 200);
      
      // Atualizar ao redimensionar
      window.addEventListener('resize', updateHeight);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateHeight);
      };
    } else {
      setContainerHeight('100vh');
    }
  }, [isMobile, youtubeLink]);

  // Redirecionar para home se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      if (user.tipo === 'master') {
        navigate('/adm/dashboard');
      } else if (user.tipo === 'gestor') {
        navigate('/adm/gestor');
      } else {
        navigate('/produtos');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentando fazer login...', { empresa_numero: empresaNumero, clube_numero: clubeNumero });
      console.log('API Base URL:', import.meta.env.VITE_API_URL || '/api');
      console.log('URL completa será:', `${import.meta.env.VITE_API_URL || '/api'}/auth/employee`);
      
      const response = await api.post('/auth/employee', {
        empresa_numero: empresaNumero,
        clube_numero: clubeNumero
      }, {
        timeout: 10000 // 10 segundos de timeout
      });

      console.log('Resposta recebida:', response.data);

      if (response.data.success) {
        login(response.data.funcionario);
        navigate('/produtos');
      } else {
        setError('Resposta inválida do servidor');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      console.error('Erro completo:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });
      
      if (err.code === 'ECONNABORTED') {
        setError('Tempo limite excedido. Verifique se o servidor está rodando.');
      } else if (err.message === 'Sem resposta do servidor') {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.');
      } else {
        setError(err.response?.data?.error || err.message || 'Erro ao fazer login');
      }
      setLoading(false);
    }
  };

  // Determinar qual banner usar - DESKTOP USA banner_site.jpeg, MOBILE USA banner_mobile.jpeg
  const bannerSrc = isMobile 
    ? `/banners/banner_mobile.jpeg?t=${Date.now()}`
    : `/banners/banner_site.jpeg?t=${Date.now()}`;

  // Converter link do YouTube para formato embed
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    
    // Extrair ID do vídeo de diferentes formatos de URL do YouTube
    let videoId = '';
    
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    if (!videoId) return '';
    
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(youtubeLink);

  return (
    <div 
      className={`relative flex flex-col items-center ${
        isMobile ? 'justify-start' : 'justify-center'
      }`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? containerHeight : '100vh',
        height: isMobile ? containerHeight : 'auto',
        overflowY: isMobile ? 'auto' : 'visible',
        overflowX: 'hidden'
      }}
    >
      {/* Banner de fundo cobrindo toda a tela */}
      <div 
        className={isMobile ? "absolute inset-0 w-full h-full" : "fixed inset-0 w-screen h-screen"}
        style={{
          position: isMobile ? 'absolute' : 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <img 
          key={`banner-${isMobile ? 'mobile' : 'desktop'}`}
          src={bannerSrc}
          alt="Banner de Login" 
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => {
            console.error('❌ Erro ao carregar banner:', e.target.src);
            // Fallback para gradiente se o banner não carregar
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)';
          }}
          onLoad={(e) => console.log('✅ Banner carregado:', isMobile ? 'MOBILE' : 'DESKTOP', e.target.src)}
        />
      </div>
      
      {/* Container para YouTube e Login lado a lado no desktop */}
      <div 
        className={`relative z-10 w-full ${
          isMobile ? 'flex flex-col' : 'flex flex-row items-stretch justify-center gap-6'
        }`}
        style={{
          position: 'relative',
          zIndex: 10,
          ...(isMobile ? {} : { marginTop: '35vh', paddingTop: '2rem', paddingLeft: '10%', paddingRight: '10%' })
        }}
      >
        {/* Vídeo do YouTube (se houver) */}
        {youtubeEmbedUrl && (
          <div 
            className={`relative mb-6 ${
              isMobile ? 'w-full max-w-full px-3 mx-auto' : 'w-2/3 max-w-2xl flex-shrink-0'
            }`}
            style={{
              ...(isMobile && { marginTop: '64vh' })
            }}
          >
            <div className={`bg-black/80 rounded-xl shadow-2xl ${
              isMobile ? 'p-1' : 'p-2'
            }`}>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  key={youtubeEmbedUrl || 'no-video'}
                  src={youtubeEmbedUrl || ''}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Vídeo do YouTube"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Card de login ao lado direito do YouTube no desktop */}
        <div 
          ref={loginCardRef}
          className={`relative flex justify-center ${
            isMobile ? 'w-full max-w-md mx-auto px-3 mt-[0vh]' : 'w-1/3 max-w-md flex-shrink-0 flex flex-col'
          }`}
          style={{
            position: 'relative',
            zIndex: 10,
            ...(!isMobile && { marginTop: 0, height: '100%', display: 'flex', flexDirection: 'column' })
          }}
        >
        <div className={`rounded-2xl shadow-2xl backdrop-blur-md border-2 ${
          isMobile 
            ? 'p-5 w-full max-w-[320px] bg-white/30 border-white/50' 
            : 'p-4 w-full bg-white/20 border-white/40 flex-1 flex flex-col'
        }`}
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.3)' : 'rgba(240, 248, 255, 0.35)',
          ...(!isMobile && { height: '100%', display: 'flex', flexDirection: 'column' })
        }}>
        <div className={`text-center ${isMobile ? 'mb-5' : 'mb-4'} rounded-lg ${isMobile ? 'p-4' : 'p-3'}`}
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h1 className={`font-bold text-primary-purple mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Sloth Empresas
          </h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-6'}>
          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Número da Empresa
            </label>
            <input
              type="text"
              value={empresaNumero}
              onChange={(e) => setEmpresaNumero(e.target.value)}
              className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent ${
                isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Número do Clube
            </label>
            <input
              type="text"
              value={clubeNumero}
              onChange={(e) => setClubeNumero(e.target.value)}
              className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent ${
                isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
              required
            />
          </div>

          {error && (
            <div className={`bg-red-50 border border-red-200 text-red-700 rounded-lg ${
              isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMobile 
                ? 'py-2.5 text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                : 'py-3'
            }`}
            style={{
              backgroundColor: loading ? '#9333ea' : '#9333ea',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* NÃO ADICIONAR BOTÃO DE ACESSO ADMINISTRATIVO AQUI */}
        </div>
        </div>
      </div>
    </div>
  );
}

