import { useAuth } from '../contexts/AuthContext';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const { preferencias } = usePreferencias();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const podeAcessar = (recurso) => {
    if (!usuario) return false;

    const permissoes = {
      admin: ['exames', 'empresas', 'clinicas', 'usuarios', 'configuracoes', 'permissoes', 'smtp'],
      operador: ['exames', 'empresas', 'clinicas', 'configuracoes'],
      secretaria: ['exames', 'configuracoes']
    };

    return permissoes[usuario.perfil]?.includes(recurso) || false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {preferencias.logo && (
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${preferencias.logo}`}
              alt="Logo"
              className="navbar-logo"
              style={{ 
                height: '80px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
            />
          )}
          <h1 style={{ margin: 0 }}>Central de Resultados - AST Assessoria</h1>
        </div>
        <div className="navbar-menu">
          {podeAcessar('exames') && (
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              📋 Exames
            </Link>
          )}
          
          {podeAcessar('empresas') && (
            <Link 
              to="/empresas" 
              className={`navbar-link ${isActive('/empresas') ? 'active' : ''}`}
            >
              🏢 Empresas
            </Link>
          )}
          
          {podeAcessar('clinicas') && (
            <Link 
              to="/clinicas" 
              className={`navbar-link ${isActive('/clinicas') ? 'active' : ''}`}
            >
              🏥 Clínicas
            </Link>
          )}
          
          {podeAcessar('usuarios') && (
            <Link 
              to="/usuarios" 
              className={`navbar-link ${isActive('/usuarios') ? 'active' : ''}`}
            >
              👥 Usuários
            </Link>
          )}
          
          {podeAcessar('permissoes') && (
            <Link 
              to="/permissoes" 
              className={`navbar-link ${isActive('/permissoes') ? 'active' : ''}`}
            >
              🔐 Permissões
            </Link>
          )}
          
          {podeAcessar('smtp') && (
            <Link 
              to="/smtp" 
              className={`navbar-link ${isActive('/smtp') ? 'active' : ''}`}
            >
              📧 Config. SMTP
            </Link>
          )}
          
          {podeAcessar('configuracoes') && (
            <Link 
              to="/configuracoes" 
              className={`navbar-link ${isActive('/configuracoes') ? 'active' : ''}`}
            >
              ⚙️ Configurações
            </Link>
          )}
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">
          Olá, {usuario?.nome}
          <span style={{ marginLeft: '5px', fontSize: '11px', opacity: 0.8 }}>
            ({usuario?.perfil?.toUpperCase()})
          </span>
        </span>
        <Link to="/trocar-senha" className="btn btn-secondary btn-small">
          🔑 Trocar Senha
        </Link>
        <button className="btn btn-secondary btn-small" onClick={logout}>
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
