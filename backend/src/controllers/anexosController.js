const db = require('../database/db');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Função auxiliar para deletar do Cloudinary
const deletarDoCloudinary = async (caminhoArquivo) => {
  try {
    // Se não for URL do Cloudinary, ignorar
    if (!caminhoArquivo || !caminhoArquivo.includes('cloudinary')) {
      console.log('📁 Arquivo não está no Cloudinary, pulando exclusão:', caminhoArquivo);
      return { success: false, reason: 'not_cloudinary' };
    }

    console.log('🗑️ Iniciando exclusão do Cloudinary');
    console.log('   URL completa:', caminhoArquivo);

    // Extrair public_id da URL (SEM extensão)
    // Exemplo: https://res.cloudinary.com/dmdmmphge/image/upload/v1234567/central-resultados/arquivo.pdf
    // Public ID: central-resultados/arquivo
    const match = caminhoArquivo.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    
    if (!match || !match[1]) {
      console.error('⚠️ Não foi possível extrair public_id da URL:', caminhoArquivo);
      return { success: false, reason: 'invalid_url' };
    }

    const publicId = match[1];
    console.log('   Public ID extraído:', publicId);
    
    // Tentar deletar como 'raw' (PDF) primeiro
    let resultado = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true });
    console.log('   Resultado (raw):', JSON.stringify(resultado, null, 2));
    
    // Se não funcionou como 'raw', tentar como 'image'
    if (resultado.result !== 'ok') {
      console.log('   Tentando deletar como image...');
      resultado = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
      console.log('   Resultado (image):', JSON.stringify(resultado, null, 2));
    }
    
    if (resultado.result === 'ok') {
      console.log('✅ Arquivo deletado com sucesso do Cloudinary!');
      return { success: true, result: resultado };
    } else if (resultado.result === 'not found') {
      console.log('⚠️ Arquivo não encontrado no Cloudinary (já foi deletado?)');
      return { success: true, result: resultado, reason: 'already_deleted' };
    } else {
      console.warn('⚠️ Cloudinary retornou:', resultado.result);
      return { success: false, result: resultado };
    }
  } catch (error) {
    console.error('⚠️ Erro ao deletar do Cloudinary:', error.message);
    console.error('⚠️ Stack:', error.stack);
    return { success: false, error: error.message };
  }
};

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

    // Buscar dados do exame para renomear arquivo
    const exameResult = await db.query(
      'SELECT funcionario_nome, funcionario_cpf FROM exames WHERE id = $1',
      [exame_id]
    );

    if (exameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    const { funcionario_nome, funcionario_cpf } = exameResult.rows[0];

    // Contar anexos existentes para gerar número sequencial
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM exames_anexos WHERE exame_id = $1',
      [exame_id]
    );
    const sequencial = parseInt(countResult.rows[0].total) + 1;

    // Cloudinary retorna 'path' (URL completa)
    // Storage local retorna 'filename' (nome do arquivo)
    let caminhoArquivo = req.file.path || `/uploads/${req.file.filename}`;
    
    // Se for Cloudinary, renomear com Nome_CPF_(sequencial)
    if (caminhoArquivo.includes('cloudinary')) {
      const nomeLimpo = (funcionario_nome || 'SemNome').replace(/[^a-zA-Z0-9]/g, '_');
      const cpfLimpo = (funcionario_cpf || '').replace(/[^0-9]/g, '');
      const novoNome = `${nomeLimpo}_${cpfLimpo}_${sequencial}`;
      
      console.log(`🔄 Renomeando arquivo no Cloudinary para: ${novoNome}`);
      
      // Extrair public_id do caminho atual
      const match = caminhoArquivo.match(/\/v\d+\/(.+)\.\w+$/);
      if (match && match[1]) {
        const publicIdAntigo = match[1];
        
        try {
          // Renomear no Cloudinary
          const resultado = await cloudinary.uploader.rename(
            publicIdAntigo,
            `central-resultados/${novoNome}`,
            { resource_type: 'raw', overwrite: false }
          );
          
          caminhoArquivo = resultado.secure_url;
          console.log('✅ Arquivo renomeado:', caminhoArquivo);
        } catch (renameError) {
          console.warn('⚠️ Não foi possível renomear, usando nome original');
        }
      }
    }
    
    console.log('   Caminho salvo no banco:', caminhoArquivo);

    const result = await db.query(
      `INSERT INTO exames_anexos (exame_id, nome_arquivo, caminho_arquivo, enviado_por)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [exame_id, req.file.originalname, caminhoArquivo, usuario_id]
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

    // Buscar anexo antes de deletar para pegar o caminho do arquivo
    const anexoResult = await db.query('SELECT * FROM exames_anexos WHERE id = $1', [anexo_id]);
    
    if (anexoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    const anexo = anexoResult.rows[0];

    // Deletar do Cloudinary (se for o caso)
    await deletarDoCloudinary(anexo.caminho_arquivo);

    // Deletar do banco de dados
    await db.query('DELETE FROM exames_anexos WHERE id = $1', [anexo_id]);

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
