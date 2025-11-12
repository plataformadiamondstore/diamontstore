# Documentação de Configuração do YouTube - Tela de Login

## Data de Criação
28 de Janeiro de 2025

## Visão Geral
Este documento descreve a funcionalidade de configuração e exibição de vídeos do YouTube na tela de login da aplicação Sloth Empresas.

---

## 1. Funcionalidade

### Objetivo
Permitir que administradores configurem um vídeo do YouTube para ser exibido na tela de login, tanto na versão mobile quanto desktop.

### Localização
- **Configuração**: `adm/dashboard` → Aba "Marketing"
- **Exibição**: Tela de Login (`client/src/pages/Login.jsx`)

---

## 2. Interface de Configuração (Admin Dashboard)

### Localização
- **Arquivo**: `client/src/pages/admin/AdminDashboard.jsx`
- **Aba**: "Marketing"
- **Rota**: `/adm/dashboard` (apenas para usuários tipo `master`)

### Componentes da Interface

#### 2.1. Campo de Input
- **Tipo**: Text input
- **Placeholder**: "Cole o link do YouTube aqui (ex: https://www.youtube.com/watch?v=...)"
- **Validação**: Link obrigatório antes de salvar
- **Estado**: `youtubeLink` (string)

#### 2.2. Botão de Salvar
- **Texto**: "Salvar Link" / "Salvando..." (quando loading)
- **Estado de Loading**: `youtubeLinkLoading` (boolean)
- **Desabilitado quando**: Link vazio ou durante salvamento

#### 2.3. Preview do Vídeo
- **Posição**: Lado direito do formulário (grid 2 colunas)
- **Aspect Ratio**: 16:9 (56.25% padding-bottom)
- **Comportamento**: 
  - Mostra preview se houver link configurado
  - Mostra mensagem "Nenhum vídeo configurado" se vazio

### Código da Interface
```javascript
{activeTab === 'marketing' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Configurar Vídeo</h3>
        <input
          type="text"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          placeholder="Cole o link do YouTube aqui..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={async () => {
            if (!youtubeLink || youtubeLink.trim() === '') {
              alert('Por favor, insira um link do YouTube');
              return;
            }
            setYoutubeLinkLoading(true);
            try {
              const response = await api.post('/admin/marketing/youtube', {
                youtube_link: youtubeLink.trim()
              });
              alert('Link do YouTube salvo com sucesso!');
            } catch (error) {
              alert('Erro ao salvar link do YouTube: ' + (error.response?.data?.error || error.message));
            } finally {
              setYoutubeLinkLoading(false);
            }
          }}
          disabled={youtubeLinkLoading || !youtubeLink || youtubeLink.trim() === ''}
        >
          {youtubeLinkLoading ? 'Salvando...' : 'Salvar Link'}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Preview do Vídeo</h3>
        {/* Preview do iframe do YouTube */}
      </div>
    </div>
  </div>
)}
```

---

## 3. Backend - API Routes

### 3.1. Salvar Link do YouTube

#### Rota
- **Método**: `POST`
- **Endpoint**: `/admin/marketing/youtube`
- **Autenticação**: Requerida (apenas master)
- **Arquivo**: `server/routes/admin.js`

#### Request Body
```json
{
  "youtube_link": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

#### Validação
- Link não pode ser vazio
- Link deve ser uma string válida

#### Processamento
1. Valida se o link foi fornecido
2. Conecta ao banco de dados PostgreSQL diretamente (evita cache do Supabase)
3. Verifica se já existe configuração com chave `youtube_link`
4. Se existe: Atualiza o valor
5. Se não existe: Insere novo registro
6. Retorna sucesso ou erro

#### Código Backend
```javascript
router.post('/marketing/youtube', async (req, res) => {
  try {
    const { youtube_link } = req.body;
    
    if (!youtube_link || (typeof youtube_link === 'string' && youtube_link.trim() === '')) {
      return res.status(400).json({ error: 'Link do YouTube é obrigatório' });
    }
    
    // Usar SQL direto para evitar problemas de schema cache do Supabase
    const pg = await import('pg');
    const { Client } = pg.default;
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    // Verificar se já existe
    const checkResult = await client.query(
      'SELECT id FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );
    
    if (checkResult.rows.length > 0) {
      // Atualizar
      await client.query(
        'UPDATE configuracoes SET valor = $1, updated_at = NOW() WHERE chave = $2',
        [youtube_link.trim(), 'youtube_link']
      );
    } else {
      // Inserir
      await client.query(
        'INSERT INTO configuracoes (chave, valor) VALUES ($1, $2)',
        ['youtube_link', youtube_link.trim()]
      );
    }
    
    await client.end();
    res.json({ success: true, message: 'Link do YouTube salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar link do YouTube:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3.2. Buscar Link do YouTube

#### Rota
- **Método**: `GET`
- **Endpoint**: `/admin/marketing/youtube` (admin) ou `/marketing/youtube` (público)
- **Arquivo**: `server/routes/admin.js` e `server/index.js`

#### Response
```json
{
  "youtube_link": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

#### Comportamento
- Retorna link vazio se não houver configuração
- Retorna link vazio se a tabela não existir (erro tratado)
- Usa PostgreSQL direto para evitar cache

#### Código Backend
```javascript
router.get('/marketing/youtube', async (req, res) => {
  try {
    const pg = await import('pg');
    const { Client } = pg.default;
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const result = await client.query(
      'SELECT valor FROM configuracoes WHERE chave = $1',
      ['youtube_link']
    );
    
    await client.end();
    res.json({ youtube_link: result.rows[0]?.valor || '' });
  } catch (error) {
    console.error('Erro ao buscar link do YouTube:', error);
    res.json({ youtube_link: '' }); // Retornar vazio em caso de erro
  }
});
```

---

## 4. Banco de Dados

### Tabela: `configuracoes`

#### Estrutura
```sql
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(255) UNIQUE NOT NULL,
  valor TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Registro do YouTube
- **Chave**: `youtube_link`
- **Valor**: URL completa do YouTube (ex: `https://www.youtube.com/watch?v=VIDEO_ID`)
- **Tipo**: TEXT

---

## 5. Exibição na Tela de Login

### Arquivo
- **Localização**: `client/src/pages/Login.jsx`

### Carregamento do Link

#### useEffect para Buscar Link
```javascript
useEffect(() => {
  const loadYoutubeLink = async () => {
    try {
      const response = await api.get('/marketing/youtube?' + Date.now()); // Cache-busting
      setYoutubeLink(response.data?.youtube_link || '');
    } catch (error) {
      console.error('Erro ao carregar link do YouTube:', error);
      setYoutubeLink('');
    }
  };
  loadYoutubeLink();
  
  // Recarregar o link a cada 5 segundos para verificar atualizações
  const interval = setInterval(loadYoutubeLink, 5000);
  return () => clearInterval(interval);
}, []);
```

**Características**:
- Cache-busting com timestamp na URL
- Recarrega automaticamente a cada 5 segundos
- Trata erros silenciosamente (retorna vazio)

### Conversão para Embed URL

#### Função de Conversão
```javascript
const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Extrair ID do vídeo de diferentes formatos de URL do YouTube
  let videoId = '';
  
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  if (!videoId) return '';
  
  return `https://www.youtube.com/embed/${videoId}`;
};
```

**Formatos Suportados**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&t=30s` (ignora parâmetros extras)

### Renderização do Vídeo

#### Mobile
- **Posição**: `marginTop: 64vh` (64% da altura da viewport)
- **Largura**: `max-w-full` (100% da largura disponível)
- **Padding**: `px-3` (12px horizontal)
- **Padding do Card**: `p-1` (4px)

#### Desktop
- **Posição**: `marginTop: 35vh` (35% da altura da viewport)
- **Largura**: `w-2/3` (66% da largura disponível)
- **Largura Máxima**: `max-w-2xl` (672px)
- **Padding**: `p-2` (8px)
- **Posição**: Lado esquerdo do container (ao lado do card de login)

#### Código de Renderização
```javascript
{youtubeEmbedUrl && (
  <div 
    className={`relative mb-6 ${
      isMobile ? 'w-full max-w-full px-3 mx-auto' : 'w-2/3 max-w-2xl flex-shrink-0'
    }`}
    style={{
      ...(isMobile ? { marginTop: '64vh' } : { marginTop: '35vh', marginLeft: '10%', marginRight: 'auto' })
    }}
  >
    <div className={`bg-black/80 rounded-xl shadow-2xl ${
      isMobile ? 'p-1' : 'p-2'
    }`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={youtubeEmbedUrl || 'no-video'} // Force re-render
          src={youtubeEmbedUrl || ''}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vídeo do YouTube"
        ></iframe>
      </div>
    </div>
  </div>
)}
```

**Características**:
- `key` no iframe força re-render quando o link muda
- Aspect ratio 16:9 mantido com `paddingBottom: 56.25%`
- Iframe posicionado absolutamente dentro do container
- Permissões completas do YouTube habilitadas

---

## 6. Atualização Automática

### Mecanismo
- **Intervalo**: 5 segundos
- **Método**: Polling via `setInterval`
- **Cache-busting**: Timestamp na URL da requisição

### Vantagens
- Atualizações aparecem automaticamente sem recarregar a página
- Não requer WebSocket ou Server-Sent Events
- Simples e confiável

### Desvantagens
- Requisições a cada 5 segundos (baixo impacto)
- Pequeno delay entre atualização e exibição (máximo 5 segundos)

---

## 7. Regras de Proteção

### ⚠️ NUNCA ALTERAR SEM AUTORIZAÇÃO:
1. **Estrutura da Tabela `configuracoes`**: Chave `youtube_link` é fixa
2. **Intervalo de Atualização**: 5 segundos é o padrão
3. **Posições do Vídeo**: Mobile (64vh) e Desktop (35vh) são fixas
4. **Formato de Embed**: Sempre usar `https://www.youtube.com/embed/VIDEO_ID`

### ✅ PODE SER ALTERADO:
- Intervalo de atualização (desde que não seja muito frequente)
- Estilos visuais do card do vídeo
- Tamanhos e padding (desde que mantenha responsividade)

---

## 8. Troubleshooting

### Problema: Vídeo não aparece após salvar
**Soluções**:
1. Verificar se o link foi salvo no banco (consultar tabela `configuracoes`)
2. Verificar logs do backend para erros
3. Aguardar até 5 segundos para atualização automática
4. Recarregar a página manualmente

### Problema: Vídeo não atualiza após mudança
**Soluções**:
1. Verificar se o intervalo de 5 segundos está funcionando
2. Verificar cache do navegador (limpar cache)
3. Verificar se o `key` do iframe está mudando

### Problema: Erro ao salvar link
**Soluções**:
1. Verificar se a tabela `configuracoes` existe no banco
2. Verificar conexão com o banco de dados
3. Verificar logs do backend para detalhes do erro
4. Verificar se o link é válido (formato do YouTube)

### Problema: Preview não mostra o vídeo
**Soluções**:
1. Verificar se a função `getYoutubeEmbedUrl` está extraindo o ID corretamente
2. Verificar se o link está no formato correto
3. Verificar console do navegador para erros

---

## 9. Histórico de Alterações

### 27/01/2025
- Implementação inicial da funcionalidade
- Criação da aba Marketing no Admin Dashboard
- Interface de configuração com preview
- Backend com rotas POST e GET
- Exibição na tela de login (mobile e desktop)

### 28/01/2025
- Adicionado `key` no iframe para forçar re-render
- Implementado cache-busting nas requisições
- Melhorado sistema de atualização automática (5 segundos)
- Correção de bugs de atualização do vídeo

---

## 10. Testes Recomendados

### Funcionalidades
- [ ] Salvar link do YouTube no admin
- [ ] Preview aparece corretamente no admin
- [ ] Vídeo aparece na tela de login (mobile)
- [ ] Vídeo aparece na tela de login (desktop)
- [ ] Vídeo atualiza automaticamente após mudança
- [ ] Vídeo não aparece quando link está vazio
- [ ] Erro tratado quando link é inválido

### Formatos de Link
- [ ] `https://www.youtube.com/watch?v=VIDEO_ID`
- [ ] `https://youtu.be/VIDEO_ID`
- [ ] `https://www.youtube.com/watch?v=VIDEO_ID&t=30s`

### Dispositivos
- [ ] Mobile (vários tamanhos)
- [ ] Desktop (várias resoluções)
- [ ] Tablet (modo retrato e paisagem)

---

## 11. Especificações Técnicas

### URLs Suportadas
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&t=30s` (parâmetros extras ignorados)

### Aspect Ratio
- **16:9** (56.25% padding-bottom)

### Permissões do Iframe
- `accelerometer`
- `autoplay`
- `clipboard-write`
- `encrypted-media`
- `gyroscope`
- `picture-in-picture`

### Intervalo de Atualização
- **5 segundos** (5000ms)

---

## 12. Contato e Suporte

Para alterações na funcionalidade do YouTube, sempre consultar este documento e obter autorização antes de modificar:
- Estrutura da tabela `configuracoes`
- Intervalo de atualização
- Posições do vídeo na tela de login
- Formato de conversão de URL

---

**Última Atualização**: 28 de Janeiro de 2025
**Versão**: 1.1

