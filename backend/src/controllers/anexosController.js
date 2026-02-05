const db = require('../database/db');

const listarAnexosExame = async (req, res) => {
  try {
    const { exame_id } = req.params;

    const result = await db.query(
      `SELECT a.*, u.nome as enviado_por_nome
       FROM exames_anexos a
       LEFT JOIN usuarios u ON a.enviado_por = u.id
       WHERE a.exame_id = $1
       ORDER BY a.oficial DESC, a.criado_em DESC`,
      [exame_id]
    );

    console.log(`📋 Listando anexos do exame ${exame_id}:`, result.rows.length, 'arquivo(s)');
    result.rows.forEach(anexo => {
      console.log(`   - ID: ${anexo.id}, Arquivo: ${anexo.caminho_arquivo}, Oficial: ${anexo.oficial}`);
    });

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar anexos:', error);
    res.status(500).json({ error: 'Erro ao listar anexos' });
  }
};

const adicionarAnexoExame = async (req, res) => {
  try {
    const { exame_id } = req.params;
    const usuario_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('📎 Upload de anexo:');
    console.log('   Exame ID:', exame_id);
    console.log('   Nome original:', req.file.originalname);
    console.log('   Nome salvo:', req.file.filename);
    console.log('   Caminho completo:', req.file.path);

    const result = await db.query(
      `INSERT INTO exames_anexos (exame_id, nome_arquivo, caminho_arquivo, enviado_por)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [exame_id, req.file.originalname, req.file.filename, usuario_id]
    );

    console.log('✅ Anexo salvo com ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao adicionar anexo:', error);
    res.status(500).json({ error: 'Erro ao adicionar anexo: ' + error.message });
  }
};

const marcarAnexoOficial = async (req, res) => {
  try {
    const { anexo_id } = req.params;

    const anexoResult = await db.query('SELECT exame_id FROM exames_anexos WHERE id = $1', [anexo_id]);
    
    if (anexoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    const exame_id = anexoResult.rows[0].exame_id;

    await db.query('UPDATE exames_anexos SET oficial = false WHERE exame_id = $1', [exame_id]);

    const result = await db.query(
      'UPDATE exames_anexos SET oficial = true WHERE id = $1 RETURNING *',
      [anexo_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar anexo como oficial:', error);
    res.status(500).json({ error: 'Erro ao marcar anexo como oficial' });
  }
};

const desmarcarAnexoOficial = async (req, res) => {
  try {
    const { anexo_id } = req.params;

    const result = await db.query(
      'UPDATE exames_anexos SET oficial = false WHERE id = $1 RETURNING *',
      [anexo_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao desmarcar anexo como oficial:', error);
    res.status(500).json({ error: 'Erro ao desmarcar anexo como oficial' });
  }
};

const deletarAnexoExame = async (req, res) => {
  try {
    const { anexo_id } = req.params;

    const result = await db.query('DELETE FROM exames_anexos WHERE id = $1 RETURNING *', [anexo_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    res.json({ mensagem: 'Anexo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar anexo:', error);
    res.status(500).json({ error: 'Erro ao deletar anexo' });
  }
};

const liberarExameParaCliente = async (req, res) => {
  try {
    const { exame_id } = req.params;
    const usuario_id = req.user.id;

    const result = await db.query(
      `UPDATE exames SET 
        status_revisao = 'aprovado',
        liberado_cliente = true,
        liberado_por = $1,
        data_liberacao = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`,
      [usuario_id, exame_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    res.json({ mensagem: 'Exame liberado para o cliente com sucesso', exame: result.rows[0] });
  } catch (error) {
    console.error('Erro ao liberar exame:', error);
    res.status(500).json({ error: 'Erro ao liberar exame' });
  }
};

const listarExamesPendentesRevisao = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        e.*,
        emp.razao_social as empresa_nome,
        c.nome as clinica_nome
      FROM exames e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      LEFT JOIN clinicas c ON e.clinica_id = c.id
      WHERE e.status_revisao = 'pendente' AND e.liberado_cliente = false
      ORDER BY e.data_atendimento DESC, e.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar exames pendentes:', error);
    res.status(500).json({ error: 'Erro ao listar exames pendentes' });
  }
};

module.exports = {
  listarAnexosExame,
  adicionarAnexoExame,
  marcarAnexoOficial,
  desmarcarAnexoOficial,
  deletarAnexoExame,
  liberarExameParaCliente,
  listarExamesPendentesRevisao
};
