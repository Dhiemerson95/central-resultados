const axios = require('axios');

async function testarLogin() {
  console.log('\n🧪 TESTANDO LOGIN NO BACKEND LOCAL...\n');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@astassessoria.com.br',
      senha: '123456'
    });

    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('Token:', response.data.token.substring(0, 50) + '...');
    console.log('Usuário:', response.data.usuario);
    console.log('\n🎉 O BACKEND ESTÁ FUNCIONANDO!\n');
  } catch (error) {
    console.log('❌ ERRO NO LOGIN:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data);
    console.log('\n📋 Detalhes completos:');
    console.log(error.response?.data);
  }
}

testarLogin();
