# 🔴 PROBLEMA IDENTIFICADO - Imagens não aparecem no carrinho

## ❌ O QUE ESTÁ ERRADO:

### ROTA DE PRODUTOS (FUNCIONA ✅):
```javascript
// Backend retorna:
{
  produtos: [
    {
      id: 1,
      nome: "Produto",
      produto_imagens: [
        { id: 1, url_imagem: "http://localhost:3000/uploads/produtos/xxx.jpg", ordem: 0 }
      ]
    }
  ]
}

// Frontend acessa:
product.produto_imagens  // ← DIRETO, funciona!
```

### ROTA DO CARRINHO (NÃO FUNCIONA ❌):
```javascript
// Backend retorna:
[
  {
    id: 1,
    produto_id: 1,
    produtos: {
      id: 1,
      nome: "Produto",
      produto_imagens: [...]  // ← Pode estar vazio ou undefined!
    }
  }
]

// Frontend acessa:
item.produtos.produto_imagens  // ← ANINHADO, pode não estar vindo!
```

## 🔍 POSSÍVEIS CAUSAS:

1. **Select aninhado do Supabase pode não funcionar em relações através de foreign keys**
   - A rota de produtos busca direto: `produtos -> produto_imagens`
   - A rota do carrinho busca: `carrinho -> produtos -> produto_imagens` (2 níveis)
   - O Supabase pode ter limitações em selects aninhados profundos

2. **A estrutura pode estar vindo diferente do esperado**
   - `produtos` pode vir como array `[{...}]` ao invés de objeto `{...}`
   - `produto_imagens` pode não estar sendo incluído`

3. **O método alternativo (busca separada) pode não estar sendo usado**
   - Se o select aninhado falhar silenciosamente, pode não estar caindo no método alternativo

## ✅ SOLUÇÃO:

Forçar o uso do método alternativo que busca as imagens separadamente, garantindo que sempre funcione.


