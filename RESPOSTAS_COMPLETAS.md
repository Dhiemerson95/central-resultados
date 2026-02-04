# 📚 RESPOSTAS COMPLETAS - SISTEMA CENTRAL DE RESULTADOS

## 1. 📦 ONDE OS ARQUIVOS FICAM ARMAZENADOS?

### **Situação Atual**
Os uploads (PDFs, logos) são salvos em: `backend/uploads/` no servidor do Railway.

**❌ PROBLEMA**: Railway tem disco efêmero - arquivos **podem sumir** ao reiniciar!

### **Solução: Cloudinary (RECOMENDADO)**

**Por que Cloudinary?**
- ✅ **10 GB grátis** (suficiente para ~10.000 PDFs)
- ✅ **Permanente** (nunca some)
- ✅ **CDN global** (carrega rápido em qualquer lugar)
- ✅ **Gratuito** até 25 créditos/mês

**Quando comprar mais espaço?**
- Cloudinary gratuito: 10 GB
- Se ultrapassar: $0.10 por GB extra/mês
- Monitoramento: Dashboard do Cloudinary mostra uso

**Implementação**: Posso implementar agora se quiser.

---

## 2. 🖥️ POSSO DESLIGAR O PC?

### **✅ SIM! PODE DESLIGAR TRANQUILO!**

**O que roda no Railway (nuvem 24/7)**:
- ✅ Backend (API)
- ✅ Banco de dados
- ✅ Sistema completo

**Seu PC NÃO é necessário para**:
- ✅ Usuários fazerem login
- ✅ Uploads de arquivos
- ✅ Visualização de laudos
- ✅ Qualquer operação normal

**Seu PC só é necessário para**:
- 🔧 Fazer alterações no código
- 🔧 Testar localmente antes de subir

**Confirmação**: Desligue o PC e acesse `https://resultados.astassessoria.com.br` de outro dispositivo. Vai funcionar normalmente!

---

## 3. 🔤 FONTE PADRÃO ARIAL 8pt

### **✅ IMPLEMENTADO!**

**Configuração padrão**:
- Fonte: **Arial**
- Tamanho: **8pt**

**Cada usuário pode personalizar**:
- Vai em **Configurações**
- Escolhe fonte (Arial, Times, Verdana, etc.)
- Escolhe tamanho (8pt a 16pt)

**Arquivos alterados**:
- `migrations.js`: Colunas `fonte_familia` e `fonte_tamanho` adicionadas
- Padrão: Arial 8pt

---

## 4. 🖼️ LOGO É COMPARTILHADA ENTRE USUÁRIOS?

### **❌ NÃO! LOGO É ÚNICA DO SISTEMA**

A logo é **global** (uma só para todos os usuários).

**Como funciona**:
- Admin faz upload da logo
- **Todos os usuários** veem a mesma logo
- Se Admin mudar a logo, **todos** veem a nova

**Por quê?**
- Representa a identidade da empresa (AST Assessoria)
- Clientes veem a mesma marca profissional
- Evita confusão visual

**Se você quiser logos por usuário**: Preciso alterar o sistema. Me avise!

---

## 5. 👥 OUTROS USUÁRIOS NÃO CONSEGUEM ACESSAR

### **PROBLEMA IDENTIFICADO: SENHAS**

Você resetou a senha do Admin para `123456`, mas os outros usuários **ainda têm as senhas antigas**.

### **✅ SOLUÇÕES**

#### **Opção 1: Resetar senha de cada usuário**

Vou criar um script para você resetar a senha de qualquer usuário:

```powershell
cd central-resultados/backend
node resetar-senha-usuario.js
# Digite o e-mail do usuário
# Digite a nova senha
```

#### **Opção 2: Resetar todos os usuários para `123456`**

```sql
-- No Railway → PostgreSQL → Query
UPDATE usuarios SET senha = '$2a$10$LfJq6023JKK9mevz68Vs4.E...' WHERE ativo = true;
```

#### **Opção 3: Usuários resetam a própria senha** (MELHOR)

Implemente tela de "Esqueci minha senha" (posso fazer isso).

### **Por ora: Me passe os e-mails dos usuários e eu reseto as senhas para `123456`.**

---

## 6. 📱 ACESSO PELO CELULAR NÃO FUNCIONA

### **CAUSA: CORS ou URL**

#### **Diagnóstico**

1. Acesse `https://resultados.astassessoria.com.br` pelo celular
2. Se der erro de "Não foi possível conectar":
   - ✅ Backend offline
   - ✅ Domínio não apontado corretamente

3. Se der erro de "CORS" ou "Network Error":
   - ✅ CORS precisa liberar o domínio

#### **✅ SOLUÇÃO APLICADA**

Já liberei o CORS para:
- ✅ `https://resultados.astassessoria.com.br`
- ✅ `https://www.resultados.astassessoria.com.br`

**Teste agora pelo celular e me diga o que acontece.**

Se der erro, me envie:
- Print do erro
- Abra o navegador no celular → Menu → "Desktop mode" → F12 (se tiver) → Print dos erros

---

## 7. 📄 RELATÓRIO: MOSTRAR PERÍODO FILTRADO

### **✅ VOU IMPLEMENTAR AGORA**

**Antes**:
```
Data de emissão: 04/02/2026 14:30
```

**Depois**:
```
Período: 01/02/2026 a 04/02/2026
Data de emissão: 04/02/2026 14:30
```

**Se não houver filtro de data**:
```
Período: Todos os registros
Data de emissão: 04/02/2026 14:30
```

---

## 📊 RESUMO DAS SOLUÇÕES

### **JÁ IMPLEMENTADO** ✅
1. ✅ Fonte padrão Arial 8pt (migrations)
2. ✅ CORS liberado para celular
3. ✅ Sistema roda 24/7 (pode desligar PC)

### **PRECISA IMPLEMENTAR** ⏳
1. ⏳ Período filtrado no relatório (5 min)
2. ⏳ Cloudinary para uploads persistentes (10 min)
3. ⏳ Resetar senhas dos outros usuários (agora)

### **EXPLICAÇÕES DADAS** 📚
1. ✅ Onde arquivos ficam (Railway efêmero → Cloudinary persistente)
2. ✅ Pode desligar PC (sistema na nuvem)
3. ✅ Logo é global (todos veem a mesma)

---

## 🚀 PRÓXIMOS PASSOS

### **1. TESTAR NO CELULAR AGORA**
- Acesse `https://resultados.astassessoria.com.br`
- Tente fazer login
- Me diga se funciona ou que erro dá

### **2. LISTAR E-MAILS DOS USUÁRIOS**
Me passe os e-mails dos usuários que não conseguem acessar:
- usuario1@exemplo.com
- usuario2@exemplo.com

Vou resetar as senhas para `123456`.

### **3. DECIDIR SOBRE CLOUDINARY**
Quer que eu implemente o Cloudinary agora para uploads persistentes?
- ✅ Sim → Implemento em 10 minutos
- ❌ Não → Deixa para depois (mas arquivos podem sumir!)

---

**ME AVISE:**
1. Testou no celular? Funcionou?
2. Quais e-mails de usuários preciso resetar senha?
3. Quer implementar Cloudinary agora?
