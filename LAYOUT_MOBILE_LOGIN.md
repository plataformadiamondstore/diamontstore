# Documentação de Layout Mobile - Tela de Login

## Data de Criação
27 de Janeiro de 2025

## Visão Geral
Este documento descreve todas as configurações de layout específicas para a versão mobile da tela de login da aplicação Sloth Empresas.

---

## 1. Detecção de Mobile

### Implementação
- **Arquivo**: `client/src/pages/Login.jsx`
- **Estado**: `isMobile` (boolean)
- **Breakpoint**: `window.innerWidth < 768px`
- **Atualização**: Listener de evento `resize` para atualização dinâmica

```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

---

## 2. Banner de Fundo

### Configurações
- **Imagem Mobile**: `/banners/banner_mobile.jpeg`
- **Imagem Desktop**: `/banners/banner_site.jpeg`
- **Posicionamento Mobile**: `position: absolute`
- **Posicionamento Desktop**: `position: fixed`
- **Tamanho**: `100vw x 100vh` (NUNCA ALTERAR)
- **Z-Index**: `0`
- **Pointer Events**: `none` (não interfere com interações)

### Comportamento
- **Mobile**: O banner rola junto com o conteúdo (position absolute)
- **Desktop**: O banner fica fixo no fundo (position fixed)
- **Object Fit**: `cover`
- **Object Position**: `center`

### Código
```javascript
<div 
  className={isMobile ? "absolute inset-0 w-full h-full" : "fixed inset-0 w-screen h-screen"}
  style={{
    position: isMobile ? 'absolute' : 'fixed',
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
```

**⚠️ IMPORTANTE**: O tamanho do banner NUNCA deve ser alterado. Sempre manter `100vw x 100vh`.

---

## 3. Card do YouTube

### Configurações Mobile
- **Posição**: `marginTop: 64vh` (64% da altura da viewport a partir do topo)
- **Largura**: `max-w-full` (100% da largura disponível)
- **Padding Horizontal**: `px-3` (12px)
- **Z-Index**: `10`
- **Padding do Card**: `p-1` (4px)
- **Aspect Ratio**: `56.25%` (16:9)

### Comportamento
- Aparece apenas se houver um link do YouTube configurado
- Posicionado abaixo do topo da página
- Rola junto com o conteúdo no mobile

### Código
```javascript
{youtubeEmbedUrl && (
  <div 
    className={`relative z-10 w-full mx-auto mb-6 ${
      isMobile ? 'max-w-full px-3' : 'max-w-4xl px-4'
    }`}
    style={{
      position: 'relative',
      zIndex: 10,
      ...(isMobile && { marginTop: '64vh' })
    }}
  >
```

**⚠️ IMPORTANTE**: A posição do card do YouTube não deve ser alterada sem autorização.

---

## 4. Card de Login

### Configurações Mobile
- **Posição**: `marginTop: 0vh` (topo da página)
- **Largura Máxima**: `max-w-[320px]` (320px)
- **Padding Horizontal**: `px-3` (12px)
- **Padding Interno**: `p-5` (20px)
- **Z-Index**: `10`
- **Border**: `border-2 border-white/50`
- **Background**: `bg-white/95` com `backdrop-blur-sm`

### Tamanhos de Texto Mobile
- **Título**: `text-2xl` (24px)
- **Subtítulo**: `text-sm` (14px)
- **Labels**: `text-xs` (12px)
- **Inputs**: `text-sm` (14px) com `px-3 py-2`
- **Botão**: `text-sm` (14px) com `py-2.5`

### Comportamento
- Centralizado horizontalmente
- Posicionado no topo da página no mobile
- Altura calculada dinamicamente para limitar rolagem

### Código
```javascript
<div 
  ref={loginCardRef}
  className={`relative z-10 w-full max-w-md mx-auto flex justify-center ${
    isMobile ? 'px-3 mt-[0vh]' : 'px-4'
  }`}
  style={{
    position: 'relative',
    zIndex: 10
  }}
>
  <div className={`bg-white rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 ${
    isMobile 
      ? 'p-5 w-full max-w-[320px] border-2 border-white/50' 
      : 'p-6 md:p-8 w-full'
  }`}>
```

**⚠️ IMPORTANTE**: A posição do card de login não deve ser alterada sem autorização.

---

## 5. Container Principal

### Configurações Mobile
- **Altura**: Calculada dinamicamente baseada no card de login
- **Altura Mínima**: Baseada na posição final do card de login + 40px de padding
- **Overflow**: `overflowY: auto` e `overflowX: hidden`
- **Justify Content**: `justify-start`

### Cálculo Dinâmico de Altura
```javascript
useEffect(() => {
  if (isMobile && loginCardRef.current) {
    const updateHeight = () => {
      if (loginCardRef.current) {
        const card = loginCardRef.current;
        const cardTop = card.offsetTop;
        const cardHeight = card.offsetHeight;
        // Altura necessária = posição do card + altura do card + padding inferior
        const neededHeight = cardTop + cardHeight + 40; // 40px de padding inferior
        setContainerHeight(`${neededHeight}px`);
      }
    };

    const timeoutId = setTimeout(updateHeight, 200);
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateHeight);
    };
  } else {
    setContainerHeight('100vh');
  }
}, [isMobile, youtubeLink]);
```

### Comportamento
- A altura do container é calculada automaticamente
- A rolagem para quando o card de login termina
- Atualiza automaticamente ao redimensionar a janela

---

## 6. Sistema de Rolagem

### Configurações Globais
- **Arquivo**: `client/src/index.css`
- **HTML/Body**: `overflow-y: auto` e `overflow-x: hidden`
- **Webkit Scroll**: `-webkit-overflow-scrolling: touch` (suporte iOS)

### Limitação de Rolagem
- A rolagem é limitada pela altura do container principal
- O container calcula sua altura baseado no card de login
- Padding inferior de 40px após o card de login

### Código CSS Global
```css
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

#root {
  width: 100%;
  min-height: 100%;
}
```

---

## 7. Ordem de Renderização (Z-Index)

1. **Banner de Fundo**: `z-index: 0`
2. **Card do YouTube**: `z-index: 10`
3. **Card de Login**: `z-index: 10`

---

## 8. Regras de Proteção

### ⚠️ NUNCA ALTERAR SEM AUTORIZAÇÃO:
1. **Tamanho do Banner**: Sempre `100vw x 100vh`
2. **Posição do Card do YouTube**: `marginTop: 64vh` no mobile
3. **Posição do Card de Login**: `marginTop: 0vh` no mobile
4. **Sistema de Rolagem**: A altura do container é calculada automaticamente

### ✅ PODE SER ALTERADO:
- Cores e estilos visuais (cores, sombras, bordas)
- Tamanhos de texto (desde que mantenha legibilidade)
- Padding interno dos cards (desde que não afete posicionamento)

---

## 9. Histórico de Alterações

### 27/01/2025
- Implementação inicial do layout mobile
- Banner configurado para rolar junto no mobile
- Card do YouTube posicionado em 64vh
- Card de login posicionado em 0vh
- Sistema de rolagem limitada implementado
- Altura do container calculada dinamicamente

---

## 10. Testes Recomendados

### Dispositivos
- iPhone (vários tamanhos)
- Android (vários tamanhos)
- Tablets em modo retrato

### Verificações
- [ ] Banner rola junto com o conteúdo
- [ ] Card do YouTube aparece na posição correta
- [ ] Card de login aparece no topo
- [ ] Rolagem para quando o card de login termina
- [ ] Não há rolagem horizontal
- [ ] Todos os elementos são clicáveis
- [ ] Layout responsivo ao redimensionar

---

## 11. Troubleshooting

### Problema: Banner não rola junto
**Solução**: Verificar se `position` está como `absolute` no mobile

### Problema: Rolagem não para no lugar certo
**Solução**: Verificar cálculo de altura do container e ref do card de login

### Problema: Cards sobrepostos
**Solução**: Verificar z-index e posicionamento

### Problema: Banner mudou de tamanho
**Solução**: Verificar se altura/largura estão como `100vh/100vw`

---

## 12. Contato e Suporte

Para alterações no layout mobile, sempre consultar este documento e obter autorização antes de modificar:
- Tamanho do banner
- Posições dos cards
- Sistema de rolagem

---

**Última Atualização**: 27 de Janeiro de 2025
**Versão**: 1.0

