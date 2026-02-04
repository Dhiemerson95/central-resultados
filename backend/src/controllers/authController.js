const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log('🔐 Tentativa de login:');
    console.log('   E-mail:', email);
    console.log('   Senha fornecida:', senha ? '***' : '(vazia)');
    console.log('   User-Agent:', req.headers['user-agent']);
    console.log('   Origin:', req.headers.origin);

    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado ou inativo');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    console.log('✅ Usuário encontrado:', usuario.nome);
    console.log('   Hash no banco:', usuario.senha.substring(0, 20) + '...');

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('   Senha válida:', senhaValida);

    if (!senhaValida) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'chave-temporaria-segura';
    console.log('   JWT_SECRET configurado:', jwtSecret ? 'SIM' : 'NÃO');

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      jwtSecret,
      { expiresIn: '8h' }
    );

    console.log('✅ Login bem-sucedido');
    console.log('   Token gerado:', token.substring(0, 30) + '...');

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil',
      [nome, email, senhaHash, perfil || 'usuario']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// ENDPOINT TEMPORÁRIO EMERGENCIAL - REMOVER APÓS RESOLVER
const resetarSenhaEmergencial = async (req, res) => {
  try {
    const { email, novaSenha, codigo } = req.body;

    // Código de segurança temporário
    if (codigo !== 'RESET2024') {
      return res.status(403).json({ error: 'Código de segurança inválido' });
    }

    console.log('🚨 RESET EMERGENCIAL DE SENHA');
    console.log('   E-mail:', email);
    console.log('   Nova senha:', novaSenha ? '***' : '(vazia)');

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    console.log('   Hash gerado:', senhaHash.substring(0, 20) + '...');

    const result = await db.query(
      'UPDATE usuarios SET senha = $1, ativo = true WHERE email = $2 RETURNING id, nome, email',
      [senhaHash, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Senha resetada com sucesso para:', result.rows[0].nome);

    res.json({ 
      sucesso: true, 
      mensagem: 'Senha resetada com sucesso',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

// Trocar senha própria (usuário logado)
const trocarSenhaPropria = async (req, res) => {
  try {
    const usuario_id = req.user.id; // Vem do authMiddleware
    const { senhaAtual, novaSenha } = req.body;

    console.log('🔑 Troca de senha própria:');
    console.log('   Usuário ID:', usuario_id);
    console.log('   User-Agent:', req.headers['user-agent']);

    // Validações
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    if (senhaAtual === novaSenha) {
      return res.status(400).json({ error: 'Nova senha deve ser diferente da atual' });
    }

    // Buscar usuário
    const result = await db.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaValida) {
      console.log('❌ Senha atual incorreta');
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Gerar hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await db.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [novaSenhaHash, usuario_id]
    );

    console.log('✅ Senha alterada com sucesso para usuário:', usuario.nome);

    res.json({ 
      sucesso: true, 
      mensagem: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao trocar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

module.exports = { login, criarUsuario, resetarSenhaEmergencial, trocarSenhaPropria };
