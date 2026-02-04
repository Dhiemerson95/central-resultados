import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ImprimirRelatorio from '../components/ImprimirRelatorio';

const Exames = () => {
  const [exames, setExames] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [exameAtual, setExameAtual] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ destinatario: '', assunto: '', corpo: '' });
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  const [filtros, setFiltros] = useState({
    empresa_id: '',
    clinica_id: '',
    data_inicio: '',
    data_fim: '',
    tipo_exame: '',
    status: '',
    enviado_cliente: '',
    lancado_soc: '',
    busca: ''
  });

  const [formData, setFormData] = useState({
    empresa_id: '',
    clinica_id: '',
    funcionario_nome: '',
    funcionario_cpf: '',
    funcionario_matricula: '',
    data_atendimento: '',
    tipo_exame: '',
    resultado: '',
    status: 'pendente',
    observacao: '',
    codigo_exame_soc: '',
    arquivo: null
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    carregarExames();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      const [empresasRes, clinicasRes] = await Promise.all([
        api.get('/empresas'),
        api.get('/clinicas')
      ]);

      setEmpresas(empresasRes.data);
      setClinicas(clinicasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados auxiliares');
    }
  };

  const carregarExames = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/exames?${params.toString()}`);
      setExames(response.data);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      alert('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({
      empresa_id: '',
      clinica_id: '',
      data_inicio: '',
      data_fim: '',
      tipo_exame: '',
      status: '',
      enviado_cliente: '',
      lancado_soc: '',
      busca: ''
    });
  };

  const abrirModal = (exame = null) => {
    if (exame) {
      setExameAtual(exame);
      setFormData({
        empresa_id: exame.empresa_id || '',
        clinica_id: exame.clinica_id || '',
        funcionario_nome: exame.funcionario_nome,
        funcionario_cpf: exame.funcionario_cpf || '',
        funcionario_matricula: exame.funcionario_matricula || '',
        data_atendimento: exame.data_atendimento?.split('T')[0] || '',
        tipo_exame: exame.tipo_exame,
        resultado: exame.resultado || '',
        status: exame.status || 'pendente',
        observacao: exame.observacao || '',
        codigo_exame_soc: exame.codigo_exame_soc || '',
        arquivo: null
      });
    } else {
      setExameAtual(null);
      setFormData({
        empresa_id: '',
        clinica_id: '',
        funcionario_nome: '',
        funcionario_cpf: '',
        funcionario_matricula: '',
        data_atendimento: '',
        tipo_exame: '',
        resultado: '',
        status: 'pendente',
        observacao: '',
        codigo_exame_soc: '',
        arquivo: null
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setExameAtual(null);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'arquivo') {
      setFormData(prev => ({ ...prev, arquivo: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const salvarExame = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'arquivo' && value) {
          formDataToSend.append('arquivo', value);
        } else if (value) {
          formDataToSend.append(key, value);
        }
      });

      if (exameAtual) {
        await api.put(`/exames/${exameAtual.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Exame atualizado com sucesso!');
      } else {
        await api.post('/exames', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Exame cadastrado com sucesso!');
      }

      fecharModal();
      carregarExames();
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
      alert('Erro ao salvar exame: ' + (error.response?.data?.error || error.message));
    }
  };

  const deletarExame = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este exame?')) return;

    try {
      await api.delete(`/exames/${id}`);
      alert('Exame deletado com sucesso!');
      carregarExames();
    } catch (error) {
      console.error('Erro ao deletar exame:', error);
      alert('Erro ao deletar exame');
    }
  };

  const abrirModalEmail = async (exame) => {
    setExameAtual(exame);

    const empresaData = empresas.find(e => e.id === exame.empresa_id);
    const destinatarioPadrao = empresaData?.email_padrao || '';

    setEmailData({
      destinatario: destinatarioPadrao,
      assunto: `Resultado de Exame Ocupacional - ${exame.funcionario_nome}`,
      corpo: ''
    });

    setShowEmailModal(true);
  };

  const enviarEmail = async (e) => {
    e.preventDefault();

    if (!emailData.destinatario) {
      alert('Por favor, informe o e-mail de destino');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.destinatario)) {
      alert('Por favor, informe um e-mail válido');
      return;
    }

    setEnviandoEmail(true);

    try {
      const response = await api.post(`/exames/${exameAtual.id}/enviar-email`, emailData);
      
      if (response.data.sucesso || response.data.mensagem) {
        alert('✅ E-mail enviado com sucesso!\n\nO exame foi marcado como "Enviado para cliente".');
        setShowEmailModal(false);
        carregarExames();
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      
      const errorData = error.response?.data;
      let mensagemErro = 'Não foi possível enviar o e-mail. ';

      if (errorData?.tipo === 'validacao') {
        mensagemErro += errorData.error;
      } else if (errorData?.tipo === 'autenticacao') {
        mensagemErro += 'Falha na autenticação SMTP. Verifique as configurações de e-mail.';
      } else if (errorData?.tipo === 'conexao') {
        mensagemErro += 'Não foi possível conectar ao servidor de e-mail. Verifique sua conexão.';
      } else if (errorData?.tipo === 'configuracao') {
        mensagemErro += 'Configurações SMTP não encontradas. Entre em contato com o administrador.';
      } else if (errorData?.error) {
        mensagemErro += errorData.error;
      } else {
        mensagemErro += 'Erro desconhecido. Tente novamente mais tarde.';
      }

      alert('❌ ' + mensagemErro);
    } finally {
      setEnviandoEmail(false);
    }
  };

  const marcarLancadoSOC = async (id, lancado) => {
    try {
      await api.put(`/exames/${id}/lancar-soc`, { lancado });
      alert(`Exame marcado como ${lancado ? 'lançado' : 'não lançado'} no SOC`);
      carregarExames();
    } catch (error) {
      console.error('Erro ao marcar exame no SOC:', error);
      alert('Erro ao marcar exame no SOC');
    }
  };

  const exportarParaExcel = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/exportar/exames?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exames_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados para Excel');
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Exames Ocupacionais</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-info" onClick={exportarParaExcel}>
                📊 Exportar Excel
              </button>
              <ImprimirRelatorio dados={exames} tipo="exames" />
              <button className="btn btn-success" onClick={() => abrirModal()}>
                + Novo Exame
              </button>
            </div>
          </div>

          <div className="filters">
            <div className="form-group">
              <label>Buscar Funcionário</label>
              <input
                type="text"
                name="busca"
                className="form-control"
                placeholder="Nome ou CPF"
                value={filtros.busca}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="form-group">
              <label>Empresa</label>
              <select
                name="empresa_id"
                className="form-control"
                value={filtros.empresa_id}
                onChange={handleFiltroChange}
              >
                <option value="">Todas</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razao_social}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Clínica</label>
              <select
                name="clinica_id"
                className="form-control"
                value={filtros.clinica_id}
                onChange={handleFiltroChange}
              >
                <option value="">Todas</option>
                {clinicas.map(cli => (
                  <option key={cli.id} value={cli.id}>{cli.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Data Início</label>
              <input
                type="date"
                name="data_inicio"
                className="form-control"
                value={filtros.data_inicio}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="form-group">
              <label>Data Fim</label>
              <input
                type="date"
                name="data_fim"
                className="form-control"
                value={filtros.data_fim}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                className="form-control"
                value={filtros.status}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="concluído">Concluído</option>
                <option value="falta imagem">Falta Imagem</option>
                <option value="aguardando laudo">Aguardando Laudo</option>
                <option value="conferido">Conferido</option>
                <option value="faturado">Faturado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Enviado p/ Cliente</label>
              <select
                name="enviado_cliente"
                className="form-control"
                value={filtros.enviado_cliente}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="form-group">
              <label>Lançado no SOC</label>
              <select
                name="lancado_soc"
                className="form-control"
                value={filtros.lancado_soc}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={limparFiltros} style={{ marginBottom: '20px' }}>
            Limpar Filtros
          </button>
        </div>

        {loading ? (
          <div className="loading">Carregando exames...</div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Funcionário</th>
                    <th>CPF</th>
                    <th>Data</th>
                    <th>Tipo de Exame</th>
                    <th>Resultado</th>
                    <th>Status</th>
                    <th>Enviado</th>
                    <th>SOC</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {exames.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhum exame encontrado
                      </td>
                    </tr>
                  ) : (
                    exames.map(exame => (
                      <tr key={exame.id}>
                        <td>{exame.empresa_nome || '-'}</td>
                        <td>{exame.funcionario_nome}</td>
                        <td>{exame.funcionario_cpf || '-'}</td>
                        <td>{new Date(exame.data_atendimento).toLocaleDateString('pt-BR')}</td>
                        <td>{exame.tipo_exame}</td>
                        <td>{exame.resultado || '-'}</td>
                        <td>
                          <span className={`badge badge-${
                            exame.status === 'concluído' ? 'success' :
                            exame.status === 'pendente' ? 'warning' :
                            'info'
                          }`}>
                            {exame.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${exame.enviado_cliente ? 'success' : 'danger'}`}>
                            {exame.enviado_cliente ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${exame.lancado_soc ? 'success' : 'danger'}`}>
                            {exame.lancado_soc ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => abrirModal(exame)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-success btn-small"
                              onClick={() => abrirModalEmail(exame)}
                              title="Enviar E-mail"
                            >
                              📧
                            </button>
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => marcarLancadoSOC(exame.id, !exame.lancado_soc)}
                              title={exame.lancado_soc ? 'Desmarcar SOC' : 'Marcar SOC'}
                            >
                              {exame.lancado_soc ? '✔️' : '⏳'}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => deletarExame(exame.id)}
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
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{exameAtual ? 'Editar Exame' : 'Novo Exame'}</h2>
              <button className="btn btn-secondary btn-small" onClick={fecharModal}>✕</button>
            </div>

            <form onSubmit={salvarExame}>
              <div className="form-group">
                <label>Empresa *</label>
                <select
                  name="empresa_id"
                  className="form-control"
                  value={formData.empresa_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.razao_social}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Clínica *</label>
                <select
                  name="clinica_id"
                  className="form-control"
                  value={formData.clinica_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {clinicas.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Funcionário *</label>
                <input
                  type="text"
                  name="funcionario_nome"
                  className="form-control"
                  value={formData.funcionario_nome}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  name="funcionario_cpf"
                  className="form-control"
                  value={formData.funcionario_cpf}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Matrícula</label>
                <input
                  type="text"
                  name="funcionario_matricula"
                  className="form-control"
                  value={formData.funcionario_matricula}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Data do Atendimento *</label>
                <input
                  type="date"
                  name="data_atendimento"
                  className="form-control"
                  value={formData.data_atendimento}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Exame *</label>
                <input
                  type="text"
                  name="tipo_exame"
                  className="form-control"
                  value={formData.tipo_exame}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Resultado</label>
                <select
                  name="resultado"
                  className="form-control"
                  value={formData.resultado}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione...</option>
                  <option value="Apto">Apto</option>
                  <option value="Inapto">Inapto</option>
                  <option value="Apto com restrições">Apto com restrições</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluído">Concluído</option>
                  <option value="falta imagem">Falta Imagem</option>
                  <option value="aguardando laudo">Aguardando Laudo</option>
                  <option value="conferido">Conferido</option>
                  <option value="faturado">Faturado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Código SOC</label>
                <input
                  type="text"
                  name="codigo_exame_soc"
                  className="form-control"
                  value={formData.codigo_exame_soc}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Observação</label>
                <textarea
                  name="observacao"
                  className="form-control"
                  rows="3"
                  value={formData.observacao}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Arquivo (PDF do laudo)</label>
                <input
                  type="file"
                  name="arquivo"
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png"
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

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => !enviandoEmail && setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enviar Exame por E-mail</h2>
              <button 
                className="btn btn-secondary btn-small" 
                onClick={() => setShowEmailModal(false)}
                disabled={enviandoEmail}
              >
                ✕
              </button>
            </div>

            <form onSubmit={enviarEmail}>
              <div className="form-group">
                <label>Destinatário *</label>
                <input
                  type="email"
                  className="form-control"
                  value={emailData.destinatario}
                  onChange={(e) => setEmailData(prev => ({ ...prev, destinatario: e.target.value }))}
                  required
                  disabled={enviandoEmail}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Assunto</label>
                <input
                  type="text"
                  className="form-control"
                  value={emailData.assunto}
                  onChange={(e) => setEmailData(prev => ({ ...prev, assunto: e.target.value }))}
                  disabled={enviandoEmail}
                  placeholder="O sistema gerará automaticamente se deixar em branco"
                />
              </div>

              <div className="form-group">
                <label>Mensagem Adicional (opcional)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={emailData.corpo}
                  onChange={(e) => setEmailData(prev => ({ ...prev, corpo: e.target.value }))}
                  placeholder="O sistema enviará automaticamente os dados do exame. Use este campo para adicionar uma mensagem personalizada."
                  disabled={enviandoEmail}
                />
              </div>

              {enviandoEmail && (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#d1ecf1', 
                  borderRadius: '5px', 
                  marginBottom: '15px',
                  textAlign: 'center',
                  color: '#0c5460'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <div className="spinner"></div>
                  </div>
                  <strong>Enviando e-mail...</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    Aguarde enquanto processamos o envio
                  </p>
                </div>
              )}

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEmailModal(false)}
                  disabled={enviandoEmail}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={enviandoEmail}
                >
                  {enviandoEmail ? 'Enviando...' : 'Enviar E-mail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exames;
