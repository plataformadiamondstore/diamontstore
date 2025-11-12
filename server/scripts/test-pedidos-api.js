import fetch from 'node-fetch';

async function testPedidosAPI() {
  try {
    console.log('🔍 Testando API de pedidos...\n');
    
    const response = await fetch('http://localhost:3000/api/admin/pedidos');
    const pedidos = await response.json();
    
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      console.log('⚠️  Nenhum pedido retornado ou resposta inválida');
      console.log('Resposta:', JSON.stringify(pedidos, null, 2));
      return;
    }
    
    console.log(`📋 Total de pedidos: ${pedidos.length}\n`);
    console.log('============================================================');
    console.log('PRIMEIRO PEDIDO - Estrutura completa:');
    console.log('============================================================');
    const primeiroPedido = pedidos[0];
    console.log(JSON.stringify(primeiroPedido, null, 2));
    
    console.log('\n============================================================');
    console.log('ANÁLISE DOS DADOS:');
    console.log('============================================================');
    
    pedidos.slice(0, 3).forEach((pedido, index) => {
      console.log(`\n${index + 1}. PEDIDO ID: ${pedido.id}`);
      console.log(`   Funcionário existe: ${!!pedido.funcionarios}`);
      if (pedido.funcionarios) {
        console.log(`   - Nome Funcionário: ${pedido.funcionarios.nome_completo || 'N/A'}`);
        console.log(`   - Empresas existe: ${!!pedido.funcionarios.empresas}`);
        if (pedido.funcionarios.empresas) {
          console.log(`     * Nome Empresa: ${pedido.funcionarios.empresas.nome || 'N/A'}`);
          console.log(`     * Cadastro Empresa (tabela): ${pedido.funcionarios.empresas.cadastro_empresa || 'N/A'}`);
        }
        console.log(`   - Cadastro Empresa (funcionario): ${pedido.funcionarios.cadastro_empresa || 'N/A'}`);
        console.log(`   - Clubes existe: ${!!pedido.funcionarios.clubes}`);
        if (pedido.funcionarios.clubes) {
          console.log(`     * Nome Clube: ${pedido.funcionarios.clubes.nome || 'N/A'}`);
          console.log(`     * Cadastro Clube (tabela): ${pedido.funcionarios.clubes.cadastro_clube || 'N/A'}`);
        }
        console.log(`   - Cadastro Clube (funcionario): ${pedido.funcionarios.cadastro_clube || 'N/A'}`);
        console.log(`   - empresa_id: ${pedido.funcionarios.empresa_id || 'NULL'}`);
        console.log(`   - clube_id: ${pedido.funcionarios.clube_id || 'NULL'}`);
      }
    });
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPedidosAPI().catch(console.error);









