import { useState, useEffect } from 'react';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Configuracoes = () => {
  const { preferencias, atualizarPreferencias, carregarConfiguracoes } = usePreferencias();
  const { usuario } = useAuth();
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(preferencias.logo);
  const [salvandoLogo, setSalvandoLogo] = useState(false);
  const [salvandoCores, setSalvandoCores] = useState(false);

  // Atualizar preview quando preferencias.logo mudar
  useEffect(() => {
    if (preferencias.logo) {
      // Se for URL completa (Cloudinary), usar diretamente
      if (preferencias.logo.startsWith('http://') || preferencias.logo.startsWith('https://')) {
        setPreviewLogo(preferencias.logo);
      } else {
        // Se for caminho relativo, construir URL completa
        setPreviewLogo(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${preferencias.logo}`);
      }
    } else {
      setPreviewLogo(null);
    }
  }, [preferencias.logo]);

  const fontes = [
    'Verdana',
    'Arial',
    'Calibri',
    'Tahoma',
    'Segoe UI',
    'Georgia',
    'Times New Roman'
  ];

  const tamanhosFonte = [
    { label: '8pt', value: '8pt' },
    { label: '9pt', value: '9pt' },
    { label: '10pt (Padrão)', value: '10pt' },
    { label: '11pt', value: '11pt' },
    { label: '12pt', value: '12pt' },
    { label: '14pt', value: '14pt' }
  ];

  const handleFonteChange = (e) => {
    atualizarPreferencias({ fontFamily: e.target.value });
  };

  const handleTamanhoFonteChange = (e) => {
    atualizarPreferencias({ fontSize: e.target.value });
  };

  const handleTemaChange = (e) => {
    atualizarPreferencias({ tema: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A logo deve ter no máximo 2MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarLogo = async () => {
    if (!logoFile) {
      alert('Selecione uma imagem primeiro');
      return;
    }

    if (salvandoLogo) {
      return;
    }

    try {
      setSalvandoLogo(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.put('/configuracoes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await carregarConfiguracoes();
      alert('Logo atualizada com sucesso!');
      setLogoFile(null);
    } catch (error) {
      console.error('Erro ao salvar logo:', error);
      alert('Erro ao salvar logo: ' + (error.response?.data?.error || error.message));
    } finally {
      setSalvandoLogo(false);
    }
  };

  const removerLogo = () => {
    setPreviewLogo(null);
    setLogoFile(null);
    atualizarPreferencias({ logo: null });
  };

  const salvarCores = async () => {
    if (salvandoCores) {
      return;
    }

    try {
      setSalvandoCores(true);
      
      const coresData = {
        cor_primaria: preferencias.corPrimaria || '#2c3e50',
        cor_secundaria: preferencias.corSecundaria || '#3498db',
        cor_sucesso: preferencias.corSucesso || '#27ae60',
        cor_alerta: preferencias.corAlerta || '#f39c12',
        cor_perigo: preferencias.corPerigo || '#e74c3c'
      };

      await api.put('/configuracoes', coresData);
      alert('Cores salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cores:', error);
      alert('Erro ao salvar cores: ' + (error.response?.data?.error || error.message));
    } finally {
      setSalvandoCores(false);
    }
  };

  const restaurarCoresPadrao = async () => {
    if (!window.confirm('Deseja restaurar as cores padrão do sistema?')) return;

    try {
      const coresPadrao = {
        cor_primaria: '#2c3e50',
        cor_secundaria: '#3498db',
        cor_sucesso: '#27ae60',
        cor_alerta: '#f39c12',
        cor_perigo: '#e74c3c'
      };

      await api.put('/configuracoes', coresPadrao);
      
      atualizarPreferencias({
        corPrimaria: '#2c3e50',
        corSecundaria: '#3498db',
        corSucesso: '#27ae60',
        corAlerta: '#f39c12',
        corPerigo: '#e74c3c'
      });

      alert('Cores restauradas para o padrão!');
    } catch (error) {
      console.error('Erro ao restaurar cores:', error);
      alert('Erro ao restaurar cores padrão');
    }
  };

  const restaurarPadroes = () => {
    if (window.confirm('Deseja restaurar as configurações padrão?')) {
      atualizarPreferencias({
        fontFamily: 'Verdana',
        fontSize: '10pt',
        tema: 'claro',
        logo: null
      });
      setPreviewLogo(null);
      setLogoFile(null);
      alert('Configurações restauradas!');
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <div className="card">
          <h2>Configurações e Personalização</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
            Personalize a aparência do sistema de acordo com suas preferências
          </p>

          <div className="config-section">
            <h3>👤 Usuário</h3>
            <div className="info-box">
              <p><strong>Nome:</strong> {usuario?.nome}</p>
              <p><strong>E-mail:</strong> {usuario?.email}</p>
              <p><strong>Perfil:</strong> {usuario?.perfil?.toUpperCase()}</p>
            </div>
          </div>

          <div className="config-section">
            <h3>🔤 Fonte</h3>
            <div className="config-grid">
              <div className="form-group">
                <label>Família da Fonte</label>
                <select
                  className="form-control"
                  value={preferencias.fontFamily}
                  onChange={handleFonteChange}
                >
                  {fontes.map(fonte => (
                    <option key={fonte} value={fonte}>{fonte}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tamanho da Fonte</label>
                <select
                  className="form-control"
                  value={preferencias.fontSize}
                  onChange={handleTamanhoFonteChange}
                >
                  {tamanhosFonte.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="preview-box">
              <strong>Pré-visualização:</strong>
              <p style={{ 
                fontFamily: preferencias.fontFamily, 
                fontSize: preferencias.fontSize,
                marginTop: '10px'
              }}>
                Este é um exemplo de texto com a fonte selecionada. Teste diferentes tamanhos para encontrar o ideal para você.
              </p>
            </div>
          </div>

          <div className="config-section">
            <h3>🎨 Tema</h3>
            <div className="form-group">
              <select
                className="form-control"
                value={preferencias.tema}
                onChange={handleTemaChange}
              >
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
              </select>
              <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                O tema escuro será implementado em breve
              </small>
            </div>
          </div>

          <div className="config-section">
            <h3>🖼️ Logo da Empresa</h3>
            <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '15px' }}>
              A logo será exibida nos relatórios impressos e no topo do sistema
            </p>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 200px' }}>
                {previewLogo ? (
                  <div className="logo-preview" style={{ 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <img 
                      src={previewLogo} 
                      alt="Logo Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '150px',
                        objectFit: 'contain',
                        marginBottom: '10px'
                      }} 
                    />
                    <button 
                      className="btn btn-danger btn-small" 
                      onClick={removerLogo}
                      style={{ marginTop: '10px' }}
                    >
                      🗑️ Remover
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    padding: '40px 15px', 
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                    color: '#999'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🖼️</div>
                    <div>Nenhuma logo</div>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div className="form-group">
                  <label>Selecione a Logo (PNG, JPG - Máx 2MB)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoChange}
                  />
                </div>

                {logoFile && (
                  <button 
                    className="btn btn-success" 
                    onClick={salvarLogo} 
                    style={{ marginTop: '10px' }}
                    disabled={salvandoLogo}
                  >
                    {salvandoLogo ? '💾 Salvando...' : '💾 Salvar Logo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3>🎨 Cores do Sistema</h3>
            <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '15px' }}>
              Personalize as cores do tema para deixar o sistema com a identidade visual da sua empresa
            </p>
            
            <div className="config-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="form-group">
                <label>Cor Primária (Cabeçalhos, Botões)</label>
                <input
                  type="color"
                  className="form-control"
                  value={preferencias.corPrimaria || '#2c3e50'}
                  onChange={(e) => atualizarPreferencias({ corPrimaria: e.target.value })}
                  style={{ height: '50px', cursor: 'pointer' }}
                />
                <small style={{ color: '#7f8c8d' }}>{preferencias.corPrimaria || '#2c3e50'}</small>
              </div>

              <div className="form-group">
                <label>Cor Secundária (Links, Destaques)</label>
                <input
                  type="color"
                  className="form-control"
                  value={preferencias.corSecundaria || '#3498db'}
                  onChange={(e) => atualizarPreferencias({ corSecundaria: e.target.value })}
                  style={{ height: '50px', cursor: 'pointer' }}
                />
                <small style={{ color: '#7f8c8d' }}>{preferencias.corSecundaria || '#3498db'}</small>
              </div>

              <div className="form-group">
                <label>Cor de Sucesso</label>
                <input
                  type="color"
                  className="form-control"
                  value={preferencias.corSucesso || '#27ae60'}
                  onChange={(e) => atualizarPreferencias({ corSucesso: e.target.value })}
                  style={{ height: '50px', cursor: 'pointer' }}
                />
                <small style={{ color: '#7f8c8d' }}>{preferencias.corSucesso || '#27ae60'}</small>
              </div>

              <div className="form-group">
                <label>Cor de Alerta</label>
                <input
                  type="color"
                  className="form-control"
                  value={preferencias.corAlerta || '#f39c12'}
                  onChange={(e) => atualizarPreferencias({ corAlerta: e.target.value })}
                  style={{ height: '50px', cursor: 'pointer' }}
                />
                <small style={{ color: '#7f8c8d' }}>{preferencias.corAlerta || '#f39c12'}</small>
              </div>

              <div className="form-group">
                <label>Cor de Perigo</label>
                <input
                  type="color"
                  className="form-control"
                  value={preferencias.corPerigo || '#e74c3c'}
                  onChange={(e) => atualizarPreferencias({ corPerigo: e.target.value })}
                  style={{ height: '50px', cursor: 'pointer' }}
                />
                <small style={{ color: '#7f8c8d' }}>{preferencias.corPerigo || '#e74c3c'}</small>
              </div>
            </div>

            <div className="preview-box" style={{ marginTop: '20px' }}>
              <strong>Pré-visualização das Cores:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                <button className="btn btn-primary" style={{ backgroundColor: preferencias.corPrimaria }}>Primária</button>
                <button className="btn btn-info" style={{ backgroundColor: preferencias.corSecundaria }}>Secundária</button>
                <button className="btn btn-success" style={{ backgroundColor: preferencias.corSucesso }}>Sucesso</button>
                <button className="btn btn-warning" style={{ backgroundColor: preferencias.corAlerta }}>Alerta</button>
                <button className="btn btn-danger" style={{ backgroundColor: preferencias.corPerigo }}>Perigo</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-success" 
                onClick={salvarCores} 
                disabled={salvandoCores}
              >
                {salvandoCores ? '💾 Salvando...' : '💾 Salvar Cores'}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={restaurarCoresPadrao}
              >
                🔄 Restaurar Cores Padrão
              </button>
            </div>
          </div>

          <div className="config-actions">
            <button className="btn btn-secondary" onClick={restaurarPadroes}>
              Restaurar Padrões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
