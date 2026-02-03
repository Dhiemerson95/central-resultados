import { useState } from 'react';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Configuracoes = () => {
  const { preferencias, atualizarPreferencias } = usePreferencias();
  const { usuario } = useAuth();
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(preferencias.logo);

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

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.post('/configuracoes/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      atualizarPreferencias({ logo: response.data.logo });
      alert('Logo atualizada com sucesso!');
      setLogoFile(null);
    } catch (error) {
      console.error('Erro ao salvar logo:', error);
      alert('Erro ao salvar logo: ' + (error.response?.data?.error || error.message));
    }
  };

  const removerLogo = () => {
    setPreviewLogo(null);
    setLogoFile(null);
    atualizarPreferencias({ logo: null });
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

            {previewLogo && (
              <div className="logo-preview">
                <img src={previewLogo} alt="Logo" />
                <button className="btn btn-danger btn-small" onClick={removerLogo}>
                  Remover Logo
                </button>
              </div>
            )}

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
              <button className="btn btn-success" onClick={salvarLogo}>
                Salvar Logo
              </button>
            )}
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
