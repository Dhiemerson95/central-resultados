import { useEffect } from 'react';
import { usePreferencias } from '../contexts/PreferenciasContext';

export const useAplicarCores = () => {
  const { preferencias } = usePreferencias();

  useEffect(() => {
    const root = document.documentElement;

    if (preferencias.corPrimaria) {
      root.style.setProperty('--cor-primaria', preferencias.corPrimaria);
    }

    if (preferencias.corSecundaria) {
      root.style.setProperty('--cor-secundaria', preferencias.corSecundaria);
    }

    if (preferencias.corSucesso) {
      root.style.setProperty('--cor-sucesso', preferencias.corSucesso);
    }

    if (preferencias.corAlerta) {
      root.style.setProperty('--cor-alerta', preferencias.corAlerta);
    }

    if (preferencias.corPerigo) {
      root.style.setProperty('--cor-perigo', preferencias.corPerigo);
    }
  }, [preferencias]);
};
