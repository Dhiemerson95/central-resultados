# Script para criar usuário inicial
# Execute após rodar npm run migrate

$env:PGPASSWORD = "sua_senha_postgres"

$sql = @"
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES ('Administrador', 'admin@astassessoria.com.br', 
        '\$2a\$10\$YourHashedPasswordHere', 'admin');
"@

psql -U postgres -d central_resultados -c $sql

Write-Host "Usuário criado com sucesso!"
Write-Host "Email: admin@astassessoria.com.br"
Write-Host "Senha: (defina no hash acima)"
