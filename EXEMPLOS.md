# Exemplos Práticos de Uso

## 1. Exemplo de Clínica com API REST

### Configuração da Clínica

Suponha que você tem uma clínica parceira chamada "Clínica Vital" que possui uma API REST.

**Endpoint da clínica:** `https://api.clinicavital.com.br/v1/exames`  
**Autenticação:** Bearer Token  
**Formato de resposta:**
```json
{
  "data": [
    {
      "paciente_nome": "João Silva",
      "cpf_paciente": "123.456.789-00",
      "data_exame": "2024-01-15",
      "tipo": "Admissional",
      "status_resultado": "Apto",
      "empresa_cliente": "Empresa XYZ LTDA"
    }
  ]
}
```

**Cadastro no sistema:**
```json
POST http://localhost:5000/api/clinicas
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "nome": "Clínica Vital",
  "cnpj": "12.345.678/0001-90",
  "tipo_integracao": "api",
  "intervalo_busca": 30,
  "config_api": {
    "url": "https://api.clinicavital.com.br/v1/exames",
    "metodo": "GET",
    "headers": {
      "Authorization": "Bearer abc123xyz789",
      "Content-Type": "application/json"
    },
    "params": {
      "status": "concluido"
    },
    "mapeamento": {
      "arrayPath": "data",
      "funcionario_nome": "paciente_nome",
      "funcionario_cpf": "cpf_paciente",
      "data_atendimento": "data_exame",
      "tipo_exame": "tipo",
      "resultado": "status_resultado",
      "empresa": "empresa_cliente"
    }
  }
}
```

**Resultado:** O sistema buscará automaticamente novos exames a cada 30 minutos.

---

## 2. Exemplo de Clínica com Importação Excel

### Planilha Excel da Clínica

A "Clínica Saúde Mais" envia uma planilha Excel semanal com esta estrutura:

| Nome Completo    | CPF           | Data do Exame | Tipo de Exame   | Resultado          | Empresa Cliente |
|------------------|---------------|---------------|-----------------|-------------------|-----------------|
| Maria Santos     | 987.654.321-00| 15/01/2024    | Admissional     | Apto              | ABC Indústrias  |
| Pedro Costa      | 111.222.333-44| 15/01/2024    | Periódico       | Apto com restrições| XYZ Comercio   |

**Cadastro da clínica:**
```json
POST http://localhost:5000/api/clinicas
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "nome": "Clínica Saúde Mais",
  "cnpj": "98.765.432/0001-10",
  "tipo_integracao": "importacao",
  "config_importacao": {
    "mapeamento": {
      "funcionario_nome": "Nome Completo",
      "funcionario_cpf": "CPF",
      "data_atendimento": "Data do Exame",
      "tipo_exame": "Tipo de Exame",
      "resultado": "Resultado",
      "empresa": "Empresa Cliente"
    }
  }
}
```

**Importação do arquivo:**
```http
POST http://localhost:5000/api/clinicas/importar
Authorization: Bearer {seu_token}
Content-Type: multipart/form-data

clinica_id: 2
arquivo: [selecionar o arquivo exames_janeiro.xlsx]
```

**Resultado:** Todos os exames da planilha serão importados automaticamente.

---

## 3. Cadastrar Exame Manualmente

### Via API

```json
POST http://localhost:5000/api/exames
Authorization: Bearer {seu_token}
Content-Type: multipart/form-data

empresa_id: 1
funcionario_nome: Carlos Alberto
funcionario_cpf: 555.666.777-88
funcionario_matricula: 12345
data_atendimento: 2024-01-20
tipo_exame: Demissional
resultado: Apto
status: concluído
codigo_exame_soc: EXM2024001
observacao: Funcionário apresentou-se em boas condições de saúde
arquivo: [selecionar laudo.pdf]
```

### Via Interface Web

1. Acesse `http://localhost:3000`
2. Faça login
3. Clique em "+ Novo Exame"
4. Preencha o formulário
5. Faça upload do PDF
6. Clique em "Salvar"

---

## 4. Enviar Resultado por E-mail

### Via API

```json
POST http://localhost:5000/api/exames/1/enviar-email
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "destinatario": "rh@empresacliente.com.br",
  "assunto": "Resultado de Exame Ocupacional - Carlos Alberto",
  "corpo": "Segue em anexo o resultado do exame ocupacional."
}
```

### Via Interface Web

1. Na tabela de exames, localize o exame desejado
2. Clique no botão 📧 (Enviar E-mail)
3. Confirme ou edite o destinatário
4. Personalize a mensagem (opcional)
5. Clique em "Enviar E-mail"

**O que acontece:**
- E-mail é enviado com o PDF anexado
- Campo "Enviado para cliente" é marcado como SIM
- Data de envio é registrada
- Histórico é salvo

---

## 5. Filtrar Exames

### Exemplo 1: Exames não enviados ao cliente

```
Filtros:
- Enviado p/ Cliente: Não
```

**Resultado:** Lista todos os exames que ainda precisam ser enviados.

### Exemplo 2: Exames pendentes de uma empresa específica

```
Filtros:
- Empresa: ABC Indústrias
- Status: Pendente
```

### Exemplo 3: Exames de janeiro não lançados no SOC

```
Filtros:
- Data Início: 01/01/2024
- Data Fim: 31/01/2024
- Lançado no SOC: Não
```

### Exemplo 4: Buscar exame de um funcionário

```
Buscar Funcionário: Maria Santos
```
ou
```
Buscar Funcionário: 987.654.321-00
```

---

## 6. Controlar Fluxo de Trabalho

### Cenário Completo

**Exame recebido da clínica:**
- Status: `pendente`
- Enviado para cliente: `Não`
- Lançado no SOC: `Não`

**Passo 1: Conferir resultado**
1. Abrir o exame
2. Verificar dados e laudo
3. Alterar Status para: `conferido`
4. Salvar

**Passo 2: Enviar ao cliente**
1. Clicar em 📧 Enviar E-mail
2. Confirmar envio
3. Sistema marca automaticamente "Enviado para cliente" = `Sim`

**Passo 3: Lançar no SOC**
1. Após lançar manualmente no SOC
2. Clicar no botão ⏳ na coluna SOC
3. Sistema marca "Lançado no SOC" = `Sim`

**Passo 4: Finalizar**
1. Alterar Status para: `faturado`
2. Fluxo completo!

---

## 7. Verificar Logs de Integração

### Via API

```http
GET http://localhost:5000/api/clinicas/logs/listar?clinica_id=1
Authorization: Bearer {seu_token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "clinica_nome": "Clínica Vital",
    "tipo": "api",
    "status": "sucesso",
    "mensagem": "5 exames processados",
    "dados": {
      "total": 5
    },
    "criado_em": "2024-01-20T10:30:00Z"
  },
  {
    "id": 2,
    "clinica_nome": "Clínica Vital",
    "tipo": "api",
    "status": "erro",
    "mensagem": "Connection timeout",
    "criado_em": "2024-01-20T11:00:00Z"
  }
]
```

---

## 8. Sincronizar Clínica Manualmente

Se quiser forçar uma sincronização fora do horário programado:

```http
POST http://localhost:5000/api/clinicas/1/sincronizar
Authorization: Bearer {seu_token}
```

**Resposta de sucesso:**
```json
{
  "mensagem": "Sincronização realizada com sucesso",
  "total": 3
}
```

---

## 9. Fluxo Completo de Uso Diário

### Manhã (9h)

1. **Verificar novos exames**
   - Filtro: Status = `pendente`
   - Conferir se todos os dados vieram corretos

2. **Processar exames prontos**
   - Filtro: Status = `concluído` + Enviado = `Não`
   - Enviar por e-mail aos clientes

### Tarde (14h)

3. **Lançar no SOC**
   - Filtro: Enviado = `Sim` + Lançado SOC = `Não`
   - Lançar no sistema SOC
   - Marcar como lançado no sistema

4. **Conferir pendências**
   - Filtro: Status = `aguardando laudo` ou `falta imagem`
   - Contatar clínicas sobre pendências

### Fim do Dia (17h)

5. **Verificar logs**
   - Acessar logs de integração
   - Verificar se houve erros de sincronização
   - Resolver problemas encontrados

6. **Relatório**
   - Exportar lista de exames do dia
   - Verificar métricas

---

## 10. Preparar Dados para SOC (Futuro)

Quando a integração com SOC estiver pronta, os dados já estarão estruturados:

### Dados disponíveis por exame:
- `codigo_soc` da empresa (já cadastrado)
- `codigo_exame_soc` do exame
- `funcionario_cpf` e `funcionario_matricula`
- `tipo_exame`, `resultado`, `data_atendimento`
- Controle de `lancado_soc` e `data_lancamento_soc`

### Como será o fluxo:
1. Sistema verifica exames com `lancado_soc = false`
2. Envia dados via API do SOC
3. Marca como lançado automaticamente
4. Registra resposta no `dados_adicionais`

---

## 11. Exemplo de Arquivo CSV para Importação

**arquivo: exames_fevereiro.csv**
```csv
Nome Completo,CPF,Data do Exame,Tipo de Exame,Resultado,Empresa Cliente
"João Silva","123.456.789-00","2024-02-01","Admissional","Apto","Empresa ABC"
"Maria Santos","987.654.321-00","2024-02-01","Periódico","Apto","Empresa XYZ"
"Pedro Costa","111.222.333-44","2024-02-02","Demissional","Apto com restrições","Empresa ABC"
```

**Importar:**
```http
POST http://localhost:5000/api/clinicas/importar
Authorization: Bearer {seu_token}
Content-Type: multipart/form-data

clinica_id: 2
arquivo: [exames_fevereiro.csv]
```

---

## 12. Dicas de Uso

### ✅ Boas Práticas

1. **Sempre cadastre empresas antes dos exames**
   - Configure o `email_padrao` para facilitar envios

2. **Use o campo `observacao` para informações importantes**
   - Ex: "Funcionário precisa refazer raio-X"

3. **Configure o `codigo_soc` nas empresas**
   - Facilita integração futura

4. **Mantenha os status atualizados**
   - Facilita o acompanhamento

5. **Revise os logs regularmente**
   - Identifique problemas de integração rapidamente

### ⚠️ Evite

1. Deletar exames após faturamento (marque como inativo no futuro)
2. Não configurar backups do banco de dados
3. Usar senhas fracas
4. Compartilhar tokens JWT

---

## 13. Troubleshooting Comum

### Problema: Importação falha
**Solução:** Verifique se as colunas do arquivo correspondem ao mapeamento

### Problema: E-mail não envia
**Solução:** Confirme credenciais SMTP no `.env` e se a conta permite SMTP

### Problema: Sincronização não funciona
**Solução:** Verifique logs, URL da API, token de autenticação da clínica

### Problema: Upload de arquivo falha
**Solução:** Verifique tamanho (máx 10MB) e formato (PDF, JPG, PNG)

---

## 14. Próximos Passos

Após dominar o básico:

1. Criar interface para cadastro de Empresas e Clínicas
2. Adicionar relatórios personalizados
3. Implementar dashboard com métricas
4. Configurar notificações por e-mail
5. Integrar com o SOC quando disponível

---

**Dúvidas?** Consulte o `README.md` completo para documentação detalhada.
