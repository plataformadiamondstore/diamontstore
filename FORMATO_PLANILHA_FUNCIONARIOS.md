# Formato da Planilha de Funcionários

## Estrutura Esperada

A planilha Excel deve conter as seguintes informações para cada funcionário:

### Colunas Obrigatórias

1. **Nome do Funcionário** (obrigatório)
   - O sistema aceita várias variações de nomes de coluna:
     - `nome_empregado`, `Nome Empregado`, `NOME EMPREGADO`
     - `nome_completo`, `Nome Completo`, `NOME COMPLETO`
     - `nome`, `Nome`, `NOME`
     - `empregado`, `Empregado`, `EMPREGADO`
     - `funcionario`, `Funcionario`, `FUNCIONARIO`, `funcionário`, `Funcionário`
     - `Colaborador`, `colaborador`, `COLABORADOR`
     - `Nome do Empregado`, `Nome do Funcionário`, `Nome Funcionário`

2. **Cadastro Empresa** (obrigatório)
   - O sistema aceita várias variações:
     - `cadastro_empresa`, `Cadastro Empresa`, `CADASTRO EMPRESA`
     - `cadastro empresa`, `Cadastro Empresa`
     - `Código Empresa`, `CODIGO EMPRESA`, `código empresa`
     - `Código da Empresa`, `CODIGO DA EMPRESA`
     - `Empresa`, `EMPRESA`, `empresa`
     - `ID Empresa`, `id empresa`, `ID_EMPRESA`

### Colunas Opcionais

3. **Cadastro Clube** (opcional)
   - O sistema aceita várias variações:
     - `cadastro_clube`, `Cadastro Clube`, `CADASTRO CLUBE`
     - `cadastro clube`, `Cadastro Clube`
     - `Código Clube`, `CODIGO CLUBE`, `código clube`
     - `Código do Clube`, `CODIGO DO CLUBE`
     - `Clube`, `CLUBE`, `clube`
     - `ID Clube`, `id clube`, `ID_CLUBE`

## Formato do Arquivo

- **Formato**: Excel (.xlsx, .xls)
- **Primeira linha**: Pode ser header (nomes das colunas) ou dados
- **Linhas vazias**: São automaticamente ignoradas
- **Encoding**: UTF-8 (recomendado)

## Exemplo de Planilha

| Nome Empregado | Cadastro Empresa | Cadastro Clube |
|----------------|------------------|----------------|
| João Silva     | 12345            | 001            |
| Maria Santos   | 12345            | 002            |
| Pedro Costa    | 12345            | 001            |

## Como o Sistema Processa

1. **Leitura Flexível**: O sistema tenta ler a planilha de diferentes formas:
   - Primeiro, tenta com header na primeira linha (padrão)
   - Se não encontrar dados, tenta sem header
   - Se ainda não encontrar, tenta com range específico

2. **Busca Inteligente de Colunas**: 
   - O sistema busca colunas ignorando:
     - Maiúsculas/minúsculas
     - Espaços extras
     - Caracteres especiais (_, -, ., etc)
     - Acentos (funcionario/funcionário)

3. **Validação**:
   - Nome do funcionário não pode estar vazio
   - Cadastro Empresa não pode estar vazio
   - Cadastro Clube é opcional

## Logs de Debug

Se houver erro no upload, o sistema mostrará:
- Chaves encontradas na planilha
- Valores de cada linha
- Qual coluna foi encontrada para cada campo
- Linha específica onde ocorreu o erro

## Dicas

1. **Use nomes de colunas claros**: Prefira "Nome Empregado" ou "Nome Completo"
2. **Evite caracteres especiais**: Use espaços ou underscores, não ambos
3. **Verifique espaços extras**: Remova espaços no início/fim das células
4. **Mantenha consistência**: Use o mesmo formato em todas as linhas
5. **Teste com poucas linhas primeiro**: Faça upload de 2-3 funcionários para testar

## Suporte a Formatos Corporativos

O sistema foi otimizado para aceitar planilhas de diferentes formatos corporativos, incluindo:
- Planilhas da Schaeffler
- Planilhas exportadas de sistemas ERP
- Planilhas com múltiplas variações de nomes de colunas

## Resolução de Problemas

Se o upload falhar:

1. **Verifique os logs do servidor**: Eles mostrarão exatamente quais colunas foram encontradas
2. **Confirme os nomes das colunas**: Use exatamente um dos nomes suportados listados acima
3. **Verifique se há dados vazios**: Todas as linhas devem ter pelo menos Nome e Cadastro Empresa
4. **Teste com uma planilha simples**: Crie uma planilha com apenas 2-3 linhas para testar

## Exemplo de Erro e Solução

**Erro**: "Nome Empregado é obrigatório e não pode estar vazio"

**Possíveis causas**:
- A coluna de nome não existe ou tem nome diferente
- A coluna está vazia
- Há espaços extras no nome da coluna

**Solução**:
- Verifique os logs para ver quais colunas foram encontradas
- Renomeie a coluna para um dos nomes suportados
- Verifique se há dados na coluna

