const db = require('../database/db');
const path = require('path');

const obterConfiguracoes = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM configuracoes_sistema ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({
        logo: null,
        cor_primaria: '#2c3e50',
        cor_secundaria: '#3498db',
        exibir_data_hora: true,
        smtp_host: null,
        smtp_port: null,
        smtp_usuario: null,
        smtp_senha: null,
        smtp_secure: true
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro ao obter configurações' });
  }
};

const atualizarConfiguracoes = async (req, res) => {
  try {
    const {
      cor_primaria,
      cor_secundaria,
      exibir_data_hora,
      smtp_host,
      smtp_port,
      smtp_usuario,
      smtp_senha,
      smtp_secure
    } = req.body;

    let logo = req.body.logo;
    if (req.file) {
      logo = req.file.filename;
    }

    const existente = await db.query('SELECT id FROM configuracoes_sistema LIMIT 1');

    let result;
    if (existente.rows.length === 0) {
      result = await db.query(
        `INSERT INTO configuracoes_sistema (
          logo, cor_primaria, cor_secundaria, exibir_data_hora,
          smtp_host, smtp_port, smtp_usuario, smtp_senha, smtp_secure
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          logo,
          cor_primaria || '#2c3e50',
          cor_secundaria || '#3498db',
          exibir_data_hora !== undefined ? exibir_data_hora : true,
          smtp_host,
          smtp_port,
          smtp_usuario,
          smtp_senha,
          smtp_secure !== undefined ? smtp_secure : true
        ]
      );
    } else {
      result = await db.query(
        `UPDATE configuracoes_sistema SET
          logo = COALESCE($1, logo),
          cor_primaria = $2,
          cor_secundaria = $3,
          exibir_data_hora = $4,
          smtp_host = $5,
          smtp_port = $6,
          smtp_usuario = $7,
          smtp_senha = COALESCE($8, smtp_senha),
          smtp_secure = $9,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *`,
        [
          logo,
          cor_primaria || '#2c3e50',
          cor_secundaria || '#3498db',
          exibir_data_hora !== undefined ? exibir_data_hora : true,
          smtp_host,
          smtp_port,
          smtp_usuario,
          smtp_senha,
          smtp_secure !== undefined ? smtp_secure : true,
          existente.rows[0].id
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

const testarConexaoSMTP = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_usuario, smtp_senha, smtp_secure } = req.body;

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_secure,
      auth: {
        user: smtp_usuario,
        pass: smtp_senha
      }
    });

    await transporter.verify();

    res.json({ sucesso: true, mensagem: 'Conexão SMTP testada com sucesso!' });
  } catch (error) {
    console.error('Erro ao testar SMTP:', error);
    res.status(500).json({ 
      sucesso: false,
      error: 'Falha ao conectar com o servidor SMTP',
      detalhes: error.message
    });
  }
};

module.exports = {
  obterConfiguracoes,
  atualizarConfiguracoes,
  testarConexaoSMTP
};
