const db = require('../database/db');

const listarEmpresas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM empresas WHERE ativo = true ORDER BY razao_social');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
};

const obterEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM empresas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter empresa:', error);
    res.status(500).json({ error: 'Erro ao obter empresa' });
  }
};

const criarEmpresa = async (req, res) => {
  try {
    const { razao_social, cnpj, email_padrao, codigo_soc, telefone, observacao } = req.body;

    const result = await db.query(
      `INSERT INTO empresas (razao_social, cnpj, email_padrao, codigo_soc, telefone, observacao)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [razao_social, cnpj, email_padrao, codigo_soc, telefone, observacao]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
};

const atualizarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const { razao_social, cnpj, email_padrao, codigo_soc, telefone, observacao, ativo } = req.body;

    const result = await db.query(
      `UPDATE empresas SET 
        razao_social = $1, 
        cnpj = $2, 
        email_padrao = $3, 
        codigo_soc = $4, 
        telefone = $5, 
        observacao = $6,
        ativo = $7,
        atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [razao_social, cnpj, email_padrao, codigo_soc, telefone, observacao, ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
};

const deletarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM empresas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ mensagem: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
};

module.exports = {
  listarEmpresas,
  obterEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  deletarEmpresa
};
