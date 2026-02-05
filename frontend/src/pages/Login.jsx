import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Carregar logo do sistema (com timeout para não atrasar login)
  useEffect(() => {
    const carregarLogo = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos max

        const response = await api.get('/configuracoes', { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);

        if (response.data.logo) {
          // Se for URL completa (Cloudinary), usar diretamente
          if (response.data.logo.startsWith('http://') || response.data.logo.startsWith('https://')) {
            setLogo(response.data.logo);
          } else {
            // Se for caminho relativo, construir URL completa
            setLogo(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.data.logo}`);
          }
        }
      } catch (error) {
        // Silenciar erro - logo é opcional
      }
    };
    carregarLogo();
  }, []);

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
        {/* Logo da Empresa - Destaque Profissional */}
        {logo && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '35px',
            paddingBottom: '25px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <img 
              src={logo} 
              alt="Logo da Empresa" 
              style={{ 
                maxWidth: '250px',
                maxHeight: '140px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
          </div>
        )}

        {/* Mensagem de Boas-Vindas */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '35px'
        }}>
          <h2 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '10px',
            letterSpacing: '-0.5px'
          }}>
            Bem-vindo ao Sistema
          </h2>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '500',
            color: '#3498db',
            marginBottom: '6px',
            letterSpacing: '-0.3px'
          }}>
            Central de Resultados
          </h3>
          <p style={{ 
            fontSize: '14px',
            color: '#7f8c8d',
            margin: 0,
            fontWeight: '400'
          }}>
            AST Assessoria
          </p>
        </div>

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
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '5px 8px',
                  color: '#3498db',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
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
