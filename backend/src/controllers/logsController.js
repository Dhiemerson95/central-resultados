const db = require('../database/db');

const listarLogs = async (req, res) => {
  try {
    const { dataInicio, dataFim, usuario, acao } = req.query;
    
    // Verificar permissão
    if (req.user.perfil === 'client') {
      return res.status(403).json({ error: 'Sem permissão para visualizar logs' });
    }

    let query = `
      SELECT l.*, u.nome as usuario_nome, u.email as usuario_email
      FROM logs_atividades l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      query += ` AND l.data_hora >= $${paramCount}`;
      params.push(dataInicio + ' 00:00:00');
      paramCount++;
    }

    if (dataFim) {
      query += ` AND l.data_hora <= $${paramCount}`;
      params.push(dataFim + ' 23:59:59');
      paramCount++;
    }

    if (usuario) {
      query += ` AND (u.nome ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${usuario}%`);
      paramCount++;
    }

    if (acao) {
      query += ` AND l.acao = $${paramCount}`;
      params.push(acao);
      paramCount++;
    }

    query += ` ORDER BY l.data_hora DESC LIMIT 500`;

    const result = await db.query(query, params);
    
    console.log(`📊 Logs consultados: ${result.rows.length} registros`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar logs:', error);
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
};

module.exports = { listarLogs };
