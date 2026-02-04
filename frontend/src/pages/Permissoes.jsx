import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Permissoes = () => {
  const [loading, setLoading] = useState(true);
  const [perfis, setPerfis] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'perfil' ou 'usuario'
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  
  const [formPerfil, setFormPerfil] = useState({
    nome: '',
    descricao: '',
    permissoes: []
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [perfisRes, usuariosRes, permissoesRes] = await Promise.all([
        api.get('/permissoes/perfis'),
        api.get('/usuarios'),
        api.get('/permissoes/permissoes')
      ]);

      setPerfis(perfisRes.data);
      setUsuarios(usuariosRes.data);
      setPermissoes(permissoesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPerfil = (perfil = null) => {
    setModalTipo('perfil');
    if (perfil) {
      setPerfilAtual(perfil);
      setFormPerfil({
        nome: perfil.nome,
        descricao: perfil.descricao || '',
        permissoes: perfil.permissoes?.map(p => p.id) || []
      });
    } else {
      setPerfilAtual(null);
      setFormPerfil({
        nome: '',
        descricao: '',
        permissoes: []
      });
    }
    setShowModal(true);
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();
    
    try {
      if (perfilAtual) {
        await api.put(`/permissoes/perfis/${perfilAtual.id}`, formPerfil);
        alert('Perfil atualizado com sucesso!');
      } else {
        await api.post('/permissoes/perfis', formPerfil);
        alert('Perfil criado com sucesso!');
      }
      
      setShowModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil');
    }
  };

  const togglePermissao = (permissaoId) => {
    setFormPerfil(prev => {
      const novasPermissoes = prev.permissoes.includes(permissaoId)
        ? prev.permissoes.filter(id => id !== permissaoId)
        : [...prev.permissoes, permissaoId];
      
      return { ...prev, permissoes: novasPermissoes };
    });
  };

  const agruparPermissoesPorModulo = () => {
    const agrupadas = {};
    permissoes.forEach(perm => {
      if (!agrupadas[perm.modulo]) {
        agrupadas[perm.modulo] = [];
      }
      agrupadas[perm.modulo].push(perm);
    });
    return agrupadas;
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

  const permissoesAgrupadas = agruparPermissoesPorModulo();

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Gestão de Permissões</h2>
            <button className="btn btn-success" onClick={() => abrirModalPerfil()}>
              + Novo Perfil
            </button>
          </div>

          <h3>Perfis Cadastrados</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Permissões</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {perfis.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum perfil cadastrado</td>
                  </tr>
                ) : (
                  perfis.map(perfil => (
                    <tr key={perfil.id}>
                      <td><strong>{perfil.nome}</strong></td>
                      <td>{perfil.descricao}</td>
                      <td>
                        <span className="badge badge-info">
                          {perfil.permissoes?.length || 0} permissões
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => abrirModalPerfil(perfil)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: '40px' }}>Usuários e seus Perfis</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil Atual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum usuário cadastrado</td>
                  </tr>
                ) : (
                  usuarios.map(usuario => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className="badge badge-primary">
                          {usuario.perfil_nome || usuario.perfil || 'Sem perfil'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${usuario.ativo ? 'success' : 'danger'}`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && modalTipo === 'perfil' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{perfilAtual ? 'Editar Perfil' : 'Novo Perfil'}</h2>
              <button className="btn btn-secondary btn-small" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={salvarPerfil}>
              <div className="form-group">
                <label>Nome do Perfil *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formPerfil.nome}
                  onChange={(e) => setFormPerfil(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  disabled={perfilAtual && ['Admin', 'Operador', 'Cliente'].includes(perfilAtual.nome)}
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formPerfil.descricao}
                  onChange={(e) => setFormPerfil(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label><strong>Permissões</strong></label>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                  {Object.entries(permissoesAgrupadas).map(([modulo, perms]) => (
                    <div key={modulo} style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', color: '#2c3e50', marginBottom: '10px', textTransform: 'uppercase' }}>
                        📁 {modulo}
                      </h4>
                      {perms.map(perm => (
                        <div key={perm.id} style={{ marginLeft: '20px', marginBottom: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={formPerfil.permissoes.includes(perm.id)}
                              onChange={() => togglePermissao(perm.id)}
                            />
                            <span>{perm.nome}</span>
                            <small style={{ color: '#666' }}>({perm.descricao})</small>
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default Permissoes;
