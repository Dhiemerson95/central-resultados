import { createContext, useState, useContext, useEffect } from 'react';

const PreferenciasContext = createContext({});

export const PreferenciasProvider = ({ children }) => {
  const [preferencias, setPreferencias] = useState({
    fontFamily: 'Verdana',
    fontSize: '10pt',
    tema: 'claro',
    logo: null
  });

  useEffect(() => {
    const preferenciasLocalStorage = localStorage.getItem('preferencias');
    if (preferenciasLocalStorage) {
      setPreferencias(JSON.parse(preferenciasLocalStorage));
    }
  }, []);

  const atualizarPreferencias = (novasPreferencias) => {
    const prefsAtualizadas = { ...preferencias, ...novasPreferencias };
    setPreferencias(prefsAtualizadas);
    localStorage.setItem('preferencias', JSON.stringify(prefsAtualizadas));
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

  useEffect(() => {
    aplicarPreferencias(preferencias);
  }, [preferencias]);

  return (
    <PreferenciasContext.Provider value={{ preferencias, atualizarPreferencias }}>
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
