import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validar variáveis de ambiente obrigatórias
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Permitir todas as origens
app.use(cors({
  origin: true, // Permitir todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas
}));

// Log de requisições para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir imagens estáticas - verificar ambas as pastas (raiz e server)
const uploadsPathServer = path.join(__dirname, 'uploads');
const uploadsPathRoot = path.join(__dirname, '..', 'uploads');

// Servir primeiro da pasta server, depois da raiz (fallback)
app.use('/uploads', express.static(uploadsPathServer));
app.use('/uploads', express.static(uploadsPathRoot));

// Supabase Client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sloth Empresas API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Rota pública para buscar link do YouTube (para página de login)
app.get('/api/marketing/youtube', async (req, res) => {
  try {
    console.log('🔍 GET /api/marketing/youtube - Buscando link do YouTube...');
    console.log('   DATABASE_URL configurada?', !!process.env.DATABASE_URL);
    
    // Usar SQL direto para evitar problemas de schema cache do Supabase
    const pg = await import('pg');
    const { Client } = pg.default;
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Beniciocaus3131@db.rslnzomohtvwvhymenjh.supabase.co:5432/postgres';
    
    console.log('   Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));
    
    const client = new Client({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await client.connect();
      console.log('   ✅ Conectado ao banco de dados');
      
      const result = await client.query(
        'SELECT valor FROM configuracoes WHERE chave = $1',
        ['youtube_link']
      );
      
      console.log('   📊 Resultado da query:', {
        rows: result.rows.length,
        valor: result.rows[0]?.valor || '(vazio)'
      });
      
      const youtubeLink = result.rows[0]?.valor || '';
      
      await client.end();
      
      console.log('   ✅ Retornando link:', youtubeLink || '(vazio)');
      res.json({ youtube_link: youtubeLink });
    } catch (dbError) {
      await client.end();
      console.error('   ❌ Erro na query:', dbError.message);
      console.error('   ❌ Código do erro:', dbError.code);
      
      // Se a tabela não existir, retornar vazio
      if (dbError.code === '42P01' || dbError.message.includes('does not exist')) {
        console.warn('   ⚠️  Tabela configuracoes não existe');
        return res.json({ youtube_link: '' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar link do YouTube:', error);
    console.error('   Stack:', error.stack);
    res.json({ youtube_link: '' }); // Retornar vazio em caso de erro para não quebrar a página
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Rota catch-all para 404 (deve vir ANTES do middleware de erros)
app.use((req, res) => {
  console.log(`404 - Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

// Middleware de tratamento de erros global (deve ser o ÚLTIMO)
// Este middleware só é executado se uma rota chamar next(err)
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  console.error('Stack:', err.stack);
  console.error('URL:', req.url);
  console.error('Method:', req.method);
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      url: req.url,
      method: req.method
    })
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Não encerrar o processo imediatamente, permitir que o servidor continue
  // Mas registrar o erro para debug
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  // Não encerrar o processo imediatamente
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 CORS habilitado para todas as origens`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

