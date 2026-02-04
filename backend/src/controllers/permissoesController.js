const db = require('../database/db');

const listarPermissoes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM permissoes ORDER BY modulo, acao');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro ao listar permissões' });
  }
};

const listarPerfis = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
        json_agg(json_build_object('id', perm.id, 'nome', perm.nome, 'modulo', perm.modulo, 'acao', perm.acao)) as permissoes
      FROM perfis p
      LEFT JOIN perfis_permissoes pp ON p.id = pp.perfil_id
      LEFT JOIN permissoes perm ON pp.permissao_id = perm.id
      GROUP BY p.id
      ORDER BY p.nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({ error: 'Erro ao listar perfis' });
  }
};

const criarPerfil = async (req, res) => {
  try {
    const { nome, descricao, permissoes } = req.body;

    const perfilResult = await db.query(
      'INSERT INTO perfis (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );

    const perfilId = perfilResult.rows[0].id;

    if (permissoes && permissoes.length > 0) {
      for (const permissaoId of permissoes) {
        await db.query(
          'INSERT INTO perfis_permissoes (perfil_id, permissao_id) VALUES ($1, $2)',
          [perfilId, permissaoId]
        );
      }
    }

    res.status(201).json(perfilResult.rows[0]);
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: 'Erro ao criar perfil' });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, permissoes } = req.body;

    const result = await db.query(
      'UPDATE perfis SET nome = $1, descricao = $2, atualizado_em = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [nome, descricao, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    await db.query('DELETE FROM perfis_permissoes WHERE perfil_id = $1', [id]);

    if (permissoes && permissoes.length > 0) {
      for (const permissaoId of permissoes) {
        await db.query(
          'INSERT INTO perfis_permissoes (perfil_id, permissao_id) VALUES ($1, $2)',
          [id, permissaoId]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const obterPermissoesUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await db.query(`
      SELECT DISTINCT p.*
      FROM permissoes p
      LEFT JOIN perfis_permissoes pp ON p.id = pp.permissao_id
      LEFT JOIN usuarios u ON u.perfil_id = pp.perfil_id
      LEFT JOIN usuarios_permissoes up ON p.id = up.permissao_id AND up.usuario_id = u.id
      WHERE u.id = $1
        AND (up.concedida IS NULL OR up.concedida = true)
      ORDER BY p.modulo, p.acao
    `, [usuario_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter permissões do usuário:', error);
    res.status(500).json({ error: 'Erro ao obter permissões do usuário' });
  }
};

const atualizarPermissoesUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { permissoes_concedidas, permissoes_revogadas } = req.body;

    await db.query('DELETE FROM usuarios_permissoes WHERE usuario_id = $1', [usuario_id]);

    if (permissoes_concedidas && permissoes_concedidas.length > 0) {
      for (const permissaoId of permissoes_concedidas) {
        await db.query(
          'INSERT INTO usuarios_permissoes (usuario_id, permissao_id, concedida) VALUES ($1, $2, true)',
          [usuario_id, permissaoId]
        );
      }
    }

    if (permissoes_revogadas && permissoes_revogadas.length > 0) {
      for (const permissaoId of permissoes_revogadas) {
        await db.query(
          'INSERT INTO usuarios_permissoes (usuario_id, permissao_id, concedida) VALUES ($1, $2, false)',
          [usuario_id, permissaoId]
        );
      }
    }

    res.json({ mensagem: 'Permissões atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar permissões do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar permissões do usuário' });
  }
};

module.exports = {
  listarPermissoes,
  listarPerfis,
  criarPerfil,
  atualizarPerfil,
  obterPermissoesUsuario,
  atualizarPermissoesUsuario
};
