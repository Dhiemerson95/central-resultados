const db = require('../database/db');
const { enviarEmailExame } = require('../services/emailService');

const listarHistorico = async (req, res) => {
  try {
    const { dataInicio, dataFim, destinatario, status } = req.query;
    
    // Verificar permissão
    if (req.user.perfil === 'client') {
      return res.status(403).json({ error: 'Sem permissão para visualizar histórico' });
    }

    let query = `
      SELECT e.*, 
             ex.funcionario_nome
      FROM emails_enviados e
      LEFT JOIN exames ex ON e.exame_id = ex.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      query += ` AND e.data_envio >= $${paramCount}`;
      params.push(dataInicio + ' 00:00:00');
      paramCount++;
    }

    if (dataFim) {
      query += ` AND e.data_envio <= $${paramCount}`;
      params.push(dataFim + ' 23:59:59');
      paramCount++;
    }

    if (destinatario) {
      query += ` AND e.destinatario ILIKE $${paramCount}`;
      params.push(`%${destinatario}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY e.data_envio DESC LIMIT 500`;

    const result = await db.query(query, params);
    
    console.log(`📧 Histórico de e-mails consultado: ${result.rows.length} registros`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({ error: 'Erro ao listar histórico de e-mails' });
  }
};

const reenviarEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permissão
    if (req.user.perfil === 'client') {
      return res.status(403).json({ error: 'Sem permissão para reenviar e-mails' });
    }

    // Buscar dados do e-mail original
    const emailResult = await db.query(
      'SELECT * FROM emails_enviados WHERE id = $1',
      [id]
    );

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ error: 'E-mail não encontrado' });
    }

    const emailOriginal = emailResult.rows[0];

    // Se tem exame vinculado, reenviar usando o serviço
    if (emailOriginal.exame_id) {
      const exameResult = await db.query(
        'SELECT * FROM exames WHERE id = $1',
        [emailOriginal.exame_id]
      );

      if (exameResult.rows.length > 0) {
        await enviarEmailExame(exameResult.rows[0], emailOriginal.destinatario);
        console.log(`✅ E-mail reenviado: ${emailOriginal.destinatario}`);
        return res.json({ sucesso: true, mensagem: 'E-mail reenviado com sucesso' });
      }
    }

    // Atualizar status para "pendente" para reenvio manual
    await db.query(
      `UPDATE emails_enviados 
       SET status = 'pendente', erro_mensagem = NULL 
       WHERE id = $1`,
      [id]
    );

    console.log(`📧 E-mail marcado para reenvio: ${emailOriginal.destinatario}`);
    res.json({ 
      sucesso: true, 
      mensagem: 'E-mail marcado para reenvio. Será processado em breve.' 
    });
  } catch (error) {
    console.error('Erro ao reenviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao reenviar e-mail' });
  }
};

module.exports = { listarHistorico, reenviarEmail };
