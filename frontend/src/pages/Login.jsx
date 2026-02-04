import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      return;
    }

    setErro('');
    setLoading(true);

    try {
      const resultado = await login(email, senha);

      if (resultado.sucesso) {
        navigate('/');
      } else {
        setErro(resultado.erro || 'Erro ao fazer login');
        setLoading(false);
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Central de Resultados</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#7f8c8d' }}>
          AST Assessoria
        </p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
