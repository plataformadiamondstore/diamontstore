import axios from 'axios';

// Configurar baseURL: se VITE_API_URL estiver definido, usar ele + /api, senão usar /api
const getBaseURL = () => {
  // PRIMEIRO: Verificar se VITE_API_URL está configurada
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl && envUrl.trim() !== '') {
    // Se a URL já termina com /api, não adicionar novamente
    const finalUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    console.log('✅ Usando VITE_API_URL:', finalUrl);
    return finalUrl;
  }
  
  // SEGUNDO: Se não tiver VITE_API_URL, verificar se está em produção
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    console.log('🔍 Hostname detectado:', hostname);
    
    // Se não for localhost, SEMPRE usar api.slothempresas.com.br
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost')) {
      const apiUrl = 'https://api.slothempresas.com.br/api';
      console.warn('⚠️ VITE_API_URL não configurada! FORÇANDO uso de produção:', apiUrl);
      return apiUrl;
    }
  }
  
  // TERCEIRO: Fallback para desenvolvimento local
  console.log('🔧 Usando API local: /api');
  return '/api';
};

// FORÇAR baseURL ANTES de criar a instância
const baseURL = getBaseURL();

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verificar se baseURL está correto
if (typeof window !== 'undefined' && window.location) {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost')) {
    if (!baseURL.includes('api.slothempresas.com.br')) {
      console.error('❌ ERRO CRÍTICO: baseURL incorreto!');
      console.error('   Hostname:', hostname);
      console.error('   baseURL atual:', baseURL);
      console.error('   baseURL esperado: https://api.slothempresas.com.br/api');
    } else {
      console.log('✅ baseURL correto para produção:', baseURL);
    }
  }
}

// Log para debug - usar a mesma baseURL já calculada
console.log('🔧 API Configurada:', {
  VITE_API_URL: import.meta.env.VITE_API_URL || '(não configurada)',
  hostname: typeof window !== 'undefined' && window.location ? window.location.hostname : 'N/A',
  baseURL: baseURL,
  'URL completa exemplo': `${baseURL}/auth/employee`
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
      'URL completa': error.config?.baseURL + error.config?.url,
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
