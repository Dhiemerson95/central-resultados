# Configuração para Desenvolvimento Local

O sistema agora usa a seguinte lógica:

## 🏠 Modo Desenvolvimento (Padrão)
- **Condição**: `NODE_ENV != "production"` E `USE_RAILWAY != "true"`
- **Conexão**: `localhost:5432`
- **Valores padrão**:
  - Host: `localhost`
  - Porta: `5432`
  - Database: `central_resultados`
  - User: `postgres`
  - Password: `postgres`

## ☁️ Modo Produção (Railway)
- **Condição**: `NODE_ENV === "production"` OU `USE_RAILWAY === "true"`
- **Conexão**: Usa `DATABASE_URL` do Railway
- **SSL**: Habilitado automaticamente

## 📋 Arquivo .env LOCAL (seu PC)

Crie/edite o arquivo `backend/.env` com:

```env
NODE_ENV=development
PORT=5000

# Banco Local
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=central_resultados
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_do_postgres

# JWT
JWT_SECRET=sua_chave_secreta
```

## 🚀 Como Usar

### Desenvolvimento Local (seu PC):
```powershell
cd backend
npm run dev
```
✅ Conectará em `localhost:5432`

### Testar conexão Railway localmente:
```powershell
cd backend
$env:USE_RAILWAY="true"
npm run dev
```
⚠️ Usará `DATABASE_URL` (banco do Railway)

### Produção (Railway):
- Railway detecta automaticamente
- Não precisa fazer nada, já está configurado

## 🔧 Verificar Conexão

Ao iniciar, você verá:
```
🔗 Usando configuração LOCAL (localhost)
📋 Config local: { host: 'localhost', port: 5432, database: 'central_resultados', user: 'postgres' }
✅ Conectado ao banco de dados PostgreSQL
```

Se estiver usando Railway:
```
🔗 Usando DATABASE_URL para conexão (Railway/Produção)
✅ Conectado ao banco de dados PostgreSQL
```

## ⚠️ Se der erro "ENOTFOUND" ou "ECONNREFUSED"

1. **Verifique se PostgreSQL está rodando**:
   ```powershell
   # Ver serviços em execução
   Get-Service | Where-Object {$_.Name -like "*postgres*"}
   
   # Iniciar PostgreSQL
   Start-Service postgresql-x64-14  # (ou sua versão)
   ```

2. **Verifique a senha**:
   - Abra pgAdmin
   - Tente conectar em `localhost:5432`
   - Use a mesma senha no `.env`

3. **Crie o banco se não existir**:
   ```sql
   CREATE DATABASE central_resultados;
   ```

4. **Remova DATABASE_URL do .env local**:
   - Se tiver `DATABASE_URL=...` no seu `.env`, comente ou remova
   - Só deve existir no Railway
