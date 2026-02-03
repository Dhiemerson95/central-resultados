const axios = require('axios');
const cron = require('node-cron');
const db = require('../database/db');

const tarefasAgendadas = new Map();

const iniciarIntegracaoAutomatica = async (clinicaId) => {
  const result = await db.query(
    'SELECT * FROM clinicas WHERE id = $1 AND tipo_integracao = $2 AND ativo = true',
    [clinicaId, 'api']
  );

  if (result.rows.length === 0) {
    return { sucesso: false, erro: 'Clínica não encontrada ou não configurada para API' };
  }

  const clinica = result.rows[0];
  const intervalo = clinica.intervalo_busca || 60;

  if (tarefasAgendadas.has(clinicaId)) {
    tarefasAgendadas.get(clinicaId).stop();
  }

  const tarefa = cron.schedule(`*/${intervalo} * * * *`, async () => {
    await buscarExamesDaClinica(clinica);
  });

  tarefasAgendadas.set(clinicaId, tarefa);

  return { sucesso: true, mensagem: 'Integração automática iniciada' };
};

const pararIntegracaoAutomatica = (clinicaId) => {
  if (tarefasAgendadas.has(clinicaId)) {
    tarefasAgendadas.get(clinicaId).stop();
    tarefasAgendadas.delete(clinicaId);
    return { sucesso: true };
  }
  return { sucesso: false, erro: 'Tarefa não encontrada' };
};

const buscarExamesDaClinica = async (clinica) => {
  try {
    const config = clinica.config_api;
    
    const response = await axios({
      method: config.metodo || 'GET',
      url: config.url,
      headers: config.headers || {},
      params: config.params || {},
      auth: config.auth ? {
        username: config.auth.username,
        password: config.auth.password
      } : undefined
    });

    const exames = extrairExamesDaResposta(response.data, config.mapeamento);

    for (const exame of exames) {
      await salvarExame(exame, clinica.id);
    }

    await db.query(
      'UPDATE clinicas SET ultima_sincronizacao = CURRENT_TIMESTAMP WHERE id = $1',
      [clinica.id]
    );

    await db.query(
      'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
      [clinica.id, 'api', 'sucesso', `${exames.length} exames processados`, { total: exames.length }]
    );

    return { sucesso: true, total: exames.length };
  } catch (error) {
    console.error('Erro ao buscar exames da clínica:', error);
    
    await db.query(
      'INSERT INTO logs_integracao (clinica_id, tipo, status, mensagem, dados) VALUES ($1, $2, $3, $4, $5)',
      [clinica.id, 'api', 'erro', error.message, { erro: error.toString() }]
    );

    return { sucesso: false, erro: error.message };
  }
};

const extrairExamesDaResposta = (data, mapeamento) => {
  const exames = Array.isArray(data) ? data : data[mapeamento.arrayPath] || [];
  
  return exames.map(item => ({
    funcionario_nome: item[mapeamento.funcionario_nome],
    funcionario_cpf: item[mapeamento.funcionario_cpf],
    data_atendimento: item[mapeamento.data_atendimento],
    tipo_exame: item[mapeamento.tipo_exame],
    resultado: item[mapeamento.resultado],
    empresa_nome: item[mapeamento.empresa],
    dados_adicionais: item
  }));
};

const salvarExame = async (exameData, clinicaId) => {
  let empresaId = null;

  if (exameData.empresa_nome) {
    const empresaResult = await db.query(
      'SELECT id FROM empresas WHERE razao_social ILIKE $1 LIMIT 1',
      [`%${exameData.empresa_nome}%`]
    );

    if (empresaResult.rows.length > 0) {
      empresaId = empresaResult.rows[0].id;
    }
  }

  const verificaExistente = await db.query(
    'SELECT id FROM exames WHERE funcionario_cpf = $1 AND data_atendimento = $2 AND tipo_exame = $3',
    [exameData.funcionario_cpf, exameData.data_atendimento, exameData.tipo_exame]
  );

  if (verificaExistente.rows.length > 0) {
    return;
  }

  await db.query(
    `INSERT INTO exames (
      empresa_id, clinica_id, funcionario_nome, funcionario_cpf, 
      data_atendimento, tipo_exame, resultado, dados_adicionais
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      empresaId,
      clinicaId,
      exameData.funcionario_nome,
      exameData.funcionario_cpf,
      exameData.data_atendimento,
      exameData.tipo_exame,
      exameData.resultado,
      JSON.stringify(exameData.dados_adicionais)
    ]
  );
};

module.exports = {
  iniciarIntegracaoAutomatica,
  pararIntegracaoAutomatica,
  buscarExamesDaClinica
};
