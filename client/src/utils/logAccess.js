import api from '../services/api';

// Gerar ID de sessão único
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Detectar dispositivo (mobile ou web)
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  return isMobile ? 'mobile' : 'web';
};

// Registrar log de acesso
export const logAccess = async (funcionarioId, empresaId, tipoEvento, pagina = null, produtoId = null) => {
  try {
    // Não registrar se não houver funcionário logado
    if (!funcionarioId || !empresaId) {
      return;
    }

    const dispositivo = detectDevice();
    const sessaoId = getSessionId();

    await api.post('/admin/indicadores/log', {
      funcionario_id: funcionarioId,
      empresa_id: empresaId,
      tipo_evento: tipoEvento, // 'login', 'acesso_pagina', 'acesso_produto'
      pagina: pagina,
      produto_id: produtoId,
      dispositivo: dispositivo,
      user_agent: navigator.userAgent,
      ip_address: null, // Será capturado no backend se necessário
      sessao_id: sessaoId
    });
  } catch (error) {
    // Não interromper o fluxo se o log falhar
    console.error('Erro ao registrar log de acesso:', error);
  }
};

// Registrar login
export const logLogin = async (funcionarioId, empresaId) => {
  return logAccess(funcionarioId, empresaId, 'login');
};

// Registrar acesso a página
export const logPageAccess = async (funcionarioId, empresaId, pagina) => {
  return logAccess(funcionarioId, empresaId, 'acesso_pagina', pagina);
};

// Registrar acesso a produto
export const logProductAccess = async (funcionarioId, empresaId, produtoId) => {
  return logAccess(funcionarioId, empresaId, 'acesso_produto', null, produtoId);
};

