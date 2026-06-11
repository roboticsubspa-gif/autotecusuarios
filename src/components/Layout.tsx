
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Car, 
  Wrench, 
  FileText, 
  Package,
  LogOut,
  ClipboardCheck,
  Menu,
  X,
  UserCog,
  Search
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  signOut: () => Promise<void>;
}

const Sidebar = ({ isOpen, onClose, signOut }: SidebarProps) => {
  const location = useLocation();
  const { profile } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['administrador', 'operario'] },
    { name: 'Clientes', path: '/clientes', icon: Users, roles: ['administrador', 'operario', 'tecnico'] },
    { name: 'Vehículos', path: '/vehiculos', icon: Car, roles: ['administrador', 'operario', 'tecnico'] },
    { name: 'Órdenes de Trabajo', path: '/ordenes', icon: Wrench, roles: ['administrador', 'operario', 'tecnico'] },
    { name: 'Reportes', path: '/reportes', icon: ClipboardCheck, roles: ['administrador', 'tecnico', 'operario'] },
    { name: 'Inventario', path: '/inventario', icon: Package, roles: ['administrador', 'operario'] },
    { name: 'Cotizaciones', path: '/cotizaciones', icon: FileText, roles: ['administrador', 'operario', 'tecnico'] },
    { name: 'Buscar Patente', path: '/buscar-patente', icon: Search, roles: ['administrador', 'operario', 'tecnico'] },
    { name: 'Usuarios', path: '/usuarios', icon: UserCog, roles: ['administrador'] },
  ];

  const filteredLinks = links.filter(link => {
    if (!profile) return false;
    return link.roles.includes(profile.rol);
  });

  return (
    <>
      {/* Mobile Backdrop Overlay (Fondo oscuro difuminado al abrir sidebar) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-secondary text-secondary-foreground flex flex-col h-screen border-r border-border z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 font-bold text-2xl tracking-wider text-primary flex justify-between items-center">
          <span>AUTOTEC</span>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={onClose} // Cierra el menú al hacer clic en móvil
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                    : 'hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export const Layout = () => {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar de Navegación */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        signOut={signOut} 
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Cabecera Móvil (Header con botón Hamburguesa) */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card text-card-foreground md:hidden">
          <h1 className="font-bold text-xl tracking-wider text-primary">AUTOTEC</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-muted rounded-md text-foreground transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Área del Contenido de la Página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
