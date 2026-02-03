import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ImprimirRelatorio from '../components/ImprimirRelatorio';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [empresaAtual, setEmpresaAtual] = useState(null);

  const [formData, setFormData] = useState({
    razao_social: '',
    cnpj: '',
    email_padrao: '',
    codigo_soc: '',
    telefone: '',
    observacao: ''
  });

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/empresas');
      setEmpresas(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      alert('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (empresa = null) => {
    if (empresa) {
      setEmpresaAtual(empresa);
      setFormData({
        razao_social: empresa.razao_social,
        cnpj: empresa.cnpj || '',
        email_padrao: empresa.email_padrao || '',
        codigo_soc: empresa.codigo_soc || '',
        telefone: empresa.telefone || '',
        observacao: empresa.observacao || ''
      });
    } else {
      setEmpresaAtual(null);
      setFormData({
        razao_social: '',
        cnpj: '',
        email_padrao: '',
        codigo_soc: '',
        telefone: '',
        observacao: ''
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEmpresaAtual(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const salvarEmpresa = async (e) => {
    e.preventDefault();

    try {
      if (empresaAtual) {
        await api.put(`/empresas/${empresaAtual.id}`, { ...formData, ativo: true });
        alert('Empresa atualizada com sucesso!');
      } else {
        await api.post('/empresas', formData);
        alert('Empresa cadastrada com sucesso!');
      }

      fecharModal();
      carregarEmpresas();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa: ' + (error.response?.data?.error || error.message));
    }
  };

  const deletarEmpresa = async (id, razaoSocial) => {
    if (!window.confirm(`Tem certeza que deseja deletar a empresa "${razaoSocial}"?`)) return;

    try {
      await api.delete(`/empresas/${id}`);
      alert('Empresa deletada com sucesso!');
      carregarEmpresas();
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      alert('Erro ao deletar empresa. Pode haver exames vinculados.');
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Empresas Clientes</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ImprimirRelatorio dados={empresas} tipo="empresas" />
              <button className="btn btn-success" onClick={() => abrirModal()}>
                + Nova Empresa
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Carregando empresas...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Razão Social</th>
                    <th>CNPJ</th>
                    <th>E-mail Padrão</th>
                    <th>Código SOC</th>
                    <th>Telefone</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhuma empresa cadastrada
                      </td>
                    </tr>
                  ) : (
                    empresas.map(empresa => (
                      <tr key={empresa.id}>
                        <td><strong>{empresa.razao_social}</strong></td>
                        <td>{empresa.cnpj || '-'}</td>
                        <td>{empresa.email_padrao || '-'}</td>
                        <td>{empresa.codigo_soc || '-'}</td>
                        <td>{empresa.telefone || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => abrirModal(empresa)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => deletarEmpresa(empresa.id, empresa.razao_social)}
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
              <h2>{empresaAtual ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button className="btn btn-secondary btn-small" onClick={fecharModal}>✕</button>
            </div>

            <form onSubmit={salvarEmpresa}>
              <div className="form-group">
                <label>Razão Social *</label>
                <input
                  type="text"
                  name="razao_social"
                  className="form-control"
                  value={formData.razao_social}
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
                <label>E-mail Padrão</label>
                <input
                  type="email"
                  name="email_padrao"
                  className="form-control"
                  placeholder="contato@empresa.com.br"
                  value={formData.email_padrao}
                  onChange={handleFormChange}
                />
                <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Este e-mail será usado automaticamente ao enviar resultados de exames
                </small>
              </div>

              <div className="form-group">
                <label>Código SOC</label>
                <input
                  type="text"
                  name="codigo_soc"
                  className="form-control"
                  placeholder="EMP001"
                  value={formData.codigo_soc}
                  onChange={handleFormChange}
                />
                <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Código da empresa no sistema SOC (para integração futura)
                </small>
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
                  placeholder="Informações adicionais sobre a empresa"
                  value={formData.observacao}
                  onChange={handleFormChange}
                />
              </div>

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

export default Empresas;
