const db = require('../database/db');
const { enviarEmail } = require('../services/emailService');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Função auxiliar para deletar do Cloudinary
const deletarDoCloudinary = async (caminhoArquivo) => {
  try {
    if (!caminhoArquivo || !caminhoArquivo.includes('cloudinary')) {
      return;
    }

    // Extrair public_id da URL (SEM extensão)
    const match = caminhoArquivo.match(/\/v\d+\/(.+)\.\w+$/);
    if (match && match[1]) {
      const publicId = match[1];
      console.log('🗑️ Deletando do Cloudinary - Public ID:', publicId);
      const resultado = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      console.log('✅ Resultado Cloudinary:', JSON.stringify(resultado, null, 2));
    }
  } catch (error) {
    console.error('⚠️ Erro ao deletar do Cloudinary:', error.message);
  }
};

const listarExames = async (req, res) => {
  try {
    const {
      empresa_id,
      clinica_id,
      data_inicio,
      data_fim,
      tipo_exame,
      status,
      enviado_cliente,
      lancado_soc,
      busca
    } = req.query;

    // Pegar perfil e ID do usuário logado
    const usuarioLogado = req.user;

    let query = `
      SELECT 
        e.*,
        emp.razao_social as empresa_nome,
        c.nome as clinica_nome
      FROM exames e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      LEFT JOIN clinicas c ON e.clinica_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // FILTRO DE ISOLAMENTO: Cliente só vê seus próprios exames
    if (usuarioLogado.perfil === 'client') {
      query += ` AND e.cliente_id = $${paramCount}`;
      params.push(usuarioLogado.id);
      paramCount++;
    }

    // Se nenhum filtro de data/busca: usar data atual (horário de Brasília)
    if (!data_inicio && !data_fim && !busca) {
      const hoje = new Date();
      // Ajustar para fuso horário de Brasília (UTC-3)
      hoje.setHours(hoje.getHours() - 3);
      const dataLocal = hoje.toISOString().split('T')[0];
      query += ` AND DATE(e.data_atendimento) = $${paramCount}`;
      params.push(dataLocal);
      paramCount++;
    }

    if (empresa_id) {
      query += ` AND e.empresa_id = $${paramCount}`;
      params.push(empresa_id);
      paramCount++;
    }

    if (clinica_id) {
      query += ` AND e.clinica_id = $${paramCount}`;
      params.push(clinica_id);
      paramCount++;
    }

    if (data_inicio) {
      query += ` AND e.data_atendimento >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }

    if (data_fim) {
      query += ` AND e.data_atendimento <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }

    if (tipo_exame) {
      query += ` AND e.tipo_exame = $${paramCount}`;
      params.push(tipo_exame);
      paramCount++;
    }

    if (status) {
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (enviado_cliente !== undefined) {
      query += ` AND e.enviado_cliente = $${paramCount}`;
      params.push(enviado_cliente === 'true');
      paramCount++;
    }

    if (lancado_soc !== undefined) {
      query += ` AND e.lancado_soc = $${paramCount}`;
      params.push(lancado_soc === 'true');
      paramCount++;
    }

    if (busca) {
      query += ` AND (e.funcionario_nome ILIKE $${paramCount} OR e.funcionario_cpf ILIKE $${paramCount})`;
      params.push(`%${busca}%`);
      paramCount++;
    }

    query += ' ORDER BY e.data_atendimento DESC, e.id DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar exames:', error);
    res.status(500).json({ error: 'Erro ao listar exames' });
  }
};

const obterExame = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        e.*,
        emp.razao_social as empresa_nome,
        emp.email_padrao as empresa_email,
        c.nome as clinica_nome
      FROM exames e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      LEFT JOIN clinicas c ON e.clinica_id = c.id
      WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter exame:', error);
    res.status(500).json({ error: 'Erro ao obter exame' });
  }
};

const criarExame = async (req, res) => {
  try {
    const {
      empresa_id,
      clinica_id,
      funcionario_nome,
      funcionario_cpf,
      funcionario_matricula,
      data_atendimento,
      tipo_exame,
      resultado,
      status,
      observacao,
      codigo_exame_soc
    } = req.body;

    const arquivo_laudo = req.file ? (req.file.path || req.file.filename) : null;

    const result = await db.query(
      `INSERT INTO exames (
        empresa_id, clinica_id, funcionario_nome, funcionario_cpf, 
        funcionario_matricula, data_atendimento, tipo_exame, resultado, 
        status, observacao, codigo_exame_soc, arquivo_laudo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        empresa_id || null,
        clinica_id || null,
        funcionario_nome,
        funcionario_cpf || null,
        funcionario_matricula || null,
        data_atendimento,
        tipo_exame,
        resultado || null,
        status || 'pendente',
        observacao || null,
        codigo_exame_soc || null,
        arquivo_laudo
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar exame:', error);
    res.status(500).json({ error: 'Erro ao criar exame' });
  }
};

const atualizarExame = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      empresa_id,
      clinica_id,
      funcionario_nome,
      funcionario_cpf,
      funcionario_matricula,
      data_atendimento,
      tipo_exame,
      resultado,
      status,
      enviado_cliente,
      lancado_soc,
      observacao,
      codigo_exame_soc
    } = req.body;

    let arquivo_laudo = req.body.arquivo_laudo;
    if (req.file) {
      arquivo_laudo = req.file.path || req.file.filename;
    }

    const result = await db.query(
      `UPDATE exames SET
        empresa_id = $1,
        clinica_id = $2,
        funcionario_nome = $3,
        funcionario_cpf = $4,
        funcionario_matricula = $5,
        data_atendimento = $6,
        tipo_exame = $7,
        resultado = $8,
        status = $9,
        enviado_cliente = $10,
        lancado_soc = $11,
        observacao = $12,
        codigo_exame_soc = $13,
        arquivo_laudo = COALESCE($14, arquivo_laudo),
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        empresa_id,
        clinica_id,
        funcionario_nome,
        funcionario_cpf,
        funcionario_matricula,
        data_atendimento,
        tipo_exame,
        resultado,
        status,
        enviado_cliente,
        lancado_soc,
        observacao,
        codigo_exame_soc,
        arquivo_laudo,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar exame:', error);
    res.status(500).json({ error: 'Erro ao atualizar exame' });
  }
};

const deletarExame = async (req, res) => {
  try {
    const { id } = req.params;

    const exameResult = await db.query('SELECT * FROM exames WHERE id = $1', [id]);
    
    if (exameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    // Buscar todos os anexos do exame para deletar do Cloudinary
    const anexosResult = await db.query('SELECT * FROM exames_anexos WHERE exame_id = $1', [id]);
    
    // Deletar cada anexo do Cloudinary
    for (const anexo of anexosResult.rows) {
      await deletarDoCloudinary(anexo.caminho_arquivo);
    }

    // Deletar anexos do banco
    await db.query('DELETE FROM exames_anexos WHERE exame_id = $1', [id]);
    
    // Deletar histórico de e-mails
    await db.query('DELETE FROM historico_emails WHERE exame_id = $1', [id]);
    
    // Deletar exame
    const result = await db.query('DELETE FROM exames WHERE id = $1 RETURNING *', [id]);

    console.log(`🗑️ Exame ${id} deletado com ${anexosResult.rows.length} anexo(s)`);
    
    res.json({ mensagem: 'Exame deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar exame:', error);
    console.error('Código do erro:', error.code);
    console.error('Detalhes:', error.detail);
    res.status(500).json({ 
      error: 'Erro ao deletar exame',
      detalhes: error.message,
      codigo: error.code
    });
  }
};

const enviarExamePorEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { destinatario, assunto, corpo } = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: 'ID do exame é obrigatório',
        tipo: 'validacao'
      });
    }

    if (!destinatario) {
      return res.status(400).json({ 
        error: 'E-mail de destino é obrigatório',
        tipo: 'validacao'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(destinatario)) {
      return res.status(400).json({ 
        error: 'E-mail de destino inválido',
        tipo: 'validacao'
      });
    }

    console.log(`📧 Iniciando envio de e-mail para exame ID: ${id}`);

    const exameResult = await db.query('SELECT * FROM exames WHERE id = $1', [id]);

    if (exameResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Exame não encontrado',
        tipo: 'notfound'
      });
    }

    const exame = exameResult.rows[0];

    const assuntoFinal = assunto || `Resultado de Exame Ocupacional - ${exame.funcionario_nome}`;
    
    const corpoFinal = corpo || `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
          .footer { text-align: center; padding: 20px; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Resultado de Exame Ocupacional</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Funcionário:</span> ${exame.funcionario_nome}
            </div>
            <div class="info-row">
              <span class="label">CPF:</span> ${exame.funcionario_cpf || 'N/A'}
            </div>
            <div class="info-row">
              <span class="label">Data do Atendimento:</span> ${new Date(exame.data_atendimento).toLocaleDateString('pt-BR')}
            </div>
            <div class="info-row">
              <span class="label">Tipo de Exame:</span> ${exame.tipo_exame}
            </div>
            <div class="info-row">
              <span class="label">Resultado:</span> ${exame.resultado || 'N/A'}
            </div>
            ${exame.observacao ? `
            <div class="info-row">
              <span class="label">Observação:</span> ${exame.observacao}
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>AST Assessoria - Central de Resultados</p>
            <p>Este é um e-mail automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const anexos = [];
    if (exame.arquivo_laudo) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const caminhoCompleto = path.join(uploadDir, exame.arquivo_laudo);
      anexos.push(caminhoCompleto);
      console.log(`📎 Anexo adicionado: ${exame.arquivo_laudo}`);
    } else {
      console.log('📎 Nenhum anexo disponível');
    }

    console.log(`📧 Enviando para: ${destinatario}`);
    console.log(`📋 Assunto: ${assuntoFinal}`);

    const resultado = await enviarEmail({
      destinatario,
      assunto: assuntoFinal,
      corpo: corpoFinal,
      anexos
    });

    await db.query(
      'INSERT INTO historico_emails (exame_id, destinatario, assunto, corpo, enviado, erro) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, destinatario, assuntoFinal, corpoFinal, resultado.sucesso, resultado.erro || null]
    );
    console.log('💾 Histórico de e-mail salvo no banco');

    if (resultado.sucesso) {
      await db.query(
        'UPDATE exames SET enviado_cliente = true, data_envio_cliente = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      console.log('✅ Exame marcado como "Enviado para cliente"');

      res.json({ 
        sucesso: true,
        mensagem: 'E-mail enviado com sucesso',
        destinatario: resultado.destinatario,
        anexos: resultado.anexosEnviados,
        messageId: resultado.messageId
      });
    } else {
      console.error('❌ Falha no envio:', resultado.erro);
      
      res.status(500).json({ 
        sucesso: false,
        error: resultado.erro,
        tipo: resultado.tipo || 'smtp',
        erroTecnico: resultado.erroTecnico
      });
    }
  } catch (error) {
    console.error('❌ Erro crítico ao enviar exame por e-mail:', error);
    
    res.status(500).json({ 
      sucesso: false,
      error: 'Erro interno ao processar envio de e-mail',
      tipo: 'servidor',
      detalhes: error.message
    });
  }
};

const marcarComoLancadoSOC = async (req, res) => {
  try {
    const { id } = req.params;
    const { lancado } = req.body;

    const result = await db.query(
      'UPDATE exames SET lancado_soc = $1, data_lancamento_soc = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [lancado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar exame como lançado no SOC:', error);
    res.status(500).json({ error: 'Erro ao marcar exame como lançado no SOC' });
  }
};

const marcarComoEnviado = async (req, res) => {
  try {
    const { id } = req.params;
    const { enviado } = req.body;

    const result = await db.query(
      'UPDATE exames SET enviado_cliente = $1, data_envio = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [enviado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar exame como enviado:', error);
    res.status(500).json({ error: 'Erro ao marcar exame como enviado' });
  }
};

module.exports = {
  listarExames,
  obterExame,
  criarExame,
  atualizarExame,
  deletarExame,
  enviarExamePorEmail,
  marcarComoLancadoSOC,
  marcarComoEnviado
};
