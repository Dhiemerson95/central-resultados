const XLSX = require('xlsx');
const db = require('../database/db');

const exportarExames = async (req, res) => {
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
      colunas
    } = req.query;

    const perfil = req.usuario?.perfil?.toLowerCase();
    const isCliente = ['cliente', 'secretaria', 'secretário'].includes(perfil);

    const colunasVisiveis = colunas ? JSON.parse(colunas) : null;

    let query = `
      SELECT 
        e.id,
        emp.razao_social as empresa,
        c.nome as clinica,
        e.funcionario_nome,
        e.funcionario_cpf,
        e.funcionario_matricula,
        e.data_atendimento,
        e.tipo_exame,
        e.resultado,
        e.status,
        e.enviado_cliente,
        e.lancado_soc,
        e.observacao,
        e.codigo_exame_soc
      FROM exames e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      LEFT JOIN clinicas c ON e.clinica_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

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

    if (enviado_cliente !== undefined && enviado_cliente !== '') {
      query += ` AND e.enviado_cliente = $${paramCount}`;
      params.push(enviado_cliente === 'true');
      paramCount++;
    }

    if (lancado_soc !== undefined && lancado_soc !== '') {
      query += ` AND e.lancado_soc = $${paramCount}`;
      params.push(lancado_soc === 'true');
      paramCount++;
    }

    query += ' ORDER BY e.data_atendimento DESC';

    const result = await db.query(query, params);

    const dados = result.rows.map(row => {
      const linha = {};

      if (!colunasVisiveis || colunasVisiveis.includes('id')) linha['ID'] = row.id;
      if (!colunasVisiveis || colunasVisiveis.includes('empresa')) linha['Empresa'] = row.empresa || 'N/A';
      if (!isCliente && (!colunasVisiveis || colunasVisiveis.includes('clinica'))) linha['Clínica'] = row.clinica || 'N/A';
      if (!colunasVisiveis || colunasVisiveis.includes('funcionario')) linha['Funcionário'] = row.funcionario_nome;
      if (!colunasVisiveis || colunasVisiveis.includes('cpf')) linha['CPF'] = row.funcionario_cpf || 'N/A';
      if (!colunasVisiveis || colunasVisiveis.includes('matricula')) linha['Matrícula'] = row.funcionario_matricula || 'N/A';
      if (!colunasVisiveis || colunasVisiveis.includes('data')) linha['Data Atendimento'] = new Date(row.data_atendimento).toLocaleDateString('pt-BR');
      if (!colunasVisiveis || colunasVisiveis.includes('tipo_exame')) linha['Tipo Exame'] = row.tipo_exame;
      if (!colunasVisiveis || colunasVisiveis.includes('resultado')) linha['Resultado'] = row.resultado || 'N/A';
      if (!colunasVisiveis || colunasVisiveis.includes('status')) linha['Status'] = row.status;
      
      if (!isCliente && (!colunasVisiveis || colunasVisiveis.includes('enviado'))) {
        linha['Enviado Cliente'] = row.enviado_cliente ? 'Sim' : 'Não';
      }
      
      if (!isCliente && (!colunasVisiveis || colunasVisiveis.includes('soc'))) {
        linha['Lançado SOC'] = row.lancado_soc ? 'Sim' : 'Não';
      }
      
      if (!isCliente && (!colunasVisiveis || colunasVisiveis.includes('observacao'))) {
        linha['Observação'] = row.observacao || '';
      }
      
      if (!isCliente && (!colunasVisiveis || colunasVisiveis.includes('codigo_soc'))) {
        linha['Código SOC'] = row.codigo_exame_soc || '';
      }

      return linha;
    });

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exames');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=exames.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar exames:', error);
    res.status(500).json({ error: 'Erro ao exportar exames' });
  }
};

const exportarEmpresas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM empresas WHERE ativo = true ORDER BY razao_social');

    const dados = result.rows.map(row => ({
      'ID': row.id,
      'Razão Social': row.razao_social,
      'CNPJ': row.cnpj || 'N/A',
      'E-mail Padrão': row.email_padrao || 'N/A',
      'Telefone': row.telefone || 'N/A',
      'Endereço': row.endereco || 'N/A',
      'Responsável': row.responsavel || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=empresas.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar empresas:', error);
    res.status(500).json({ error: 'Erro ao exportar empresas' });
  }
};

const exportarClinicas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clinicas WHERE ativo = true ORDER BY nome');

    const dados = result.rows.map(row => ({
      'ID': row.id,
      'Nome': row.nome,
      'CNPJ': row.cnpj || 'N/A',
      'Tipo Integração': row.tipo_integracao,
      'E-mail Contato': row.email_contato || 'N/A',
      'Telefone': row.telefone || 'N/A',
      'Observação': row.observacao || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clínicas');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=clinicas.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar clínicas:', error);
    res.status(500).json({ error: 'Erro ao exportar clínicas' });
  }
};

module.exports = {
  exportarExames,
  exportarEmpresas,
  exportarClinicas
};
