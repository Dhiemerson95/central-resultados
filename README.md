# Sistema Central de Resultados de Exames Ocupacionais

Sistema web para centralizar resultados de exames ocupacionais de várias clínicas parceiras da AST Assessoria.

## Estrutura do Projeto

```
CENTRAL_RESULTADOS/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Controladores da API
│   │   │   ├── authController.js
│   │   │   ├── examesController.js
│   │   │   ├── empresasController.js
│   │   │   └── clinicasController.js
│   │   ├── database/              # Configuração do banco
│   │   │   ├── db.js
│   │   │   └── migrate.js
│   │   ├── middleware/            # Middlewares
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/                # Rotas da API
│   │   │   ├── authRoutes.js
│   │   │   ├── examesRoutes.js
│   │   │   ├── empresasRoutes.js
│   │   │   └── clinicasRoutes.js
│   │   ├── services/              # Serviços
│   │   │   ├── emailService.js
│   │   │   ├── importacaoService.js
│   │   │   └── integracaoService.js
│   │   └── server.js              # Servidor principal
│   ├── uploads/                   # Arquivos enviados
│   ├── package.json
│   └── env.example                # Variáveis de ambiente
│
└── frontend/
    ├── src/
    │   ├── components/            # Componentes React
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── contexts/              # Contextos React
    │   │   └── AuthContext.jsx
    │   ├── pages/                 # Páginas
    │   │   ├── Login.jsx
    │   │   └── Exames.jsx
    │   ├── services/              # Serviços do frontend
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Nodemailer** para envio de e-mails via SMTP
- **XLSX e CSV-Parser** para importação de arquivos
- **Axios** para integração com APIs de clínicas
- **Node-cron** para agendamento de tarefas

### Frontend
- **React 18** com Vite
- **React Router** para navegação
- **Axios** para requisições HTTP
- CSS puro (responsivo)

## Modelo do Banco de Dados

### Tabela: usuarios
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `senha` (VARCHAR - hash bcrypt)
- `perfil` (VARCHAR - 'admin' ou 'usuario')
- `ativo` (BOOLEAN)
- `criado_em`, `atualizado_em` (TIMESTAMP)

### Tabela: empresas
- `id` (SERIAL PRIMARY KEY)
- `razao_social` (VARCHAR)
- `cnpj` (VARCHAR)
- `email_padrao` (VARCHAR)
- `codigo_soc` (VARCHAR) - Para integração futura com SOC
- `telefone` (VARCHAR)
- `observacao` (TEXT)
- `ativo` (BOOLEAN)
- `criado_em`, `atualizado_em` (TIMESTAMP)

### Tabela: clinicas
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR)
- `cnpj` (VARCHAR)
- `tipo_integracao` (VARCHAR) - 'api', 'importacao' ou 'manual'
- `config_api` (JSONB) - Configurações da API
- `config_importacao` (JSONB) - Mapeamento de colunas
- `intervalo_busca` (INTEGER) - Minutos entre sincronizações
- `ativo` (BOOLEAN)
- `ultima_sincronizacao` (TIMESTAMP)
- `criado_em`, `atualizado_em` (TIMESTAMP)

### Tabela: exames
- `id` (SERIAL PRIMARY KEY)
- `empresa_id` (INTEGER FK)
- `clinica_id` (INTEGER FK)
- `funcionario_nome` (VARCHAR)
- `funcionario_cpf` (VARCHAR)
- `funcionario_matricula` (VARCHAR)
- `data_atendimento` (DATE)
- `tipo_exame` (VARCHAR)
- `resultado` (VARCHAR) - 'Apto', 'Inapto', 'Apto com restrições'
- `status` (VARCHAR) - 'pendente', 'concluído', etc.
- `enviado_cliente` (BOOLEAN)
- `data_envio_cliente` (TIMESTAMP)
- `lancado_soc` (BOOLEAN)
- `data_lancamento_soc` (TIMESTAMP)
- `observacao` (TEXT)
- `codigo_exame_soc` (VARCHAR) - Para integração futura
- `arquivo_laudo` (VARCHAR) - Nome do arquivo PDF
- `dados_adicionais` (JSONB) - Dados extras da API
- `criado_em`, `atualizado_em` (TIMESTAMP)

### Tabelas Auxiliares
- `logs_integracao` - Histórico de sincronizações
- `historico_emails` - Registro de e-mails enviados

## Funcionalidades Implementadas

### 1. Painel de Exames
- ✅ Listagem completa de todos os exames
- ✅ Filtros por empresa, clínica, data, tipo, status
- ✅ Filtros específicos para "Enviado para cliente" e "Lançado no SOC"
- ✅ Busca por nome ou CPF do funcionário
- ✅ Visualização clara com badges coloridos

### 2. Cadastro e Edição de Exames
- ✅ Formulário completo com todos os campos
- ✅ Upload de arquivos (PDF, imagens)
- ✅ Validação de campos obrigatórios
- ✅ Edição inline de exames existentes

### 3. Integração com Clínicas

#### Integração via API REST
- ✅ Cadastro de clínicas com tipo "api"
- ✅ Configuração de endpoint, método, headers, autenticação
- ✅ Sincronização automática em intervalos configuráveis
- ✅ Mapeamento de campos da resposta da API
- ✅ Log de todas as sincronizações

#### Importação de Arquivos (Excel/CSV)
- ✅ Cadastro de clínicas com tipo "importacao"
- ✅ Upload e processamento de arquivos Excel/CSV
- ✅ Mapeamento flexível de colunas
- ✅ Importação em lote

### 4. Envio de E-mail
- ✅ Botão "Enviar por e-mail" em cada exame
- ✅ Pré-preenchimento com e-mail da empresa
- ✅ Assunto e corpo personalizáveis
- ✅ Anexo automático do PDF do laudo
- ✅ Marcação automática de "Enviado para cliente"
- ✅ Configuração SMTP do Outlook

### 5. Controles de Fluxo
- ✅ Campo "Enviado para cliente" com data de envio
- ✅ Campo "Lançado no SOC" com data de lançamento
- ✅ Botões rápidos para marcar/desmarcar
- ✅ Filtros específicos no painel

### 6. Preparação para Integração SOC
- ✅ Campo `codigo_soc` nas empresas
- ✅ Campo `codigo_exame_soc` nos exames
- ✅ Campos `funcionario_cpf` e `funcionario_matricula`
- ✅ Campo `lancado_soc` com controle de data
- ✅ Estrutura preparada para adicionar rotina de envio

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL 12+ instalado e rodando
- Conta de e-mail do Outlook configurada

### 1. Configurar o Banco de Dados

Abra o PostgreSQL e crie o banco:

```sql
CREATE DATABASE central_resultados;
```

### 2. Configurar o Backend

No PowerShell:

```powershell
cd backend

# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
Copy-Item env.example .env

# Editar o arquivo .env com suas configurações
notepad .env
```

**Configurações importantes no .env:**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_postgres

JWT_SECRET=trocar_por_string_aleatoria_segura

SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@astassessoria.com.br
SMTP_PASS=sua_senha_outlook

EMAIL_FROM=seu_email@astassessoria.com.br
EMAIL_FROM_NAME=AST Assessoria - Exames Ocupacionais
```

### 3. Criar as Tabelas no Banco

```powershell
npm run migrate
```

### 4. Criar Usuário Inicial

Execute no PostgreSQL ou crie uma rota temporária:

```sql
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES ('Administrador', 'admin@astassessoria.com.br', 
        '$2a$10$xC3Q9qZ8kfZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5', 'admin');
```

**Nota:** A senha hash acima é apenas exemplo. Use bcrypt para gerar:

```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('sua_senha_aqui', 10));
```

Ou use a rota POST /api/auth/usuarios após subir o servidor.

### 5. Iniciar o Backend

```powershell
# Modo desenvolvimento (com nodemon)
npm run dev

# Ou modo produção
npm start
```

O servidor estará rodando em `http://localhost:5000`

### 6. Configurar o Frontend

Abra um novo terminal PowerShell:

```powershell
cd ..\frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 7. Acessar o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Faça login com as credenciais criadas
3. Comece a cadastrar empresas e clínicas!

## Como Usar

### Cadastrar Empresas

Empresas são cadastradas via API. Use ferramentas como Postman ou crie uma interface:

```bash
POST http://localhost:5000/api/empresas
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "razao_social": "Empresa Exemplo LTDA",
  "cnpj": "12.345.678/0001-90",
  "email_padrao": "rh@empresa.com.br",
  "codigo_soc": "EMP001",
  "telefone": "(11) 1234-5678"
}
```

### Cadastrar Clínicas

#### Clínica com Integração via API

```json
{
  "nome": "Clínica Saúde Ocupacional",
  "cnpj": "98.765.432/0001-10",
  "tipo_integracao": "api",
  "intervalo_busca": 60,
  "config_api": {
    "url": "https://api.clinica.com.br/exames",
    "metodo": "GET",
    "headers": {
      "Authorization": "Bearer token_da_clinica",
      "Content-Type": "application/json"
    },
    "params": {
      "data_inicio": "2024-01-01"
    },
    "mapeamento": {
      "funcionario_nome": "nome_paciente",
      "funcionario_cpf": "cpf",
      "data_atendimento": "data_exame",
      "tipo_exame": "tipo",
      "resultado": "resultado",
      "empresa": "empresa_nome"
    }
  }
}
```

#### Clínica com Importação Manual

```json
{
  "nome": "Clínica Excel",
  "tipo_integracao": "importacao",
  "config_importacao": {
    "mapeamento": {
      "funcionario_nome": "Nome do Funcionário",
      "funcionario_cpf": "CPF",
      "data_atendimento": "Data",
      "tipo_exame": "Tipo de Exame",
      "resultado": "Resultado",
      "empresa": "Empresa"
    }
  }
}
```

### Importar Exames de Arquivo

1. No Postman ou interface que criar:

```bash
POST http://localhost:5000/api/clinicas/importar
Authorization: Bearer {seu_token}
Content-Type: multipart/form-data

clinica_id: 1
arquivo: [selecionar arquivo .xlsx ou .csv]
```

2. O arquivo deve ter colunas correspondentes ao mapeamento configurado

### Enviar Exame por E-mail

Pelo frontend:
1. Clique no botão 📧 na linha do exame
2. Confirme ou edite o destinatário
3. Personalize assunto/corpo se necessário
4. Clique em "Enviar E-mail"

O sistema automaticamente:
- Anexa o PDF do laudo (se existir)
- Marca o exame como "Enviado para cliente"
- Registra o envio no histórico

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/usuarios` - Criar usuário

### Exames
- `GET /api/exames` - Listar exames (com filtros)
- `GET /api/exames/:id` - Obter exame
- `POST /api/exames` - Criar exame
- `PUT /api/exames/:id` - Atualizar exame
- `DELETE /api/exames/:id` - Deletar exame
- `POST /api/exames/:id/enviar-email` - Enviar por e-mail
- `PUT /api/exames/:id/lancar-soc` - Marcar lançamento no SOC

### Empresas
- `GET /api/empresas` - Listar empresas
- `GET /api/empresas/:id` - Obter empresa
- `POST /api/empresas` - Criar empresa
- `PUT /api/empresas/:id` - Atualizar empresa
- `DELETE /api/empresas/:id` - Deletar empresa

### Clínicas
- `GET /api/clinicas` - Listar clínicas
- `GET /api/clinicas/:id` - Obter clínica
- `POST /api/clinicas` - Criar clínica
- `PUT /api/clinicas/:id` - Atualizar clínica
- `DELETE /api/clinicas/:id` - Deletar clínica
- `POST /api/clinicas/:id/sincronizar` - Sincronizar agora
- `POST /api/clinicas/importar` - Importar arquivo
- `GET /api/clinicas/logs/listar` - Listar logs

## Integração Futura com SOC

O sistema está preparado para integração com o SOC. Quando tiver a documentação:

1. **Campos já disponíveis:**
   - `codigo_soc` na tabela empresas
   - `codigo_exame_soc` na tabela exames
   - `funcionario_cpf` e `funcionario_matricula`
   - Controle `lancado_soc` com data

2. **Como adicionar a integração:**

Criar `backend/src/services/socService.js`:

```javascript
const axios = require('axios');
const db = require('../database/db');

const enviarParaSOC = async (exameId) => {
  const result = await db.query(
    `SELECT e.*, emp.codigo_soc 
     FROM exames e 
     JOIN empresas emp ON e.empresa_id = emp.id 
     WHERE e.id = $1`,
    [exameId]
  );

  const exame = result.rows[0];

  const response = await axios.post('URL_DO_SOC', {
    empresa_codigo: exame.codigo_soc,
    funcionario_cpf: exame.funcionario_cpf,
    tipo_exame: exame.tipo_exame,
    resultado: exame.resultado,
    data: exame.data_atendimento
  }, {
    headers: {
      'Authorization': 'Bearer TOKEN_SOC'
    }
  });

  await db.query(
    'UPDATE exames SET lancado_soc = true, data_lancamento_soc = CURRENT_TIMESTAMP WHERE id = $1',
    [exameId]
  );

  return response.data;
};

module.exports = { enviarParaSOC };
```

3. Adicionar rota em `examesController.js`

## Observações Importantes

### Segurança
- Sempre use HTTPS em produção
- Troque o JWT_SECRET por uma string aleatória forte
- Configure firewall no PostgreSQL
- Use senhas fortes para o banco de dados

### E-mail
- Teste primeiro com e-mails internos
- Verifique se a conta do Outlook permite SMTP
- Em caso de erro "Less secure app access", habilite nas configurações da conta

### Backup
- Configure backups automáticos do PostgreSQL
- Faça backup da pasta `uploads/` regularmente

### Performance
- Para muitos exames, considere adicionar paginação
- Índices já estão criados nas colunas mais consultadas
- Otimize o `intervalo_busca` das clínicas conforme necessidade

## Suporte e Manutenção

Para dúvidas ou problemas:

1. Verifique os logs do backend (console do servidor)
2. Verifique logs de integração: `GET /api/clinicas/logs/listar`
3. Consulte logs do PostgreSQL
4. Revise as configurações do `.env`

## Próximos Passos Recomendados

1. Criar interface para cadastro de Empresas e Clínicas no frontend
2. Adicionar relatórios e dashboards
3. Implementar notificações automáticas
4. Adicionar controle de permissões mais granular
5. Implementar a integração com o SOC quando disponível
6. Adicionar testes automatizados

## Licença

Sistema desenvolvido para AST Assessoria - Uso interno.
