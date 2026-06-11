import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Clientes } from './pages/Clientes';
import { Vehiculos } from './pages/Vehiculos';
import { Inventario } from './pages/Inventario';
import { OrdenesTrabajo } from './pages/OrdenesTrabajo';
import { ReportesTrabajo } from './pages/ReportesTrabajo';
import { NuevoReporte } from './pages/NuevoReporte';
import { Dashboard } from './pages/Dashboard';
import { Cotizaciones } from './pages/Cotizaciones';
import { Usuarios } from './pages/Usuarios';

// Componente para proteger rutas
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { session, profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white">Cargando...</div>;
  if (!session) return <Navigate to="/login" />;;
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.rol)) {
    // Si no tiene el rol permitido, redirigir a una ruta segura basada en su rol
    if (profile.rol === 'tecnico') return <Navigate to="/ordenes" replace />;
    if (profile.rol === 'operario') return <Navigate to="/clientes" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente inteligente para redirigir al entrar a la raíz "/"
const DashboardOrRedirect = () => {
  const { profile } = useAuth();
  if (profile?.rol === 'tecnico') {
    return <Navigate to="/ordenes" replace />;
  }
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardOrRedirect />} />
            
            <Route path="/clientes" element={
              <ProtectedRoute allowedRoles={['administrador', 'operario', 'tecnico']}><Clientes /></ProtectedRoute>
            } />
            <Route path="/vehiculos" element={
              <ProtectedRoute allowedRoles={['administrador', 'operario', 'tecnico']}><Vehiculos /></ProtectedRoute>
            } />
            <Route path="/inventario" element={
              <ProtectedRoute allowedRoles={['administrador', 'operario']}><Inventario /></ProtectedRoute>
            } />
            <Route path="/ordenes" element={
              <ProtectedRoute allowedRoles={['administrador', 'operario', 'tecnico']}><OrdenesTrabajo /></ProtectedRoute>
            } />
            <Route path="/reportes" element={
              <ProtectedRoute allowedRoles={['administrador', 'tecnico', 'operario']}><ReportesTrabajo /></ProtectedRoute>
            } />
            <Route path="/reportes/nuevo" element={
              <ProtectedRoute allowedRoles={['administrador', 'tecnico', 'operario']}><NuevoReporte /></ProtectedRoute>
            } />
            <Route path="/cotizaciones" element={
              <ProtectedRoute allowedRoles={['administrador', 'operario']}><Cotizaciones /></ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute allowedRoles={['administrador']}><Usuarios /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

