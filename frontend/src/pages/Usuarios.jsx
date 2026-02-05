import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Usuarios = () => {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'operador',
    ativo: true
  });

  const perfis = [
    { value: 'admin', label: 'Administrador', descricao: 'Acesso total ao sistema' },
    { value: 'operador', label: 'Operador', descricao: 'Pode gerenciar exames, empresas e clínicas' },
    { value: 'secretaria', label: 'Secretária', descricao: 'Pode visualizar e enviar resultados' }
  ];

  const permissoesPorPerfil = {
    admin: [
      'Gerenciar usuários',
      'Gerenciar empresas',
      'Gerenciar clínicas',
      'Gerenciar exames',
      'Enviar e-mails',
      'Visualizar relatórios',
      'Configurações do sistema'
    ],
    operador: [
      'Gerenciar empresas',
      'Gerenciar clínicas',
      'Gerenciar exames',
      'Enviar e-mails',
      'Visualizar relatórios'
    ],
    secretaria: [
      'Visualizar exames',
      'Enviar e-mails',
      'Visualizar relatórios'
    ]
  };

  useEffect(() => {
    if (usuarioLogado?.perfil !== 'admin') {
      alert('Acesso negado! Apenas administradores podem gerenciar usuários.');
      window.location.href = '/';
      return;
    }
    carregarUsuarios();
  }, [usuarioLogado]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioAtual(usuario);
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        perfil: usuario.perfil,
        ativo: usuario.ativo
      });
    } else {
      setUsuarioAtual(null);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        perfil: 'operador',
        ativo: true
      });
    }
    setMostrarSenha(false);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setUsuarioAtual(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();

    if (salvando) {
      return;
    }

    if (!formData.nome || !formData.email) {
      alert('Nome e e-mail são obrigatórios');
      return;
    }

    if (!usuarioAtual && !formData.senha) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    try {
      setSalvando(true);
      const dados = { ...formData };
      if (usuarioAtual && !dados.senha) {
        delete dados.senha;
      }

      if (usuarioAtual) {
        await api.put(`/usuarios/${usuarioAtual.id}`, dados);
        alert('Usuário atualizado com sucesso!');
      } else {
        await api.post('/auth/usuarios', dados);
        alert('Usuário criado com sucesso!');
      }

      fecharModal();
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário: ' + (error.response?.data?.error || error.message));
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (id, ativo) => {
    if (id === usuarioLogado?.id) {
      alert('Você não pode desativar sua própria conta!');
      return;
    }

    try {
      await api.put(`/usuarios/${id}`, { ativo: !ativo });
      alert(`Usuário ${!ativo ? 'ativado' : 'desativado'} com sucesso!`);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    }
  };

  const deletarUsuario = async (id, nome) => {
    if (id === usuarioLogado?.id) {
      alert('Você não pode deletar sua própria conta!');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja deletar o usuário "${nome}"?`)) return;

    try {
      await api.delete(`/usuarios/${id}`);
      alert('Usuário deletado com sucesso!');
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const getPerfilBadge = (perfil) => {
    const badges = {
      admin: 'badge-danger',
      operador: 'badge-success',
      secretaria: 'badge-info'
    };
    return badges[perfil] || 'badge-info';
  };

  const getPerfilLabel = (perfil) => {
    const labels = {
      admin: 'Administrador',
      operador: 'Operador',
      secretaria: 'Secretária'
    };
    return labels[perfil] || perfil;
  };

  if (usuarioLogado?.perfil !== 'admin') {
    return null;
  }

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Gestão de Usuários</h2>
              <p style={{ color: '#7f8c8d', marginTop: '5px' }}>
                Controle de acesso e permissões do sistema
              </p>
            </div>
            <button className="btn btn-success" onClick={() => abrirModal()}>
              + Novo Usuário
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando usuários...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhum usuário cadastrado
                      </td>
                    </tr>
                  ) : (
                    usuarios.map(usuario => (
                      <tr key={usuario.id}>
                        <td>
                          <strong>{usuario.nome}</strong>
                          {usuario.id === usuarioLogado?.id && (
                            <span style={{ marginLeft: '8px', color: '#3498db', fontSize: '12px' }}>
                              (Você)
                            </span>
                          )}
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={`badge ${getPerfilBadge(usuario.perfil)}`}>
                            {getPerfilLabel(usuario.perfil)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${usuario.ativo ? 'badge-success' : 'badge-danger'}`}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>{new Date(usuario.criado_em).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => abrirModal(usuario)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => alternarAtivo(usuario.id, usuario.ativo)}
                              title={usuario.ativo ? 'Desativar' : 'Ativar'}
                              disabled={usuario.id === usuarioLogado?.id}
                            >
                              {usuario.ativo ? '🔒' : '🔓'}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => deletarUsuario(usuario.id, usuario.nome)}
                              title="Deletar"
                              disabled={usuario.id === usuarioLogado?.id}
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

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>📋 Permissões por Perfil</h3>
          <div className="permissoes-grid">
            {perfis.map(perfil => (
              <div key={perfil.value} className="permissao-card">
                <h4>
                  <span className={`badge ${getPerfilBadge(perfil.value)}`}>
                    {perfil.label}
                  </span>
                </h4>
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '10px' }}>
                  {perfil.descricao}
                </p>
                <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {permissoesPorPerfil[perfil.value].map((permissao, index) => (
                    <li key={index}>✓ {permissao}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{usuarioAtual ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button className="btn btn-secondary btn-small" onClick={fecharModal}>✕</button>
            </div>

            <form onSubmit={salvarUsuario}>
              <div className="form-group">
                <label>Nome Completo *</label>
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
                <label>E-mail *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Senha {usuarioAtual && '(deixe em branco para manter a atual)'}
                  {!usuarioAtual && ' *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    name="senha"
                    className="form-control"
                    value={formData.senha}
                    onChange={handleFormChange}
                    placeholder={usuarioAtual ? 'Digite apenas se quiser alterar' : 'Mínimo 6 caracteres'}
                    required={!usuarioAtual}
                    minLength="6"
                    style={{ paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#3498db',
                      fontWeight: '500',
                      textDecoration: 'underline'
                    }}
                  >
                    {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Mínimo 6 caracteres
                </small>
              </div>

              <div className="form-group">
                <label>Perfil de Acesso *</label>
                <select
                  name="perfil"
                  className="form-control"
                  value={formData.perfil}
                  onChange={handleFormChange}
                  required
                >
                  {perfis.map(perfil => (
                    <option key={perfil.value} value={perfil.value}>
                      {perfil.label} - {perfil.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {formData.perfil && (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '5px',
                  marginBottom: '15px'
                }}>
                  <strong style={{ fontSize: '14px' }}>Permissões deste perfil:</strong>
                  <ul style={{ marginTop: '10px', fontSize: '13px', lineHeight: '1.8' }}>
                    {permissoesPorPerfil[formData.perfil].map((permissao, index) => (
                      <li key={index}>✓ {permissao}</li>
                    ))}
                  </ul>
                </div>
              )}

              {usuarioAtual && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleFormChange}
                      style={{ marginRight: '8px' }}
                    />
                    Usuário ativo
                  </label>
                  <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                    Usuários inativos não podem fazer login no sistema
                  </small>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
