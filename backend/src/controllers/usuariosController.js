const db = require('../database/db');
const bcrypt = require('bcryptjs');

const listarUsuarios = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em FROM usuarios ORDER BY nome'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

const obterUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
};

const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil, ativo } = req.body;

    if (req.usuario.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar usuários.' });
    }

    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (nome) {
      updates.push(`nome = $${valueIndex++}`);
      values.push(nome);
    }

    if (email) {
      updates.push(`email = $${valueIndex++}`);
      values.push(email);
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push(`senha = $${valueIndex++}`);
      values.push(senhaHash);
    }

    if (perfil) {
      updates.push(`perfil = $${valueIndex++}`);
      values.push(perfil);
    }

    if (typeof ativo === 'boolean') {
      updates.push(`ativo = $${valueIndex++}`);
      values.push(ativo);
    }

    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING id, nome, email, perfil, ativo`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem deletar usuários.' });
    }

    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    const result = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  deletarUsuario
};
