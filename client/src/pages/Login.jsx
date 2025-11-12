import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [empresaNumero, setEmpresaNumero] = useState('');
  const [clubeNumero, setClubeNumero] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Determinar qual banner usar
  const bannerSrc = isMobile 
    ? `/banners/banner_mobile.jpeg?t=${Date.now()}`
    : `/banners/banner_site.jpeg?t=${Date.now()}`;

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Banner de fundo cobrindo toda a tela */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      >
        <img 
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
          onLoad={(e) => console.log('✅ Banner carregado com sucesso:', e.target.src)}
        />
      </div>
      
      {/* Card de login centralizado por cima do banner */}
      <div 
        className="relative z-10 w-full max-w-md mx-auto p-4"
        style={{
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full backdrop-blur-sm bg-white/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-purple mb-2">Sloth Empresas</h1>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Empresa
            </label>
            <input
              type="text"
              value={empresaNumero}
              onChange={(e) => setEmpresaNumero(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Clube
            </label>
            <input
              type="text"
              value={clubeNumero}
              onChange={(e) => setClubeNumero(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-purple text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* NÃO ADICIONAR BOTÃO DE ACESSO ADMINISTRATIVO AQUI */}
        </div>
      </div>
    </div>
  );
}

