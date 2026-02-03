const bcrypt = require('bcryptjs');

const senha = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(senha, 10);

console.log('\n===========================================');
console.log('Hash gerado com sucesso!');
console.log('===========================================');
console.log(`Senha: ${senha}`);
console.log(`Hash: ${hash}`);
console.log('===========================================\n');
console.log('Use este hash no SQL ou no cadastro de usuário');
console.log('\nExemplo de SQL:');
console.log(`INSERT INTO usuarios (nome, email, senha, perfil)`);
console.log(`VALUES ('Admin', 'admin@astassessoria.com.br', '${hash}', 'admin');`);
console.log('\n');
