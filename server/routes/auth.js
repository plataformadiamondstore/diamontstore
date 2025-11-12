import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Login de funcionário
router.post('/employee', async (req, res) => {
  try {
    console.log('🔐 Requisição de login recebida:', req.body);
    const { empresa_numero, clube_numero } = req.body;

    if (!empresa_numero || !clube_numero) {
      console.log('❌ Dados incompletos:', { empresa_numero, clube_numero });
      return res.status(400).json({ error: 'Número da empresa e clube são obrigatórios' });
    }

    console.log('🔍 Buscando funcionário no banco...');
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*, empresas(*), clubes(*)')
      .eq('cadastro_empresa', empresa_numero)
      .eq('cadastro_clube', clube_numero)
      .single();

    if (error) {
      console.log('❌ Erro na busca:', error);
      console.log('📋 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!data) {
      console.log('❌ Funcionário não encontrado');
      console.log('📋 Parâmetros da busca:', { empresa_numero, clube_numero });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Login bem-sucedido para:', data.nome_completo);
    res.json({
      success: true,
      funcionario: {
        id: data.id,
        nome: data.nome_completo,
        empresa_id: data.empresa_id,
        clube_id: data.clube_id,
        cadastro_empresa: data.cadastro_empresa,
        cadastro_clube: data.cadastro_clube
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login de admin/gestor
router.post('/admin', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    // Verificar se é admin master
    if (usuario === 'slothempresasadmin' && senha === 'cafedomacaco') {
      return res.json({
        success: true,
        tipo: 'master',
        usuario: usuario
      });
    }

    // Verificar se é gestor
    const { data, error } = await supabase
      .from('gestores')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({
      success: true,
      tipo: 'gestor',
      gestor: {
        id: data.id,
        nome: data.nome,
        usuario: data.usuario,
        empresa_id: data.empresa_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

