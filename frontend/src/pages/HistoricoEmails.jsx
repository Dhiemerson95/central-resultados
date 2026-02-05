import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const HistoricoEmails = () => {
  const { usuario } = useAuth();
  // Função para obter data atual no formato YYYY-MM-DD
  const getDataAtual = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const [emails, setEmails] = useState([]);
  // Filtros iniciam com data atual preenchida
  const [filtros, setFiltros] = useState({
    dataInicio: getDataAtual(),
    dataFim: getDataAtual(),
    destinatario: '',
    status: ''
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEmails();
  }, []);

  const carregarEmails = async () => {
    try {
      setCarregando(true);
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.destinatario) params.append('destinatario', filtros.destinatario);
      if (filtros.status) params.append('status', filtros.status);

      const response = await api.get(`/email/historico?${params.toString()}`);
      setEmails(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      alert('Erro ao carregar histórico de e-mails');
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregarEmails();
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      destinatario: '',
      status: ''
    });
    setTimeout(() => carregarEmails(), 100);
  };

  const exportarExcel = () => {
    if (emails.length === 0) {
      alert('Nenhum registro para exportar');
      return;
    }

    // Preparar dados para Excel
    const dados = emails.map(email => ({
      'Data/Hora': new Date(email.data_envio).toLocaleString('pt-BR'),
      'Destinatário': email.destinatario,
      'Assunto': email.assunto,
      'Status': email.status === 'enviado' ? 'Enviado' : 'Falhou',
      'Funcionário': email.funcionario_nome || 'N/A',
      'Erro': email.erro || ''
    }));

    // Converter para CSV
    const headers = Object.keys(dados[0]).join(',');
    const rows = dados.map(obj => Object.values(obj).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(','));
    
    const csv = [headers, ...rows].join('\n');
    
    // Download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const imprimirEmails = () => {
    window.print();
  };

  const reenviarEmail = async (emailId) => {
    if (!confirm('Deseja reenviar este e-mail?')) return;

    try {
      await api.post(`/email/reenviar/${emailId}`);
      alert('E-mail reenviado com sucesso!');
      carregarEmails();
    } catch (error) {
      console.error('Erro ao reenviar:', error);
      alert('Erro ao reenviar e-mail');
    }
  };

  if (!usuario || usuario.perfil === 'client') {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>Acesso Negado</h2>
            <p>Você não tem permissão para visualizar histórico de e-mails.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>📧 Histórico de E-mails</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Registro de todos os e-mails enviados pelo sistema
          </p>

          <form onSubmit={handleFiltrar} className="filters">
            <div className="form-group" style={{ maxWidth: '140px' }}>
              <label>Data Início</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ maxWidth: '140px' }}>
              <label>Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label>Destinatário</label>
              <input
                type="text"
                className="form-control"
                placeholder="E-mail do destinatário"
                value={filtros.destinatario}
                onChange={(e) => setFiltros({ ...filtros, destinatario: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ maxWidth: '130px' }}>
              <label>Status</label>
              <select
                className="form-control"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="enviado">Enviado</option>
                <option value="erro">Erro</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'flex-end',
              flexWrap: 'nowrap'
            }}>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '90px', padding: '8px 12px' }}>
                🔍 Filtrar
              </button>
              <button type="button" className="btn btn-secondary" onClick={limparFiltros} style={{ minWidth: '90px', padding: '8px 12px' }}>
                🔄 Limpar
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={exportarExcel}
                disabled={emails.length === 0}
                style={{ minWidth: '100px', padding: '8px 12px' }}
              >
                📊 Excel
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={imprimirEmails}
                disabled={emails.length === 0}
                style={{ minWidth: '100px', padding: '8px 12px' }}
              >
                🖨️ Imprimir
              </button>
            </div>
          </form>
        </div>

        {carregando ? (
          <div className="loading">Carregando histórico...</div>
        ) : (
          <div className="card">
            <h3>E-mails Encontrados: {emails.length}</h3>
            
            {emails.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
                Nenhum e-mail encontrado
              </p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Destinatário</th>
                      <th>Assunto</th>
                      <th>Status</th>
                      <th>Exame</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id}>
                        <td>
                          {new Date(email.data_envio).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <strong>{email.destinatario}</strong>
                          {email.funcionario_nome && (
                            <div style={{ fontSize: '11px', color: '#7f8c8d' }}>
                              {email.funcionario_nome}
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '250px' }}>
                          {email.assunto}
                        </td>
                        <td>
                          {email.status === 'enviado' && (
                            <span className="badge badge-success">✅ Enviado</span>
                          )}
                          {email.status === 'erro' && (
                            <span className="badge badge-danger">❌ Erro</span>
                          )}
                          {email.status === 'pendente' && (
                            <span className="badge badge-warning">⏳ Pendente</span>
                          )}
                          {email.erro_mensagem && (
                            <div style={{ fontSize: '11px', color: '#e74c3c', marginTop: '5px' }}>
                              {email.erro_mensagem}
                            </div>
                          )}
                        </td>
                        <td>
                          {email.exame_id ? (
                            <code>#{email.exame_id}</code>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {email.status === 'erro' && (
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => reenviarEmail(email.id)}
                              title="Reenviar e-mail"
                            >
                              🔄 Reenviar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoEmails;
