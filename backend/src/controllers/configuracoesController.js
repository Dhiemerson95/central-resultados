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
        cor_sucesso: '#27ae60',
        cor_alerta: '#f39c12',
        cor_perigo: '#e74c3c',
        exibir_data_hora: true,
        smtp_host: null,
        smtp_port: null,
        smtp_usuario: null,
        smtp_senha: null,
        smtp_secure: true
      });
    }

    const config = result.rows[0];
    
    if (config.logo && !config.logo.startsWith('/uploads/') && !config.logo.startsWith('http')) {
      config.logo = `/uploads/${config.logo}`;
    }

    res.json(config);
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
      cor_sucesso,
      cor_alerta,
      cor_perigo,
      exibir_data_hora,
      smtp_host,
      smtp_port,
      smtp_usuario,
      smtp_senha,
      smtp_secure
    } = req.body;

    let logo = req.body.logo;
    if (req.file) {
      console.log('📸 Upload de logo recebido:');
      console.log('   req.file completo:', JSON.stringify(req.file, null, 2));
      console.log('   req.file.path:', req.file.path);
      console.log('   req.file.filename:', req.file.filename);
      
      // Cloudinary retorna URL completa em 'path', storage local retorna 'filename'
      logo = req.file.path || `/uploads/${req.file.filename}`;
      console.log('   Caminho final salvo no banco:', logo);
    }

    const existente = await db.query('SELECT id FROM configuracoes_sistema LIMIT 1');

    let result;
    if (existente.rows.length === 0) {
      result = await db.query(
        `INSERT INTO configuracoes_sistema (
          logo, cor_primaria, cor_secundaria, cor_sucesso, cor_alerta, cor_perigo, exibir_data_hora,
          smtp_host, smtp_port, smtp_usuario, smtp_senha, smtp_secure
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          logo,
          cor_primaria || '#2c3e50',
          cor_secundaria || '#3498db',
          cor_sucesso || '#27ae60',
          cor_alerta || '#f39c12',
          cor_perigo || '#e74c3c',
          exibir_data_hora !== undefined ? exibir_data_hora : true,
          smtp_host,
          smtp_port,
          smtp_usuario,
          smtp_senha,
          smtp_secure !== undefined ? smtp_secure : true
        ]
      );
    } else {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (logo !== undefined) {
        updates.push(`logo = $${paramCount}`);
        values.push(logo);
        paramCount++;
      }

      if (cor_primaria) {
        updates.push(`cor_primaria = $${paramCount}`);
        values.push(cor_primaria);
        paramCount++;
      }

      if (cor_secundaria) {
        updates.push(`cor_secundaria = $${paramCount}`);
        values.push(cor_secundaria);
        paramCount++;
      }

      if (cor_sucesso) {
        updates.push(`cor_sucesso = $${paramCount}`);
        values.push(cor_sucesso);
        paramCount++;
      }

      if (cor_alerta) {
        updates.push(`cor_alerta = $${paramCount}`);
        values.push(cor_alerta);
        paramCount++;
      }

      if (cor_perigo) {
        updates.push(`cor_perigo = $${paramCount}`);
        values.push(cor_perigo);
        paramCount++;
      }

      if (exibir_data_hora !== undefined) {
        updates.push(`exibir_data_hora = $${paramCount}`);
        values.push(exibir_data_hora);
        paramCount++;
      }

      if (smtp_host !== undefined) {
        updates.push(`smtp_host = $${paramCount}`);
        values.push(smtp_host);
        paramCount++;
      }

      if (smtp_port !== undefined) {
        updates.push(`smtp_port = $${paramCount}`);
        values.push(smtp_port);
        paramCount++;
      }

      if (smtp_usuario !== undefined) {
        updates.push(`smtp_usuario = $${paramCount}`);
        values.push(smtp_usuario);
        paramCount++;
      }

      if (smtp_senha !== undefined) {
        updates.push(`smtp_senha = $${paramCount}`);
        values.push(smtp_senha);
        paramCount++;
      }

      if (smtp_secure !== undefined) {
        updates.push(`smtp_secure = $${paramCount}`);
        values.push(smtp_secure);
        paramCount++;
      }

      updates.push('atualizado_em = CURRENT_TIMESTAMP');

      values.push(existente.rows[0].id);

      result = await db.query(
        `UPDATE configuracoes_sistema SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
    }

    const config = result.rows[0];
    
    if (config.logo) {
      config.logo = `/uploads/${config.logo}`;
    }

    console.log('✅ Configurações salvas:', config);
    res.json(config);
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações: ' + error.message });
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
