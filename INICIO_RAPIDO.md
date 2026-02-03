# Início Rápido - Sistema Central de Resultados

## Passo a Passo Completo

### 1️⃣ Instalar PostgreSQL
- Baixe em: https://www.postgresql.org/download/windows/
- Instale e anote a senha do usuário `postgres`

### 2️⃣ Criar o Banco de Dados
Abra o pgAdmin ou psql e execute:
```sql
CREATE DATABASE central_resultados;
```

### 3️⃣ Configurar o Backend

```powershell
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
Copy-Item env.example .env

# Editar configurações (use notepad ou seu editor)
notepad .env
```

**Configurações obrigatórias no .env:**
```env
DATABASE_PASSWORD=sua_senha_postgres_aqui
JWT_SECRET=trocar_por_string_aleatoria_longa
SMTP_USER=seu_email@astassessoria.com.br
SMTP_PASS=sua_senha_outlook
EMAIL_FROM=seu_email@astassessoria.com.br
```

### 4️⃣ Criar as Tabelas

```powershell
npm run migrate
```

Você verá: `Tabelas criadas com sucesso!`

### 5️⃣ Criar Usuário Inicial

```powershell
# Gerar hash da senha
npm run gerar-senha minhasenha123
```

Copie o hash gerado e execute no PostgreSQL:

```sql
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES ('Administrador', 'admin@astassessoria.com.br', 
        'COLE_O_HASH_AQUI', 'admin');
```

### 6️⃣ Iniciar o Backend

```powershell
npm run dev
```

Você verá: `Servidor rodando na porta 5000`

### 7️⃣ Configurar o Frontend

Abra um **novo terminal PowerShell**:

```powershell
# Entrar na pasta do frontend
cd ..\frontend

# Instalar dependências
npm install

# Iniciar o frontend
npm run dev
```

Você verá: `Local: http://localhost:3000`

### 8️⃣ Acessar o Sistema

1. Abra o navegador em: **http://localhost:3000**
2. Faça login com:
   - Email: `admin@astassessoria.com.br`
   - Senha: a que você definiu no passo 5

### 9️⃣ Cadastrar Dados Iniciais

Use ferramentas como **Postman**, **Insomnia** ou **Thunder Client** (VS Code):

#### Fazer Login e Pegar Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@astassessoria.com.br",
  "senha": "minhasenha123"
}
```

Copie o `token` da resposta.

#### Cadastrar Empresa
```http
POST http://localhost:5000/api/empresas
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "razao_social": "Empresa Teste LTDA",
  "cnpj": "12.345.678/0001-90",
  "email_padrao": "rh@empresa.com.br",
  "codigo_soc": "EMP001"
}
```

#### Cadastrar Clínica (Importação Manual)
```http
POST http://localhost:5000/api/clinicas
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "nome": "Clínica Saúde",
  "tipo_integracao": "manual"
}
```

### 🎉 Pronto!

Agora você pode:
- Cadastrar exames pelo painel
- Enviar e-mails com resultados
- Importar arquivos Excel/CSV
- Configurar integrações com APIs

## Comandos Úteis

### Backend
```powershell
npm run dev          # Iniciar em desenvolvimento
npm start            # Iniciar em produção
npm run migrate      # Criar/atualizar tabelas
npm run gerar-senha  # Gerar hash de senha
```

### Frontend
```powershell
npm run dev          # Iniciar em desenvolvimento
npm run build        # Compilar para produção
npm run preview      # Visualizar build de produção
```

## Troubleshooting

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme usuário e senha no `.env`
- Teste conexão no pgAdmin

### Erro ao Enviar E-mail
- Verifique credenciais do Outlook no `.env`
- Confirme que a conta permite SMTP
- Teste manualmente com cliente de e-mail

### Porta 5000 ou 3000 em Uso
Altere no `.env` (backend) ou `vite.config.js` (frontend)

## Links Úteis

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Suporte

Consulte o `README.md` completo para:
- Documentação completa da API
- Exemplos de integração
- Configuração avançada
- Estrutura do projeto
