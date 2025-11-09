import axios from 'axios';

// Configurar baseURL: se VITE_API_URL estiver definido, usar ele + /api, senão usar /api
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Se a URL já termina com /api, não adicionar novamente
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Fallback: se estiver em produção (não localhost), usar o domínio da API
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Se não for localhost, assumir que está em produção
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // SEMPRE usar api.slothempresas.com.br em produção
      const apiUrl = 'https://api.slothempresas.com.br/api';
      console.log('🔧 Usando API de produção:', apiUrl);
      return apiUrl;
    }
  }
  
  console.log('🔧 Usando API local: /api');
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log para debug - FORÇAR URL DE PRODUÇÃO
const finalBaseURL = getBaseURL();
console.log('🔧 API Configurada:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
  baseURL: finalBaseURL,
  'URL completa exemplo': `${finalBaseURL}/auth/employee`
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    // Se a resposta já está bem formatada, retornar como está
    return response;
  },
  (error) => {
    // Tratar erros de resposta
    console.error('❌ Erro na API:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response) {
      // Se o erro tem uma resposta do servidor
      return Promise.reject(error);
    } else if (error.request) {
      // Se a requisição foi feita mas não houve resposta
      console.error('❌ Sem resposta do servidor. URL tentada:', error.config?.baseURL + error.config?.url);
      return Promise.reject(new Error('Sem resposta do servidor'));
    } else {
      // Erro ao configurar a requisição
      return Promise.reject(error);
    }
  }
);

export default api;

