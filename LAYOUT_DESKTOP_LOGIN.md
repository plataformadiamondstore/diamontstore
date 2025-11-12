# Documentação de Layout Desktop - Tela de Login

## Data de Criação
27 de Janeiro de 2025

## Visão Geral
Este documento descreve todas as configurações de layout específicas para a versão desktop da tela de login da aplicação Sloth Empresas.

---

## 1. Detecção de Desktop

### Implementação
- **Arquivo**: `client/src/pages/Login.jsx`
- **Estado**: `isMobile` (boolean)
- **Breakpoint**: `window.innerWidth >= 768px` (desktop)
- **Atualização**: Listener de evento `resize` para atualização dinâmica
- **Inicialização**: Verificação imediata ao montar o componente

```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  };
  
  // Verificar imediatamente ao montar
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

---

## 2. Banner de Fundo

### Configurações Desktop
- **Imagem**: `/banners/banner_site.jpeg`
- **Posicionamento**: `position: fixed`
- **Tamanho**: `100vw x 100vh` (NUNCA ALTERAR)
- **Z-Index**: `0`
- **Pointer Events**: `none` (não interfere com interações)

### Comportamento
- **Desktop**: O banner fica fixo no fundo (position fixed)
- **Object Fit**: `cover`
- **Object Position**: `center`

### Código
```javascript
<div 
  className="fixed inset-0 w-screen h-screen"
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none'
  }}
>
  <img 
    key={`banner-${isMobile ? 'mobile' : 'desktop'}`}
    src={bannerSrc}
    alt="Banner de Login" 
    className="w-full h-full object-cover"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center'
    }}
    onError={(e) => {
      console.error('❌ Erro ao carregar banner:', e.target.src);
      e.target.style.display = 'none';
      e.target.parentElement.style.background = 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)';
    }}
    onLoad={(e) => console.log('✅ Banner carregado:', isMobile ? 'MOBILE' : 'DESKTOP', e.target.src)}
  />
</div>
```

**⚠️ IMPORTANTE**: 
- A imagem usa `key` para forçar reload quando muda entre mobile/desktop
- Desktop SEMPRE usa `/banners/banner_site.jpeg`
- Mobile SEMPRE usa `/banners/banner_mobile.jpeg`
- Desktop NUNCA deve usar a imagem do mobile

**⚠️ IMPORTANTE**: O tamanho do banner NUNCA deve ser alterado. Sempre manter `100vw x 100vh`.

---

## 3. Container Principal

### Configurações Desktop
- **Layout**: `flex flex-row` (cards lado a lado)
- **Alinhamento**: `items-stretch` (mesma altura)
- **Justificação**: `justify-center`
- **Posição**: `marginTop: 35vh` (35% da altura da viewport)
- **Padding**: `paddingTop: 2rem`, `paddingLeft: 10%`, `paddingRight: 10%`
- **Gap**: `gap-6` (24px entre os cards)
- **Overflow**: `visible` (não corta conteúdo)

### Comportamento
- Os cards do YouTube e Login ficam lado a lado
- Ambos têm a mesma altura (items-stretch)
- Container centralizado horizontalmente

### Código
```javascript
<div 
  className="relative z-10 w-full flex flex-row items-stretch justify-center gap-6"
  style={{
    position: 'relative',
    zIndex: 10,
    marginTop: '35vh',
    paddingTop: '2rem',
    paddingLeft: '10%',
    paddingRight: '10%'
  }}
>
```

---

## 4. Card do YouTube

### Configurações Desktop
- **Posição**: Lado esquerdo do container
- **Largura**: `w-2/3` (66% da largura disponível)
- **Largura Máxima**: `max-w-2xl` (672px)
- **Posicionamento**: `marginTop: 35vh` (35% da altura da viewport)
- **Padding**: `p-2` (8px)
- **Z-Index**: `10`
- **Aspect Ratio**: `56.25%` (16:9)

### Comportamento
- Aparece apenas se houver um link do YouTube configurado
- Posicionado à esquerda do container
- Mantém proporção 16:9

### Código
```javascript
{youtubeEmbedUrl && (
  <div 
    className="relative mb-6 w-2/3 max-w-2xl flex-shrink-0"
  >
    <div className="bg-black/80 rounded-xl shadow-2xl p-2">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={youtubeEmbedUrl}
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

**⚠️ IMPORTANTE**: A posição do card do YouTube não deve ser alterada sem autorização.

---

## 5. Card de Login

### Configurações Desktop
- **Posição**: Lado direito do container, mesma altura do YouTube
- **Largura**: `w-1/3` (33% da largura disponível)
- **Largura Máxima**: `max-w-md` (448px)
- **Padding**: `p-4` (16px)
- **Z-Index**: `10`
- **Background**: `rgba(240, 248, 255, 0.35)` (tom gelo semi-transparente)
- **Backdrop Blur**: `blur(10px)`
- **Border**: `border-2 border-white/40`

### Efeito Glassmorphism
- Background semi-transparente com tom de gelo azulado
- Backdrop blur para efeito de vidro
- Borda semi-transparente

### Código
```javascript
<div 
  className="relative flex justify-center w-1/3 max-w-md flex-shrink-0 flex flex-col"
  style={{
    position: 'relative',
    zIndex: 10,
    marginTop: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}
>
  <div className="rounded-2xl shadow-2xl backdrop-blur-md border-2 p-4 w-full bg-white/20 border-white/40 flex-1 flex flex-col"
  style={{
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(240, 248, 255, 0.35)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
```

### Tamanhos de Texto Desktop
- **Título**: `text-3xl` (30px)
- **Subtítulo**: Tamanho padrão
- **Labels**: `text-sm` (14px)
- **Inputs**: Tamanho padrão com `px-4 py-2`
- **Botão**: Tamanho padrão com `py-3`

---

## 6. Fundo do Título e Subtítulo

### Configurações
- **Background**: `rgba(255, 255, 255, 0.4)` (branco 40% opaco)
- **Backdrop Blur**: `blur(8px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.3)`
- **Padding**: `p-3` (12px)
- **Border Radius**: `rounded-lg`
- **Margin Bottom**: `mb-4` (16px)

### Comportamento
- Apenas a área do título e subtítulo tem este fundo especial
- Destaque visual para o cabeçalho do card

### Código
```javascript
<div className="text-center mb-4 rounded-lg p-3"
style={{
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.3)'
}}>
  <h1 className="font-bold text-primary-purple mb-2 text-3xl">
    Sloth Empresas
  </h1>
  <p className="text-gray-600">Acesse sua conta</p>
</div>
```

---

## 7. Botão de Login

### Configurações Desktop
- **Cor de Fundo**: `#9333ea` (roxo sólido, sem opacidade)
- **Cor do Texto**: `text-white`
- **Padding**: `py-3` (12px vertical)
- **Border Radius**: `rounded-lg`
- **Hover**: `hover:bg-purple-700`
- **Disabled**: `opacity: 0.5`
- **Transição**: `transition-all duration-200`

### Comportamento
- Cor sólida sem opacidade para melhor visibilidade
- Efeito hover mais escuro
- Estado desabilitado com opacidade reduzida

### Código
```javascript
<button
  type="submit"
  disabled={loading}
  className="w-full text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed py-3"
  style={{
    backgroundColor: loading ? '#9333ea' : '#9333ea',
    opacity: loading ? 0.5 : 1
  }}
>
  {loading ? 'Entrando...' : 'Entrar'}
</button>
```

---

## 8. Alinhamento Vertical

### Configurações
- **Container**: `items-stretch` (estica ambos os cards para mesma altura)
- **Card Login**: `height: 100%` e `flex flex-col` (preenche altura disponível)
- **Alinhamento**: Topo e base dos cards alinhados

### Comportamento
- Ambos os cards têm exatamente a mesma altura
- Parte superior e inferior alinhadas
- Layout responsivo mantém proporções

---

## 9. Ordem de Renderização (Z-Index)

1. **Banner de Fundo**: `z-index: 0`
2. **Container de Cards**: `z-index: 10`
3. **Card do YouTube**: `z-index: 10`
4. **Card de Login**: `z-index: 10`

---

## 10. Regras de Proteção

### ⚠️ NUNCA ALTERAR SEM AUTORIZAÇÃO:
1. **Tamanho do Banner**: Sempre `100vw x 100vh`
2. **Posição do Card do YouTube**: `marginTop: 35vh` e `w-2/3`
3. **Posição do Card de Login**: `w-1/3` e mesma altura do YouTube
4. **Alinhamento Vertical**: `items-stretch` no container
5. **Efeito Glassmorphism**: Background e backdrop blur do card de login

### ✅ PODE SER ALTERADO:
- Cores e estilos visuais (desde que mantenha contraste)
- Tamanhos de texto (desde que mantenha legibilidade)
- Padding interno dos cards (desde que não afete alinhamento)

---

## 11. Histórico de Alterações

### 27/01/2025
- Implementação inicial do layout desktop
- Cards do YouTube e Login lado a lado
- Efeito glassmorphism no card de login
- Fundo especial para título e subtítulo
- Alinhamento vertical perfeito entre os cards
- Botão roxo sem opacidade para melhor visibilidade
- Container com padding lateral de 10%

### 28/01/2025
- Correção da detecção de desktop com inicialização imediata
- Adicionado `key` na imagem do banner para forçar reload correto
- Garantido que desktop sempre usa `banner_site.jpeg` (não usa imagem do mobile)
- Melhorado log de carregamento do banner
- Correção crítica: Desktop agora usa corretamente sua própria imagem de banner

---

## 12. Testes Recomendados

### Resoluções
- 1920x1080 (Full HD)
- 1366x768 (HD)
- 2560x1440 (2K)
- 3840x2160 (4K)

### Verificações
- [ ] Cards ficam lado a lado
- [ ] Ambos têm a mesma altura
- [ ] Card do YouTube à esquerda, Login à direita
- [ ] Efeito glassmorphism visível no card de login
- [ ] Fundo do título com efeito gelo
- [ ] Botão roxo visível e vibrante
- [ ] Layout responsivo ao redimensionar
- [ ] Banner fixo no fundo

---

## 13. Troubleshooting

### Problema: Cards não ficam lado a lado
**Solução**: Verificar se `flex flex-row` está no container e `items-stretch` para mesma altura

### Problema: Card de login maior que YouTube
**Solução**: Verificar padding e margin, garantir `height: 100%` no card de login

### Problema: Efeito glassmorphism não aparece
**Solução**: Verificar `backdropFilter` e `backgroundColor` com opacidade

### Problema: Botão muito claro
**Solução**: Verificar se `opacity: 1` está no estilo inline do botão

### Problema: Banner mudou de tamanho
**Solução**: Verificar se altura/largura estão como `100vh/100vw`

---

## 14. Especificações Técnicas

### Cores
- **Background Card Login**: `rgba(240, 248, 255, 0.35)` (gelo azulado)
- **Background Título**: `rgba(255, 255, 255, 0.4)` (branco 40%)
- **Botão**: `#9333ea` (roxo sólido)
- **Border Card**: `rgba(255, 255, 255, 0.4)`

### Espaçamentos
- **Gap entre cards**: `24px` (gap-6)
- **Padding Card Login**: `16px` (p-4)
- **Padding Card YouTube**: `8px` (p-2)
- **Padding Título**: `12px` (p-3)

### Efeitos
- **Backdrop Blur Card**: `10px`
- **Backdrop Blur Título**: `8px`
- **Shadow Card**: `shadow-2xl`

---

## 15. Contato e Suporte

Para alterações no layout desktop, sempre consultar este documento e obter autorização antes de modificar:
- Tamanho do banner
- Posições dos cards
- Alinhamento vertical
- Efeito glassmorphism
- Proporções dos cards

---

**Última Atualização**: 27 de Janeiro de 2025
**Versão**: 1.0

