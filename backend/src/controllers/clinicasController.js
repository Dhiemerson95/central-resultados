const db = require('../database/db');
const { iniciarIntegracaoAutomatica, pararIntegracaoAutomatica, buscarExamesDaClinica } = require('../services/integracaoService');
const { processarArquivoImportacao } = require('../services/importacaoService');

const listarClinicas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clinicas WHERE ativo = true ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clínicas:', error);
    res.status(500).json({ error: 'Erro ao listar clínicas' });
  }
};

const obterClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM clinicas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter clínica:', error);
    res.status(500).json({ error: 'Erro ao obter clínica' });
  }
};

const criarClinica = async (req, res) => {
  try {
    const { nome, cnpj, tipo_integracao, config_api, config_importacao, intervalo_busca, email_contato, telefone, observacao } = req.body;

    const result = await db.query(
      `INSERT INTO clinicas (nome, cnpj, tipo_integracao, config_api, config_importacao, intervalo_busca, email_contato, telefone, observacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        nome,
        cnpj,
        tipo_integracao,
        config_api ? JSON.stringify(config_api) : null,
        config_importacao ? JSON.stringify(config_importacao) : null,
        intervalo_busca,
        email_contato,
        telefone,
        observacao
      ]
    );

    if (tipo_integracao === 'api') {
      await iniciarIntegracaoAutomatica(result.rows[0].id);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar clínica:', error);
    res.status(500).json({ error: 'Erro ao criar clínica' });
  }
};

const atualizarClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, tipo_integracao, config_api, config_importacao, intervalo_busca, ativo, email_contato, telefone, observacao } = req.body;

    const result = await db.query(
      `UPDATE clinicas SET 
        nome = $1, 
        cnpj = $2, 
        tipo_integracao = $3, 
        config_api = $4, 
        config_importacao = $5,
        intervalo_busca = $6,
        ativo = $7,
        email_contato = $8,
        telefone = $9,
        observacao = $10,
        atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [
        nome,
        cnpj,
        tipo_integracao,
        config_api ? JSON.stringify(config_api) : null,
        config_importacao ? JSON.stringify(config_importacao) : null,
        intervalo_busca,
        ativo,
        email_contato,
        telefone,
        observacao,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    if (!ativo) {
      await pararIntegracaoAutomatica(id);
    } else if (tipo_integracao === 'api') {
      await iniciarIntegracaoAutomatica(id);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar clínica:', error);
    res.status(500).json({ error: 'Erro ao atualizar clínica' });
  }
};

const deletarClinica = async (req, res) => {
  try {
    const { id } = req.params;

    await pararIntegracaoAutomatica(id);

    const result = await db.query('DELETE FROM clinicas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    res.json({ mensagem: 'Clínica deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar clínica:', error);
    res.status(500).json({ error: 'Erro ao deletar clínica' });
  }
};

const sincronizarClinica = async (req, res) => {
  try {
    const { id } = req.params;

    const clinicaResult = await db.query('SELECT * FROM clinicas WHERE id = $1', [id]);

    if (clinicaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const clinica = clinicaResult.rows[0];

    if (clinica.tipo_integracao !== 'api') {
      return res.status(400).json({ error: 'Esta clínica não está configurada para integração via API' });
    }

    const resultado = await buscarExamesDaClinica(clinica);

    if (resultado.sucesso) {
      res.json({ mensagem: 'Sincronização realizada com sucesso', total: resultado.total });
    } else {
      res.status(500).json({ error: 'Erro na sincronização', detalhes: resultado.erro });
    }
  } catch (error) {
    console.error('Erro ao sincronizar clínica:', error);
    res.status(500).json({ error: 'Erro ao sincronizar clínica' });
  }
};

const importarExames = async (req, res) => {
  try {
    const { clinica_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const clinicaResult = await db.query('SELECT * FROM clinicas WHERE id = $1', [clinica_id]);

    if (clinicaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const clinica = clinicaResult.rows[0];

    if (clinica.tipo_integracao !== 'importacao') {
      return res.status(400).json({ error: 'Esta clínica não está configurada para importação manual' });
    }

    const mapeamento = clinica.config_importacao?.mapeamento || {};

    const resultado = await processarArquivoImportacao(req.file.path, mapeamento);

    if (!resultado.sucesso) {
      return res.status(500).json({ error: 'Erro ao processar arquivo', detalhes: resultado.erro });
    }

    let totalImportado = 0;
    for (const exameData of resultado.dados) {
      let empresaId = null;

      if (exameData.empresa) {
        const empresaResult = await db.query(
          'SELECT id FROM empresas WHERE razao_social ILIKE $1 LIMIT 1',
          [`%${exameData.empresa}%`]
        );

        if (empresaResult.rows.length > 0) {
          empresaId = empresaResult.rows[0].id;
        }
      }

      await db.query(
        `INSERT INTO exames (
          empresa_id, clinica_id, funcionario_nome, funcionario_cpf,
          data_atendimento, tipo_exame, resultado, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          empresaId,
          clinica_id,
          exameData.funcionario_nome,
          exameData.funcionario_cpf,
          exameData.data_atendimento,
          exameData.tipo_exame,
          exameData.resultado,
          exameData.status || 'pendente'
        ]
      );

      totalImportado++;
    }

    await db.query(
      'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
      [clinica_id, 'importacao', 'sucesso', `${totalImportado} exames importados`, { total: totalImportado }]
    );

    res.json({ mensagem: 'Importação realizada com sucesso', total: totalImportado });
  } catch (error) {
    console.error('Erro ao importar exames:', error);

    if (req.body.clinica_id) {
      await db.query(
        'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
        [req.body.clinica_id, 'importacao', 'erro', error.message, { erro: error.toString() }]
      );
    }

    res.status(500).json({ error: 'Erro ao importar exames' });
  }
};

const listarLogs = async (req, res) => {
  try {
    const { clinica_id } = req.query;

    let query = 'SELECT l.*, c.nome as clinica_nome FROM logs_integracao l LEFT JOIN clinicas c ON l.clinica_id = c.id WHERE 1=1';
    const params = [];

    if (clinica_id) {
      query += ' AND l.clinica_id = $1';
      params.push(clinica_id);
    }

    query += ' ORDER BY l.criado_em DESC LIMIT 100';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar logs:', error);
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
};

module.exports = {
  listarClinicas,
  obterClinica,
  criarClinica,
  atualizarClinica,
  deletarClinica,
  sincronizarClinica,
  importarExames,
  listarLogs
};
