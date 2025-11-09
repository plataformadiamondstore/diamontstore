import axios from 'axios';

// 🔥 FORÇA URL CORRETA - DETECÇÃO PRIORITÁRIA DE PRODUÇÃO
// Se estiver em produção (não localhost), SEMPRE usar api.slothempresas.com.br
const getBaseURL = () => {
  // Verificar hostname PRIMEIRO - mais confiável que variável de ambiente
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && 
                         hostname !== '127.0.0.1' && 
                         !hostname.includes('localhost');
    
    // Se estiver em produção, FORÇAR api.slothempresas.com.br (IGNORAR VITE_API_URL se estiver errado)
    if (isProduction) {
      const envUrl = import.meta.env.VITE_API_URL;
      // Se VITE_API_URL estiver configurada E for a URL correta, usar ela
      if (envUrl && envUrl.trim() !== '' && envUrl.includes('api.slothempresas.com.br')) {
        const finalUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
        console.log('✅ Usando VITE_API_URL (correta):', finalUrl);
        return finalUrl;
      }
      // Caso contrário, FORÇAR URL correta independente de VITE_API_URL
      const apiUrl = 'https://api.slothempresas.com.br/api';
      console.log('🔥 PRODUÇÃO DETECTADA - FORÇANDO URL CORRETA:', apiUrl);
      console.log('   Hostname:', hostname);
      console.log('   VITE_API_URL:', envUrl || '(não configurada ou incorreta)');
      return apiUrl;
    }
  }
  
  // Desenvolvimento local - usar VITE_API_URL se configurada, senão /api
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const finalUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    console.log('✅ Desenvolvimento - Usando VITE_API_URL:', finalUrl);
    return finalUrl;
  }
  
  console.log('🔧 Desenvolvimento local - usando /api');
  return '/api';
};

// FORÇAR baseURL - SEMPRE EXECUTAR
let baseURL = getBaseURL();

// VALIDAÇÃO FINAL - Se estiver em produção e baseURL estiver errado, CORRIGIR
if (typeof window !== 'undefined' && window.location) {
  const hostname = window.location.hostname;
  const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost');
  
  if (isProduction) {
    // Se baseURL não contém api.slothempresas.com.br, FORÇAR CORREÇÃO
    if (!baseURL.includes('api.slothempresas.com.br')) {
      console.error('🚨 ERRO CRÍTICO: baseURL incorreto em produção!');
      console.error('   Hostname:', hostname);
      console.error('   baseURL incorreto:', baseURL);
      baseURL = 'https://api.slothempresas.com.br/api';
      console.error('   ✅ baseURL CORRIGIDO para:', baseURL);
    }
  }
}

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

// Interceptor para REQUISIÇÕES - FORÇAR URL CORRETA
api.interceptors.request.use(
  (config) => {
    // Se estiver em produção, SEMPRE FORÇAR URL CORRETA
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost');
      
      if (isProduction) {
        // Se baseURL for relativo (/api) ou não contém api.slothempresas.com.br, FORÇAR CORREÇÃO
        const currentBaseURL = config.baseURL || '';
        const isRelative = currentBaseURL.startsWith('/') || currentBaseURL === '';
        const isWrongDomain = !currentBaseURL.includes('api.slothempresas.com.br');
        
        if (isRelative || isWrongDomain) {
          console.error('🚨 INTERCEPTOR: URL incorreta detectada!');
          console.error('   Hostname:', hostname);
          console.error('   baseURL incorreto:', currentBaseURL);
          console.error('   É relativo?', isRelative);
          config.baseURL = 'https://api.slothempresas.com.br/api';
          console.error('   ✅ baseURL CORRIGIDO para:', config.baseURL);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    // Se a resposta já está bem formatada, retornar como está
    return response;
  },
  (error) => {
    // Tratar erros de resposta
    const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
    console.error('❌ Erro na API:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      'URL completa': fullUrl,
      status: error.response?.status,
      message: error.message
    });
    
    // Se o erro for 404 e a URL não contém api.slothempresas.com.br, avisar
    if (error.response?.status === 404 && !fullUrl.includes('api.slothempresas.com.br')) {
      console.error('🚨 ERRO 404: URL incorreta! Deveria ser api.slothempresas.com.br');
      console.error('   URL tentada:', fullUrl);
      console.error('   URL correta:', `https://api.slothempresas.com.br/api${error.config?.url || ''}`);
    }
    
    if (error.response) {
      // Se o erro tem uma resposta do servidor
      return Promise.reject(error);
    } else if (error.request) {
      // Se a requisição foi feita mas não houve resposta
      console.error('❌ Sem resposta do servidor. URL tentada:', fullUrl);
      return Promise.reject(new Error('Sem resposta do servidor'));
    } else {
      // Erro ao configurar a requisição
      return Promise.reject(error);
    }
  }
);

export default api;
