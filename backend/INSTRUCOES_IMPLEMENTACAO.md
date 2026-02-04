# Instruções de Implementação - Central de Resultados

## Resumo das Alterações Implementadas

### 1. CORS e Erro de Exclusão (✅ RESOLVIDO)
- **CORS configurado** para aceitar requisições de `https://resultados.astassessoria.com.br`
- **Exclusão de exames corrigida**: agora remove histórico de e-mails antes de deletar o exame

### 2. Sistema de Configurações
- ✅ Tabela `configuracoes_sistema` criada
- ✅ Upload e gestão de logo
- ✅ Personalização de cores (primária e secundária)
- ✅ Configuração de SMTP no banco de dados
- ✅ Opção de exibir/ocultar data e hora

**Rotas criadas:**
- `GET /api/configuracoes` - Obter configurações
- `PUT /api/configuracoes` - Atualizar configurações (com upload de logo)
- `POST /api/configuracoes/testar-smtp` - Testar conexão SMTP

### 3. Sistema de Permissões Dinâmicas
- ✅ Tabelas de permissões, perfis e relacionamentos criadas
- ✅ Perfis padrão: Admin, Operador, Cliente
- ✅ 23 permissões granulares por módulo e ação
- ✅ Permissões customizadas por usuário

**Rotas criadas:**
- `GET /api/permissoes/permissoes` - Listar todas as permissões
- `GET /api/permissoes/perfis` - Listar perfis com suas permissões
- `POST /api/permissoes/perfis` - Criar novo perfil
- `PUT /api/permissoes/perfis/:id` - Atualizar perfil
- `GET /api/permissoes/usuarios/:usuario_id/permissoes` - Obter permissões de um usuário
- `PUT /api/permissoes/usuarios/:usuario_id/permissoes` - Atualizar permissões customizadas

### 4. Fluxo de Aprovação de Exames
- ✅ Campo `status_revisao` (pendente/aprovado)
- ✅ Campo `liberado_cliente` (boolean)
- ✅ Rastreamento de quem liberou e quando
- ✅ Exames nascem com status "pendente" e não ficam visíveis para o cliente

**Rotas criadas:**
- `GET /api/anexos/exames/pendentes-revisao` - Listar exames aguardando liberação
- `POST /api/anexos/exames/:exame_id/liberar` - Liberar exame para o cliente

### 5. Gestão de Múltiplos Anexos
- ✅ Tabela `exames_anexos` com ID único por arquivo
- ✅ Múltiplos uploads sem sobrescrever
- ✅ Marcar arquivo oficial (apenas um por exame)
- ✅ Rastreamento de quem enviou cada arquivo

**Rotas criadas:**
- `GET /api/anexos/exames/:exame_id/anexos` - Listar anexos do exame
- `POST /api/anexos/exames/:exame_id/anexos` - Adicionar novo anexo
- `PUT /api/anexos/anexos/:anexo_id/oficial` - Marcar anexo como oficial
- `DELETE /api/anexos/anexos/:anexo_id` - Deletar anexo

### 6. API Externa para Receber Laudos
- ✅ Endpoint público para integração
- ✅ Validação por API Key
- ✅ Logs de integração

**Rota criada:**
- `POST /api/externa/receber-laudo` - Receber laudo de software externo

### 7. Exportação para Excel (XLSX)
- ✅ Exportação de exames com filtros
- ✅ Exportação de empresas
- ✅ Exportação de clínicas

**Rotas criadas:**
- `GET /api/exportar/exames?empresa_id=X&data_inicio=Y` - Exportar exames
- `GET /api/exportar/empresas` - Exportar empresas
- `GET /api/exportar/clinicas` - Exportar clínicas

## Passo a Passo para Ativar

### 1. Instalar dependência XLSX
```powershell
cd central-resultados\backend
npm install xlsx
```

### 2. Executar Migrations no Railway
Acesse o Railway, abra o banco PostgreSQL e execute o arquivo:
`backend/scripts/migrations.sql`

Isso criará:
- Tabela `configuracoes_sistema`
- Tabelas de permissões (`permissoes`, `perfis`, `perfis_permissoes`, `usuarios_permissoes`)
- Tabela `exames_anexos`
- Campos novos em `exames` (`status_revisao`, `liberado_cliente`, etc.)
- Coluna `perfil_id` em `usuarios`

### 3. Reiniciar o Backend
```powershell
cd central-resultados\backend
npm run dev
```

### 4. Testar Endpoints

#### Testar CORS:
```bash
curl -X GET https://seu-backend.railway.app/api/health \
  -H "Origin: https://resultados.astassessoria.com.br"
```

#### Configurar SMTP:
```bash
PUT /api/configuracoes
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_usuario": "seu-email@gmail.com",
  "smtp_senha": "sua-senha-app",
  "smtp_secure": false
}
```

#### Liberar Exame para Cliente:
```bash
POST /api/anexos/exames/123/liberar
Headers: Authorization: Bearer {token}
```

#### Exportar Exames:
```bash
GET /api/exportar/exames?data_inicio=2024-01-01&data_fim=2024-12-31
Headers: Authorization: Bearer {token}
```

## Restrições para Perfil Cliente (Implementar no Frontend)

### Menus Ocultos:
- Empresas
- Clínicas
- Usuários

### Tela de Exames:
- Ocultar botão "+ Novo Exame"
- Ocultar colunas "Enviado" e "SOC"
- Manter apenas: Imprimir e Visualizar Laudo

### Filtros:
- Mostrar apenas exames onde `liberado_cliente = true`

## Exemplo de Uso da API Externa

Software externo pode enviar laudos assim:

```javascript
const formData = new FormData();
formData.append('clinica_id', '1');
formData.append('empresa_id', '5');
formData.append('funcionario_nome', 'João Silva');
formData.append('funcionario_cpf', '12345678900');
formData.append('data_atendimento', '2024-12-01');
formData.append('tipo_exame', 'ASO Admissional');
formData.append('resultado', 'Apto');
formData.append('arquivo', laudoPDF);
formData.append('api_key', 'sua-chave-aqui');

fetch('https://seu-backend/api/externa/receber-laudo', {
  method: 'POST',
  body: formData
});
```

## Próximos Passos (Frontend)

1. **Criar tela de Configurações** com:
   - Upload de logo com preview
   - Seletores de cor
   - Formulário SMTP
   - Toggle de data/hora

2. **Implementar sistema de permissões no frontend**:
   - Verificar permissões antes de renderizar botões/menus
   - Criar componente de gestão de perfis
   - Tela de atribuição de permissões customizadas

3. **Tela de Curadoria de Exames**:
   - Lista de exames pendentes de revisão
   - Visualização de múltiplos anexos
   - Botão "Liberar para Cliente"
   - Marcar anexo oficial

4. **Adicionar botões de exportação XLSX** em:
   - Listagem de Exames
   - Listagem de Empresas
   - Listagem de Clínicas

5. **Implementar filtros por perfil**:
   - Se perfil = Cliente: mostrar apenas exames liberados
   - Ocultar menus conforme permissões

## Observações Importantes

- ✅ Todas as rotas de API aceitam requisições de `resultados.astassessoria.com.br`
- ✅ SMTP agora busca configurações do banco primeiro, depois do .env
- ✅ Exames sempre nascem com `status_revisao='pendente'` e `liberado_cliente=false`
- ✅ Apenas anexos marcados como "oficial" devem ser exibidos ao cliente
- ⚠️  Lembre-se de configurar as permissões no frontend para respeitar o perfil do usuário
