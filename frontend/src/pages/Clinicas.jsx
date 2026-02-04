import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ImprimirRelatorio from '../components/ImprimirRelatorio';

const Clinicas = () => {
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clinicaAtual, setClinicaAtual] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    tipo_integracao: 'manual',
    email_contato: '',
    telefone: '',
    observacao: ''
  });

  useEffect(() => {
    carregarClinicas();
  }, []);

  const carregarClinicas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinicas');
      setClinicas(response.data);
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
      alert('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (clinica = null) => {
    if (clinica) {
      setClinicaAtual(clinica);
      setFormData({
        nome: clinica.nome,
        cnpj: clinica.cnpj || '',
        tipo_integracao: clinica.tipo_integracao,
        email_contato: clinica.email_contato || '',
        telefone: clinica.telefone || '',
        observacao: clinica.observacao || ''
      });
    } else {
      setClinicaAtual(null);
      setFormData({
        nome: '',
        cnpj: '',
        tipo_integracao: 'manual',
        email_contato: '',
        telefone: '',
        observacao: ''
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setClinicaAtual(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const salvarClinica = async (e) => {
    e.preventDefault();

    try {
      const dados = {
        ...formData,
        config_api: null,
        config_importacao: null,
        intervalo_busca: 60
      };

      if (clinicaAtual) {
        await api.put(`/clinicas/${clinicaAtual.id}`, { ...dados, ativo: true });
        alert('Clínica atualizada com sucesso!');
      } else {
        await api.post('/clinicas', dados);
        alert('Clínica cadastrada com sucesso!');
      }

      fecharModal();
      carregarClinicas();
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      alert('Erro ao salvar clínica: ' + (error.response?.data?.error || error.message));
    }
  };

  const deletarClinica = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar a clínica "${nome}"?`)) return;

    try {
      await api.delete(`/clinicas/${id}`);
      alert('Clínica deletada com sucesso!');
      carregarClinicas();
    } catch (error) {
      console.error('Erro ao deletar clínica:', error);
      alert('Erro ao deletar clínica. Pode haver exames vinculados.');
    }
  };

  const exportarParaExcel = async () => {
    try {
      const response = await api.get('/exportar/clinicas', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clinicas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados para Excel');
    }
  };

  const getTipoIntegracaoLabel = (tipo) => {
    const labels = {
      'manual': 'Manual',
      'planilha': 'Importação de Planilha',
      'api': 'API REST',
      'importacao': 'Importação de Planilha'
    };
    return labels[tipo] || tipo;
  };

  const getTipoIntegracaoBadge = (tipo) => {
    const badges = {
      'manual': 'badge-info',
      'planilha': 'badge-warning',
      'api': 'badge-success',
      'importacao': 'badge-warning'
    };
    return badges[tipo] || 'badge-info';
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Clínicas Parceiras</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-info" onClick={exportarParaExcel}>
                📊 Exportar Excel
              </button>
              <ImprimirRelatorio dados={clinicas} tipo="clinicas" />
              <button className="btn btn-success" onClick={() => abrirModal()}>
                + Nova Clínica
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Carregando clínicas...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Tipo de Integração</th>
                    <th>E-mail de Contato</th>
                    <th>Telefone</th>
                    <th>Observação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicas.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhuma clínica cadastrada
                      </td>
                    </tr>
                  ) : (
                    clinicas.map(clinica => (
                      <tr key={clinica.id}>
                        <td><strong>{clinica.nome}</strong></td>
                        <td>{clinica.cnpj || '-'}</td>
                        <td>
                          <span className={`badge ${getTipoIntegracaoBadge(clinica.tipo_integracao)}`}>
                            {getTipoIntegracaoLabel(clinica.tipo_integracao)}
                          </span>
                        </td>
                        <td>{clinica.email_contato || '-'}</td>
                        <td>{clinica.telefone || '-'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {clinica.observacao || '-'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => abrirModal(clinica)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => deletarClinica(clinica.id, clinica.nome)}
                              title="Deletar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{clinicaAtual ? 'Editar Clínica' : 'Nova Clínica'}</h2>
              <button className="btn btn-secondary btn-small" onClick={fecharModal}>✕</button>
            </div>

            <form onSubmit={salvarClinica}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  value={formData.nome}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  className="form-control"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Integração *</label>
                <select
                  name="tipo_integracao"
                  className="form-control"
                  value={formData.tipo_integracao}
                  onChange={handleFormChange}
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="planilha">Importação de Planilha</option>
                  <option value="api">API REST</option>
                </select>
                <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Manual: cadastro direto no sistema | Planilha: importação Excel/CSV | API: sincronização automática
                </small>
              </div>

              <div className="form-group">
                <label>E-mail de Contato</label>
                <input
                  type="email"
                  name="email_contato"
                  className="form-control"
                  placeholder="contato@clinica.com.br"
                  value={formData.email_contato}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  className="form-control"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Observação</label>
                <textarea
                  name="observacao"
                  className="form-control"
                  rows="3"
                  placeholder="Informações adicionais sobre a clínica"
                  value={formData.observacao}
                  onChange={handleFormChange}
                />
              </div>

              {formData.tipo_integracao !== 'manual' && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', marginBottom: '15px' }}>
                  <small style={{ color: '#856404' }}>
                    <strong>Nota:</strong> Para configurar integrações avançadas (API ou importação de planilhas),
                    entre em contato com o suporte técnico após cadastrar a clínica.
                  </small>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clinicas;
