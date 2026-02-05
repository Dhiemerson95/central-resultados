import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Logs = () => {
  const { usuario } = useAuth();
  const [logs, setLogs] = useState([]);
  // Inicializar filtros com data atual
  const getDataAtual = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = useState({
    dataInicio: getDataAtual(),
    dataFim: getDataAtual(),
    usuario: '',
    acao: ''
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    try {
      setCarregando(true);
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.usuario) params.append('usuario', filtros.usuario);
      if (filtros.acao) params.append('acao', filtros.acao);

      const response = await api.get(`/logs?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      alert('Erro ao carregar logs de auditoria');
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregarLogs();
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: getDataAtual(),
      dataFim: getDataAtual(),
      usuario: '',
      acao: ''
    });
    setTimeout(() => carregarLogs(), 100);
  };

  const exportarExcel = () => {
    if (logs.length === 0) {
      alert('Nenhum registro para exportar');
      return;
    }

    // Preparar dados para Excel
    const dados = logs.map(log => ({
      'Data/Hora': new Date(log.data_hora).toLocaleString('pt-BR'),
      'Usuário': log.usuario_nome || 'N/A',
      'E-mail': log.usuario_email || 'N/A',
      'Ação': log.acao,
      'Detalhes': log.detalhes || '',
      'IP': log.ip || 'N/A'
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
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const imprimirLogs = () => {
    window.print();
  };

  const getTipoIcone = (acao) => {
    switch (acao) {
      case 'login': return '🔐';
      case 'visualizar_exame': return '👁️';
      case 'download_anexo': return '⬇️';
      case 'pesquisa': return '🔍';
      case 'criar_exame': return '➕';
      case 'editar_exame': return '✏️';
      case 'deletar_exame': return '🗑️';
      default: return '📝';
    }
  };

  if (!usuario || usuario.perfil === 'client') {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>Acesso Negado</h2>
            <p>Você não tem permissão para visualizar logs de auditoria.</p>
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
          <h2>📊 Logs de Auditoria</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Histórico de ações dos usuários no sistema
          </p>

          <form onSubmit={handleFiltrar} className="filters">
            <div className="form-group">
              <label>Data Início</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Usuário</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome ou e-mail"
                value={filtros.usuario}
                onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Ação</label>
              <select
                className="form-control"
                value={filtros.acao}
                onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
              >
                <option value="">Todas</option>
                <option value="login">Login</option>
                <option value="visualizar_exame">Visualizar Exame</option>
                <option value="download_anexo">Download Anexo</option>
                <option value="pesquisa">Pesquisa</option>
                <option value="criar_exame">Criar Exame</option>
                <option value="editar_exame">Editar Exame</option>
                <option value="deletar_exame">Deletar Exame</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                🔍 Filtrar
              </button>
              <button type="button" className="btn btn-secondary" onClick={limparFiltros}>
                🔄 Limpar
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={exportarExcel}
                disabled={logs.length === 0}
              >
                📊 Exportar Excel
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={imprimirLogs}
                disabled={logs.length === 0}
              >
                🖨️ Imprimir
              </button>
            </div>
          </form>
        </div>

        {carregando ? (
          <div className="loading">Carregando logs...</div>
        ) : (
          <div className="card">
            <h3>Registros Encontrados: {logs.length}</h3>
            
            {logs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
                Nenhum log encontrado
              </p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Ação</th>
                      <th>Detalhes</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          {new Date(log.data_hora).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <div>
                            <strong>{log.usuario_nome}</strong>
                            <div style={{ fontSize: '11px', color: '#7f8c8d' }}>
                              {log.usuario_email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '16px', marginRight: '5px' }}>
                            {getTipoIcone(log.acao)}
                          </span>
                          {log.acao.replace(/_/g, ' ').toUpperCase()}
                        </td>
                        <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                          {log.detalhes || '-'}
                        </td>
                        <td>
                          <code style={{ fontSize: '11px' }}>{log.ip || '-'}</code>
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

export default Logs;
