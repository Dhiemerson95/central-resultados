import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PreferenciasProvider } from './contexts/PreferenciasContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Exames from './pages/Exames';
import Empresas from './pages/Empresas';
import Clinicas from './pages/Clinicas';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PreferenciasProvider>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </PreferenciasProvider>
    </AuthProvider>
  );
}

export default App;
