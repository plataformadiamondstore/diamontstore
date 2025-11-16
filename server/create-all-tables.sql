
-- 1. empresas
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cadastro_empresa VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas(nome);
CREATE INDEX IF NOT EXISTS idx_empresas_cadastro_empresa ON empresas(cadastro_empresa);

-- 2. clubes
CREATE TABLE IF NOT EXISTS clubes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cadastro_clube VARCHAR(255),
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubes_empresa_id ON clubes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_clubes_nome ON clubes(nome);
CREATE INDEX IF NOT EXISTS idx_clubes_cadastro_clube ON clubes(cadastro_clube);

-- 3. gestores
CREATE TABLE IF NOT EXISTS gestores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  clube_id INTEGER REFERENCES clubes(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gestores_empresa_id ON gestores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_gestores_clube_id ON gestores(clube_id);
CREATE INDEX IF NOT EXISTS idx_gestores_usuario ON gestores(usuario);

-- 4. funcionarios
CREATE TABLE IF NOT EXISTS funcionarios (
  id SERIAL PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  cadastro_empresa VARCHAR(255) NOT NULL,
  cadastro_clube VARCHAR(255),
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  clube_id INTEGER REFERENCES clubes(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa_id ON funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_clube_id ON funcionarios(clube_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_cadastro_empresa ON funcionarios(cadastro_empresa);
CREATE INDEX IF NOT EXISTS idx_funcionarios_cadastro_clube ON funcionarios(cadastro_clube);

-- 5. produtos
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  sku VARCHAR(100),
  ean VARCHAR(50),
  estoque INTEGER DEFAULT 0,
  variacoes JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_produtos_ean ON produtos(ean);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque ON produtos(estoque);

-- 6. produto_imagens
CREATE TABLE IF NOT EXISTS produto_imagens (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  url_imagem TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produto_imagens_produto_id ON produto_imagens(produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_imagens_ordem ON produto_imagens(ordem);

-- 7. carrinho
CREATE TABLE IF NOT EXISTS carrinho (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  variacao VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carrinho_funcionario_id ON carrinho(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_produto_id ON carrinho(produto_id);

-- 8. pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_funcionario_id ON pedidos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);

-- 9. pedido_itens
CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  variacao VARCHAR(255),
  preco DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto_id ON pedido_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_status ON pedido_itens(status);

-- 10. categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);

-- 11. marcas
CREATE TABLE IF NOT EXISTS marcas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marcas_nome ON marcas(nome);

-- 12. tamanhos
CREATE TABLE IF NOT EXISTS tamanhos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tamanhos_nome ON tamanhos(nome);

-- 13. configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(255) UNIQUE NOT NULL,
  valor TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);

-- 14. acessos_logs
CREATE TABLE IF NOT EXISTS acessos_logs (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL,
  pagina VARCHAR(255),
  produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
  dispositivo VARCHAR(20) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  sessao_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acessos_logs_funcionario_id ON acessos_logs(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_empresa_id ON acessos_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_tipo_evento ON acessos_logs(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_dispositivo ON acessos_logs(dispositivo);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_created_at ON acessos_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_sessao_id ON acessos_logs(sessao_id);
CREATE INDEX IF NOT EXISTS idx_acessos_logs_produto_id ON acessos_logs(produto_id);

-- 15. funcionarios_uploads
CREATE TABLE IF NOT EXISTS funcionarios_uploads (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  quantidade_funcionarios INTEGER NOT NULL,
  nome_arquivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_uploads_empresa_id ON funcionarios_uploads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_uploads_created_at ON funcionarios_uploads(created_at DESC);

-- Constraints de status
ALTER TABLE pedidos 
DROP CONSTRAINT IF EXISTS pedidos_status_check;

ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_status_check 
CHECK (status IN (
  'pendente',
  'verificando estoque',
  'aguardando aprovação de estoque',
  'produto será entregue em até 7 dias',
  'aprovado',
  'produto sem estoque',
  'rejeitado'
));

ALTER TABLE pedido_itens 
DROP CONSTRAINT IF EXISTS pedido_itens_status_check;

ALTER TABLE pedido_itens 
ADD CONSTRAINT pedido_itens_status_check 
CHECK (status IN (
  'pendente',
  'verificando estoque',
  'aguardando aprovação de estoque',
  'produto será entregue em até 7 dias',
  'aprovado',
  'produto sem estoque',
  'rejeitado'
));
