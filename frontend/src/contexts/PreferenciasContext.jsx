import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const PreferenciasContext = createContext({});

export const PreferenciasProvider = ({ children }) => {
  const [preferencias, setPreferencias] = useState({
    fontFamily: 'Verdana',
    fontSize: '10pt',
    tema: 'claro',
    logo: null,
    corPrimaria: '#2c3e50',
    corSecundaria: '#3498db',
    corSucesso: '#27ae60',
    corAlerta: '#f39c12',
    corPerigo: '#e74c3c'
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const response = await api.get('/configuracoes');
      const config = response.data;
      
      const novasPrefs = {
        ...preferencias,
        logo: config.logo,
        corPrimaria: config.cor_primaria || '#2c3e50',
        corSecundaria: config.cor_secundaria || '#3498db',
        corSucesso: config.cor_sucesso || '#27ae60',
        corAlerta: config.cor_alerta || '#f39c12',
        corPerigo: config.cor_perigo || '#e74c3c'
      };
      
      setPreferencias(novasPrefs);
      aplicarPreferencias(novasPrefs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const atualizarPreferencias = (novasPreferencias) => {
    const prefsAtualizadas = { ...preferencias, ...novasPreferencias };
    setPreferencias(prefsAtualizadas);
    aplicarPreferencias(prefsAtualizadas);
  };

  const aplicarPreferencias = (prefs) => {
    document.documentElement.style.setProperty('--font-family', prefs.fontFamily);
    document.documentElement.style.setProperty('--font-size', prefs.fontSize);
    
    if (prefs.tema === 'escuro') {
      document.body.classList.add('tema-escuro');
    } else {
      document.body.classList.remove('tema-escuro');
    }
  };

  return (
    <PreferenciasContext.Provider value={{ preferencias, atualizarPreferencias, carregarConfiguracoes }}>
      {children}
    </PreferenciasContext.Provider>
  );
};

export const usePreferencias = () => {
  const context = useContext(PreferenciasContext);
  if (!context) {
    throw new Error('usePreferencias deve ser usado dentro de um PreferenciasProvider');
  }
  return context;
};
