# 🔒 IPs PERMITIDOS NO RENDER

## Data: 12/11/2025

---

## 📋 IPs FORNECIDOS

```
35.160.120.126
44.233.151.27
34.211.200.85
74.220.48.0/24
74.220.56.0/24
```

---

## 🔧 COMO CONFIGURAR NO RENDER

### Opção 1: Via Dashboard (Recomendado)

1. Acesse o **Dashboard do Render**: https://dashboard.render.com
2. Vá no seu serviço backend
3. Clique em **Settings** (Configurações)
4. Role até **Security** ou **IP Allowlist**
5. Adicione os IPs fornecidos:
   - `35.160.120.126`
   - `44.233.151.27`
   - `34.211.200.85`
   - `74.220.48.0/24` (range)
   - `74.220.56.0/24` (range)

### Opção 2: Via render.yaml

Se o Render suportar, adicione ao `render.yaml`:

```yaml
services:
  - type: web
    name: sloth-empresas-backend
    # ... outras configurações ...
    allowedIPs:
      - 35.160.120.126
      - 44.233.151.27
      - 34.211.200.85
      - 74.220.48.0/24
      - 74.220.56.0/24
```

**Nota**: Nem todas as versões do Render suportam `allowedIPs` no YAML. Use o Dashboard se necessário.

---

## 📝 NOTAS

- Os IPs `74.220.48.0/24` e `74.220.56.0/24` são ranges (CIDR)
- Isso permite todos os IPs de `74.220.48.0` a `74.220.48.255` e `74.220.56.0` a `74.220.56.255`
- Use o Dashboard do Render para configurar se o YAML não suportar

---

**Status**: ⚠️ **CONFIGURAR MANUALMENTE NO DASHBOARD DO RENDER**

