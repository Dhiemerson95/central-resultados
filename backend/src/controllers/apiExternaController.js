const db = require('../database/db');

const receberLaudo = async (req, res) => {
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
      observacao,
      codigo_exame_soc,
      api_key
    } = req.body;

    if (!api_key) {
      return res.status(401).json({ error: 'API Key não fornecida' });
    }

    const clinicaResult = await db.query(
      'SELECT * FROM clinicas WHERE id = $1',
      [clinica_id]
    );

    if (clinicaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const arquivo_laudo = req.file ? (req.file.path || req.file.filename) : null;

    const result = await db.query(
      `INSERT INTO exames (
        empresa_id, clinica_id, funcionario_nome, funcionario_cpf, 
        funcionario_matricula, data_atendimento, tipo_exame, resultado, 
        status, observacao, codigo_exame_soc, arquivo_laudo,
        status_revisao, liberado_cliente
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pendente', false) 
      RETURNING *`,
      [
        empresa_id || null,
        clinica_id,
        funcionario_nome,
        funcionario_cpf || null,
        funcionario_matricula || null,
        data_atendimento,
        tipo_exame,
        resultado || null,
        'pendente',
        observacao || null,
        codigo_exame_soc || null,
        arquivo_laudo
      ]
    );

    await db.query(
      'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
      [clinica_id, 'api_externa', 'sucesso', 'Laudo recebido via API', { exame_id: result.rows[0].id }]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Laudo recebido com sucesso',
      exame_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao receber laudo:', error);

    if (req.body.clinica_id) {
      await db.query(
        'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
        [req.body.clinica_id, 'api_externa', 'erro', error.message, { erro: error.toString() }]
      );
    }

    res.status(500).json({ error: 'Erro ao receber laudo' });
  }
};

module.exports = {
  receberLaudo
};
