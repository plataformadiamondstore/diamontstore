import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [empresaNumero, setEmpresaNumero] = useState('');
  const [clubeNumero, setClubeNumero] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Banner na parte superior - responsivo */}
      <div 
        className="w-full flex justify-center overflow-hidden bg-gray-100 min-h-[150px]"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#f3f4f6',
          minHeight: '150px'
        }}
      >
        <img 
          src={`${window.location.origin}/banners/banner-sloth-partners.jpeg?t=${Date.now()}`}
          alt="Sloth Partners Banner" 
          className="w-full h-auto object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[350px]"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            maxHeight: '200px'
          }}
          onError={(e) => {
            console.error('❌ Erro ao carregar banner:', e.target.src);
            // Tentar múltiplos caminhos
            const paths = [
              '/banners/banner-sloth-partners.jpeg',
              './banners/banner-sloth-partners.jpeg',
              `${window.location.origin}/banners/banner-sloth-partners.jpeg`
            ];
            const currentPath = e.target.src.split('?')[0];
            const nextPathIndex = paths.findIndex(p => currentPath.includes(p)) + 1;
            
            if (nextPathIndex < paths.length) {
              console.log('🔄 Tentando próximo caminho:', paths[nextPathIndex]);
              e.target.src = paths[nextPathIndex] + `?t=${Date.now()}`;
            } else {
              // Se todos falharem, mostrar placeholder
              console.log('⚠️ Todos os caminhos falharam, mostrando placeholder');
              e.target.style.display = 'none';
              const placeholder = document.createElement('div');
              placeholder.style.cssText = 'width: 100%; height: 128px; background: linear-gradient(to right, #a78bfa, #7c3aed); display: flex; align-items: center; justify-content: center;';
              placeholder.innerHTML = '<span style="color: white; font-size: 1.25rem; font-weight: bold;">Sloth Partners</span>';
              e.target.parentElement.appendChild(placeholder);
            }
          }}
          onLoad={(e) => console.log('✅ Banner carregado com sucesso:', e.target.src)}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
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

