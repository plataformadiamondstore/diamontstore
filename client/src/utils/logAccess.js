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

// Verificar se já foi registrado nesta sessão
const getLogKey = (funcionarioId, tipoEvento, pagina, produtoId) => {
  if (produtoId) {
    return `log_${funcionarioId}_${tipoEvento}_produto_${produtoId}`;
  } else if (pagina) {
    return `log_${funcionarioId}_${tipoEvento}_pagina_${pagina}`;
  } else {
    return `log_${funcionarioId}_${tipoEvento}`;
  }
};

// Registrar log de acesso
export const logAccess = async (funcionarioId, empresaId, tipoEvento, pagina = null, produtoId = null) => {
  try {
    // Não registrar se não houver funcionário logado
    if (!funcionarioId || !empresaId) {
      console.log('❌ Log não registrado: funcionário ou empresa não informados');
      return;
    }

    // Verificar se já foi registrado nesta sessão
    const logKey = getLogKey(funcionarioId, tipoEvento, pagina, produtoId);
    const alreadyLogged = sessionStorage.getItem(logKey);
    
    if (alreadyLogged) {
      // Já foi registrado nesta sessão, não registrar novamente
      console.log('⏭️ Log já registrado nesta sessão, ignorando:', {
        logKey,
        tipoEvento,
        produtoId,
        pagina
      });
      return;
    }

    console.log('✅ Registrando novo log:', {
      logKey,
      tipoEvento,
      produtoId,
      pagina,
      funcionarioId,
      empresaId
    });

    // IMPORTANTE: Marcar como registrado ANTES da chamada assíncrona
    // Isso previne condição de corrida quando múltiplos componentes chamam simultaneamente
    sessionStorage.setItem(logKey, Date.now().toString());

    const dispositivo = detectDevice();
    const sessaoId = getSessionId();

    const response = await api.post('/admin/indicadores/log', {
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

    console.log('✅ Log registrado com sucesso no backend:', {
      logId: response.data?.log?.id,
      tipoEvento,
      produtoId
    });

    // Limpar logs antigos (mais de 30 minutos)
    setTimeout(() => {
      sessionStorage.removeItem(logKey);
    }, 30 * 60 * 1000); // 30 minutos
  } catch (error) {
    // Se houver erro, remover a marcação para permitir nova tentativa
    const logKey = getLogKey(funcionarioId, tipoEvento, pagina, produtoId);
    sessionStorage.removeItem(logKey);
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

