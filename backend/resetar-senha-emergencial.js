// SCRIPT EMERGENCIAL - RESETAR SENHA VIA API

const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚨 RESET EMERGENCIAL DE SENHA\n');

rl.question('E-mail do usuário: ', (email) => {
  rl.question('Nova senha: ', (novaSenha) => {
    
    console.log('\n🔄 Resetando senha...\n');

    const data = JSON.stringify({
      email: email,
      novaSenha: novaSenha,
      codigo: 'RESET2024'
    });

    const options = {
      hostname: 'central-resultados-production.up.railway.app',
      port: 443,
      path: '/api/auth/reset-senha-emergencial',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Resposta:', body);
        
        if (res.statusCode === 200) {
          console.log('\n✅ SENHA RESETADA COM SUCESSO!');
          console.log(`\nAgora você pode fazer login com:`);
          console.log(`   E-mail: ${email}`);
          console.log(`   Senha: ${novaSenha}`);
          console.log(`\nAcesse: https://resultados.astassessoria.com.br/login\n`);
        } else {
          console.log('\n❌ ERRO ao resetar senha');
          console.log('Verifique se o e-mail está correto\n');
        }

        rl.close();
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Erro na requisição:', error.message);
      console.log('\nVerifique se:');
      console.log('1. O backend está rodando no Railway');
      console.log('2. Você tem conexão com a internet\n');
      rl.close();
    });

    req.write(data);
    req.end();
  });
});
