import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
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

