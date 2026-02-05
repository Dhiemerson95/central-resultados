import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ModalAnexos({ exameId, onClose }) {
  const [anexos, setAnexos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarAnexos();
  }, [exameId]);

  const carregarAnexos = async () => {
    try {
      setCarregando(true);
      const response = await api.get(`/anexos/exames/${exameId}/anexos`);
      console.log('📋 Anexos carregados:', response.data.length);
      response.data.forEach(anexo => {
        console.log(`   - ${anexo.nome_arquivo} → ${anexo.caminho_arquivo}`);
      });
      setAnexos(response.data);
    } catch (error) {
      setErro('Erro ao carregar anexos');
      console.error('❌ Erro ao carregar anexos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      setEnviando(true);
      setErro('');
      await api.post(`/anexos/exames/${exameId}/anexos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await carregarAnexos();
      e.target.value = '';
    } catch (error) {
      setErro('Erro ao enviar arquivo');
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  const handleMarcarOficial = async (anexoId) => {
    try {
      await api.put(`/anexos/anexos/${anexoId}/oficial`);
      await carregarAnexos();
    } catch (error) {
      setErro('Erro ao marcar anexo como oficial');
      console.error(error);
    }
  };

  const handleDesmarcarOficial = async (anexoId) => {
    try {
      await api.delete(`/anexos/anexos/${anexoId}/oficial`);
      await carregarAnexos();
    } catch (error) {
      setErro('Erro ao desmarcar anexo como oficial');
      console.error(error);
    }
  };

  const handleExcluir = async (anexoId) => {
    if (!confirm('Deseja realmente excluir este anexo?')) return;

    try {
      await api.delete(`/anexos/anexos/${anexoId}`);
      await carregarAnexos();
    } catch (error) {
      setErro('Erro ao excluir anexo');
      console.error(error);
    }
  };

  const handleVisualizar = (anexo) => {
    // Se for URL completa (Cloudinary), usar diretamente
    let url;
    if (anexo.caminho_arquivo.startsWith('http://') || anexo.caminho_arquivo.startsWith('https://')) {
      url = anexo.caminho_arquivo;
    } else {
      // Se for caminho relativo, construir URL completa
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      url = `${baseUrl}/uploads/${anexo.caminho_arquivo}`;
    }
    console.log('📄 Abrindo PDF:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBaixar = (anexo) => {
    // Se for URL completa (Cloudinary), usar diretamente
    let url;
    if (anexo.caminho_arquivo.startsWith('http://') || anexo.caminho_arquivo.startsWith('https://')) {
      url = anexo.caminho_arquivo;
    } else {
      // Se for caminho relativo, construir URL completa
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      url = `${baseUrl}/uploads/${anexo.caminho_arquivo}`;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = anexo.nome_arquivo;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>📎 Gestão de Anexos</h2>
          <button onClick={onClose} className="btn btn-secondary">✕</button>
        </div>

        {erro && (
          <div className="error-message" style={{ marginBottom: '15px' }}>
            {erro}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="upload-anexo" className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {enviando ? '📤 Enviando...' : '📤 Adicionar Arquivo'}
          </label>
          <input
            id="upload-anexo"
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={enviando}
            style={{ display: 'none' }}
          />
        </div>

        {carregando ? (
          <div className="loading">Carregando anexos...</div>
        ) : anexos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Nenhum anexo cadastrado
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Arquivo</th>
                  <th>Data Upload</th>
                  <th>Usuário</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {anexos.map(anexo => (
                  <tr key={anexo.id}>
                    <td>#{anexo.id}</td>
                    <td>{anexo.nome_arquivo}</td>
                    <td>{anexo.criado_em ? new Date(anexo.criado_em).toLocaleString('pt-BR') : 'N/A'}</td>
                    <td>{anexo.enviado_por_nome || 'N/A'}</td>
                    <td>
                      {anexo.oficial ? (
                        <span className="badge badge-success">✓ OFICIAL</span>
                      ) : (
                        <span className="badge badge-warning">Rascunho</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleVisualizar(anexo)}
                          className="btn btn-small btn-primary"
                          title="Visualizar"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleBaixar(anexo)}
                          className="btn btn-small btn-secondary"
                          title="Baixar"
                        >
                          ⬇️
                        </button>
                        {!anexo.oficial ? (
                          <button
                            onClick={() => handleMarcarOficial(anexo.id)}
                            className="btn btn-small btn-success"
                            title="Marcar como Oficial"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDesmarcarOficial(anexo.id)}
                            className="btn btn-small btn-warning"
                            title="Desmarcar Oficial"
                          >
                            ✗
                          </button>
                        )}
                        <button
                          onClick={() => handleExcluir(anexo.id)}
                          className="btn btn-small btn-danger"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="info-box" style={{ marginTop: '20px' }}>
          <p><strong>ℹ️ Como funciona:</strong></p>
          <p>• Você pode fazer upload de vários arquivos para o mesmo exame</p>
          <p>• Cada arquivo recebe um ID único e fica registrado com data/hora</p>
          <p>• Marque um arquivo como <strong>OFICIAL</strong> para liberá-lo ao cliente</p>
          <p>• Apenas o arquivo oficial fica visível na área do cliente</p>
        </div>
      </div>
    </div>
  );
}
