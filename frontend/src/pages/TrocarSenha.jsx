import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TrocarSenha = () => {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validações frontend
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('Nova senha e confirmação não coincidem');
      return;
    }

    if (senhaAtual === novaSenha) {
      setErro('Nova senha deve ser diferente da atual');
      return;
    }

    setCarregando(true);

    try {
      const response = await api.put('/auth/trocar-senha', {
        senhaAtual,
        novaSenha
      });

      setSucesso(response.data.mensagem || 'Senha alterada com sucesso!');
      
      // Limpar campos
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/exames');
      }, 2000);
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      setErro(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Trocar Senha</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Altere sua senha de acesso ao sistema
        </p>

        {erro && <div className="error-message">{erro}</div>}
        {sucesso && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Senha Atual *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarSenhaAtual ? 'text' : 'password'}
                className="form-control"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={carregando}
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#3498db',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                {mostrarSenhaAtual ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Nova Senha *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                className="form-control"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                disabled={carregando}
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#3498db',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                {mostrarNovaSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Nova Senha *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                className="form-control"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a nova senha novamente"
                disabled={carregando}
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#3498db',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                {mostrarConfirmar ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={carregando}
            >
              {carregando ? 'Alterando...' : 'Alterar Senha'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/exames')}
              disabled={carregando}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="info-box" style={{ marginTop: '20px' }}>
          <p><strong>Dicas de Segurança:</strong></p>
          <p>• Use no mínimo 6 caracteres</p>
          <p>• Misture letras, números e símbolos</p>
          <p>• Não compartilhe sua senha</p>
          <p>• Troque sua senha periodicamente</p>
        </div>
      </div>
    </div>
  );
};

export default TrocarSenha;
