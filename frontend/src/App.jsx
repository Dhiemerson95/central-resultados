import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PreferenciasProvider } from './contexts/PreferenciasContext';
import { useAplicarCores } from './hooks/useAplicarCores';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Exames from './pages/Exames';
import Empresas from './pages/Empresas';
import Clinicas from './pages/Clinicas';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import Permissoes from './pages/Permissoes';
import ConfigSMTP from './pages/ConfigSMTP';
import './App.css';

function AppContent() {
  useAplicarCores();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Exames />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas"
          element={
            <PrivateRoute>
              <Empresas />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinicas"
          element={
            <PrivateRoute>
              <Clinicas />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <Configuracoes />
            </PrivateRoute>
          }
        />
        <Route
          path="/permissoes"
          element={
            <PrivateRoute>
              <Permissoes />
            </PrivateRoute>
          }
        />
        <Route
          path="/smtp"
          element={
            <PrivateRoute>
              <ConfigSMTP />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <PreferenciasProvider>
        <AppContent />
      </PreferenciasProvider>
    </AuthProvider>
  );
}

export default App;
