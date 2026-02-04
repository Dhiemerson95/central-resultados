import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ConfigSMTP = () => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_usuario: '',
    smtp_senha: '',
    smtp_secure: false
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/configuracoes');
      
      if (response.data) {
        setFormData({
          smtp_host: response.data.smtp_host || '',
          smtp_port: response.data.smtp_port || 587,
          smtp_usuario: response.data.smtp_usuario || '',
          smtp_senha: '',
          smtp_secure: response.data.smtp_secure || false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      alert('Erro ao carregar configurações SMTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const testarConexao = async () => {
    if (!formData.smtp_host || !formData.smtp_usuario || !formData.smtp_senha) {
      alert('Preencha todos os campos obrigatórios antes de testar');
      return;
    }

    setTestando(true);
    try {
      const response = await api.post('/configuracoes/testar-smtp', formData);
      
      if (response.data.sucesso) {
        alert('✅ Conexão SMTP testada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao testar SMTP:', error);
      alert('❌ Falha ao testar conexão: ' + (error.response?.data?.detalhes || error.message));
    } finally {
      setTestando(false);
    }
  };

  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    
    setSalvando(true);
    try {
      await api.put('/configuracoes', formData);
      alert('✅ Configurações SMTP salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('❌ Erro ao salvar configurações: ' + (error.response?.data?.error || error.message));
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <p>Carregando...</p>
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
          <h2>Configurações de E-mail (SMTP)</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Configure os dados do servidor SMTP para envio de e-mails automáticos do sistema.
          </p>

          <form onSubmit={salvarConfiguracoes}>
            <div className="form-group">
              <label>Servidor SMTP (Host) *</label>
              <input
                type="text"
                name="smtp_host"
                className="form-control"
                value={formData.smtp_host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                required
              />
              <small style={{ color: '#666' }}>
                Exemplo: smtp.gmail.com, smtp.office365.com
              </small>
            </div>

            <div className="form-group">
              <label>Porta SMTP *</label>
              <input
                type="number"
                name="smtp_port"
                className="form-control"
                value={formData.smtp_port}
                onChange={handleChange}
                required
              />
              <small style={{ color: '#666' }}>
                Porta padrão: 587 (TLS) ou 465 (SSL)
              </small>
            </div>

            <div className="form-group">
              <label>Usuário / E-mail *</label>
              <input
                type="email"
                name="smtp_usuario"
                className="form-control"
                value={formData.smtp_usuario}
                onChange={handleChange}
                placeholder="seu-email@exemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha *</label>
              <input
                type="password"
                name="smtp_senha"
                className="form-control"
                value={formData.smtp_senha}
                onChange={handleChange}
                placeholder="Digite a senha"
                required
              />
              <small style={{ color: '#666' }}>
                Para Gmail, use uma "Senha de App" em vez da senha normal
              </small>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="smtp_secure"
                  checked={formData.smtp_secure}
                  onChange={handleChange}
                />
                Usar conexão segura (SSL/TLS)
              </label>
              <small style={{ color: '#666' }}>
                Ative se usar porta 465 (SSL)
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-info"
                onClick={testarConexao}
                disabled={testando || salvando}
              >
                {testando ? '🔄 Testando...' : '🧪 Testar Conexão'}
              </button>
              
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={testando || salvando}
              >
                {salvando ? '💾 Salvando...' : '💾 Salvar Configurações'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
            <h4>📖 Guia Rápido</h4>
            <ul style={{ marginLeft: '20px', color: '#333' }}>
              <li><strong>Gmail:</strong> smtp.gmail.com, porta 587, TLS desativado</li>
              <li><strong>Outlook/Hotmail:</strong> smtp.office365.com, porta 587, TLS desativado</li>
              <li><strong>Yahoo:</strong> smtp.mail.yahoo.com, porta 587, TLS desativado</li>
              <li><strong>Gmail com SSL:</strong> smtp.gmail.com, porta 465, SSL ativado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigSMTP;
