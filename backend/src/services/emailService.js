const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');

const obterConfiguracoesEmail = async () => {
  try {
    const result = await db.query(
      'SELECT smtp_host, smtp_port, smtp_usuario, smtp_senha, smtp_secure FROM configuracoes_sistema ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0 || !result.rows[0].smtp_host) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter configurações de e-mail:', error);
    return null;
  }
};

const verificarConfiguracao = () => {
  const camposObrigatorios = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM
  };

  const camposFaltando = Object.entries(camposObrigatorios)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (camposFaltando.length > 0) {
    console.error('⚠️  Configurações SMTP faltando:', camposFaltando.join(', '));
    return false;
  }

  return true;
};

const criarTransporter = async () => {
  const configDB = await obterConfiguracoesEmail();
  
  if (configDB) {
    return nodemailer.createTransport({
      host: configDB.smtp_host,
      port: parseInt(configDB.smtp_port),
      secure: configDB.smtp_secure,
      auth: {
        user: configDB.smtp_usuario,
        pass: configDB.smtp_senha,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  if (!verificarConfiguracao()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const validarAnexos = (anexos) => {
  const anexosValidos = [];
  
  for (const anexo of anexos) {
    if (fs.existsSync(anexo)) {
      anexosValidos.push({
        filename: path.basename(anexo),
        path: anexo
      });
    } else {
      console.warn(`⚠️  Anexo não encontrado: ${anexo}`);
    }
  }

  return anexosValidos;
};

const enviarEmail = async ({ destinatario, assunto, corpo, anexos = [] }) => {
  try {
    if (!destinatario || !assunto) {
      const erro = 'Destinatário e assunto são obrigatórios';
      console.error('❌ Erro de validação:', erro);
      return { 
        sucesso: false, 
        erro,
        tipo: 'validacao'
      };
    }

    const transporter = await criarTransporter();
    
    if (!transporter) {
      const erro = 'Configurações SMTP não encontradas. Configure nas Configurações do Sistema.';
      console.error('❌', erro);
      return { 
        sucesso: false, 
        erro,
        tipo: 'configuracao'
      };
    }

    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso');

    const anexosValidos = validarAnexos(anexos);

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema'}" <${process.env.EMAIL_FROM || 'noreply@sistema.com'}>`,
      to: destinatario,
      subject: assunto,
      html: corpo,
      attachments: anexosValidos
    };

    console.log(`📧 Enviando e-mail para: ${destinatario}`);
    console.log(`📎 Anexos: ${anexosValidos.length}`);

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-mail enviado com sucesso!');
    console.log(`📬 Message ID: ${info.messageId}`);

    return { 
      sucesso: true, 
      messageId: info.messageId,
      destinatario,
      anexosEnviados: anexosValidos.length
    };

  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error.message);
    console.error('Stack trace:', error.stack);

    let erroAmigavel = 'Erro ao enviar e-mail. ';
    let tipo = 'smtp';

    if (error.code === 'EAUTH') {
      erroAmigavel += 'Falha na autenticação. Verifique usuário e senha SMTP.';
      tipo = 'autenticacao';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      erroAmigavel += 'Não foi possível conectar ao servidor SMTP. Verifique host e porta.';
      tipo = 'conexao';
    } else if (error.code === 'EENVELOPE') {
      erroAmigavel += 'E-mail de destino inválido.';
      tipo = 'destinatario';
    } else {
      erroAmigavel += error.message;
    }

    return { 
      sucesso: false, 
      erro: erroAmigavel,
      erroTecnico: error.message,
      codigo: error.code,
      tipo
    };
  }
};

const testarConexao = async () => {
  try {
    const transporter = await criarTransporter();
    
    if (!transporter) {
      return { sucesso: false, erro: 'Configurações SMTP não encontradas' };
    }

    await transporter.verify();
    return { sucesso: true, mensagem: 'Conexão SMTP OK' };
  } catch (error) {
    return { 
      sucesso: false, 
      erro: error.message,
      codigo: error.code 
    };
  }
};

module.exports = { enviarEmail, testarConexao };
