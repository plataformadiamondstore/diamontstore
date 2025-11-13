# Como Testar a Planilha da Schaeffler

## Passo 1: Analisar a Planilha Localmente

Antes de fazer o upload, você pode analisar a estrutura da planilha usando o script de análise:

```bash
cd server
node scripts/analisar-planilha-excel.js "C:\Users\felip\Desktop\PLanilha Sistema B2B - Schaeffler.xlsx"
```

Este script irá:
- ✅ Mostrar todas as colunas encontradas
- ✅ Verificar se encontra as colunas obrigatórias (Nome e Cadastro Empresa)
- ✅ Verificar se encontra a coluna opcional (Cadastro Clube)
- ✅ Mostrar uma amostra dos dados
- ✅ Indicar quantas linhas são válidas
- ✅ Dar uma conclusão sobre a compatibilidade

## Passo 2: Verificar os Logs do Servidor

Quando fizer o upload pelo AdminDashboard, os logs do servidor mostrarão:

1. **Estrutura do Excel**:
   - Total de linhas
   - Primeiras 3 linhas do Excel
   - Chaves disponíveis na primeira linha

2. **Primeira linha processada**:
   - Chaves disponíveis
   - Valores da linha
   - Nome encontrado (se houver)
   - Tipo do nome

3. **Erros (se houver)**:
   - Linha específica com erro
   - Chaves encontradas naquela linha
   - Valores da linha
   - O que está faltando

## Passo 3: Fazer o Upload

1. Acesse `adm/dashboard`
2. Vá na aba "Cadastro Funcionários"
3. Selecione a empresa
4. Clique em "Upload Excel"
5. Selecione o arquivo `PLanilha Sistema B2B - Schaeffler.xlsx`
6. Clique em "Enviar"

## O que o Sistema Faz Automaticamente

O sistema agora:

1. **Tenta múltiplas formas de leitura**:
   - Com header na primeira linha (padrão)
   - Sem header (primeira linha como dados)
   - Com range específico

2. **Busca inteligente de colunas**:
   - Ignora maiúsculas/minúsculas
   - Ignora espaços extras
   - Ignora caracteres especiais
   - Normaliza acentos

3. **Filtra linhas vazias**:
   - Remove automaticamente linhas completamente vazias

4. **Validação rigorosa**:
   - Verifica se Nome não está vazio
   - Verifica se Cadastro Empresa não está vazio
   - Cadastro Clube é opcional

## Colunas Aceitas

### Nome do Funcionário (obrigatório)
- `nome_empregado`, `Nome Empregado`, `NOME EMPREGADO`
- `nome_completo`, `Nome Completo`, `NOME COMPLETO`
- `nome`, `Nome`, `NOME`
- `empregado`, `Empregado`, `EMPREGADO`
- `funcionario`, `Funcionario`, `FUNCIONARIO`, `funcionário`, `Funcionário`
- `Colaborador`, `colaborador`, `COLABORADOR`
- `Nome do Empregado`, `Nome do Funcionário`, `Nome Funcionário`

### Cadastro Empresa (obrigatório)
- `cadastro_empresa`, `Cadastro Empresa`, `CADASTRO EMPRESA`
- `cadastro empresa`, `Cadastro Empresa`
- `Código Empresa`, `CODIGO EMPRESA`, `código empresa`
- `Código da Empresa`, `CODIGO DA EMPRESA`
- `Empresa`, `EMPRESA`, `empresa`
- `ID Empresa`, `id empresa`, `ID_EMPRESA`

### Cadastro Clube (opcional)
- `cadastro_clube`, `Cadastro Clube`, `CADASTRO CLUBE`
- `cadastro clube`, `Cadastro Clube`
- `Código Clube`, `CODIGO CLUBE`, `código clube`
- `Código do Clube`, `CODIGO DO CLUBE`
- `Clube`, `CLUBE`, `clube`
- `ID Clube`, `id clube`, `ID_CLUBE`

## Resolução de Problemas

### Erro: "Nome Empregado é obrigatório e não pode estar vazio"

**Possíveis causas**:
- A coluna de nome não existe ou tem nome diferente
- A coluna está vazia
- Há espaços extras no nome da coluna

**Solução**:
1. Execute o script de análise para ver quais colunas foram encontradas
2. Verifique os logs do servidor para ver a estrutura exata
3. Renomeie a coluna para um dos nomes suportados
4. Verifique se há dados na coluna

### Erro: "Cadastro Empresa é obrigatório e não pode estar vazio"

**Possíveis causas**:
- A coluna de cadastro empresa não existe ou tem nome diferente
- A coluna está vazia

**Solução**:
1. Execute o script de análise para ver quais colunas foram encontradas
2. Verifique os logs do servidor
3. Renomeie a coluna para um dos nomes suportados
4. Verifique se há dados na coluna

### Nenhum dado encontrado

**Possíveis causas**:
- A planilha está vazia
- A primeira linha não é o header
- Formato de arquivo não suportado

**Solução**:
1. Verifique se a planilha tem dados
2. Certifique-se de que a primeira linha contém os nomes das colunas
3. Salve a planilha como .xlsx (Excel 2007+)

## Exemplo de Planilha Válida

| Nome Empregado | Cadastro Empresa | Cadastro Clube |
|----------------|------------------|----------------|
| João Silva     | 12345            | 001            |
| Maria Santos   | 12345            | 002            |
| Pedro Costa    | 12345            | 001            |

## Dicas

1. **Use nomes de colunas claros**: Prefira "Nome Empregado" ou "Nome Completo"
2. **Evite caracteres especiais**: Use espaços ou underscores, não ambos
3. **Verifique espaços extras**: Remova espaços no início/fim das células
4. **Mantenha consistência**: Use o mesmo formato em todas as linhas
5. **Teste com poucas linhas primeiro**: Faça upload de 2-3 funcionários para testar

## Suporte

Se ainda houver problemas após seguir estes passos:

1. Execute o script de análise e compartilhe o resultado
2. Verifique os logs do servidor e compartilhe as mensagens de erro
3. Verifique se os nomes das colunas na planilha correspondem a um dos nomes suportados

