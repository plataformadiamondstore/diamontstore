import axios from 'axios';

// Configurar baseURL: se VITE_API_URL estiver definido, usar ele + /api, senão usar /api
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Se a URL já termina com /api, não adicionar novamente
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log para debug
console.log('API Configurada:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  baseURL: getBaseURL()
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    // Se a resposta já está bem formatada, retornar como está
    return response;
  },
  (error) => {
    // Tratar erros de resposta
    if (error.response) {
      // Se o erro tem uma resposta do servidor
      return Promise.reject(error);
    } else if (error.request) {
      // Se a requisição foi feita mas não houve resposta
      return Promise.reject(new Error('Sem resposta do servidor'));
    } else {
      // Erro ao configurar a requisição
      return Promise.reject(error);
    }
  }
);

export default api;

