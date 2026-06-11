import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, User, Mail, Shield, Key } from 'lucide-react';

interface PerfilItem {
  id: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'operario' | 'tecnico';
  created_at: string;
}

export const Usuarios = () => {
  const { profile: currentUserProfile } = useAuth();
  const [usuarios, setUsuarios] = useState<PerfilItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'tecnico' as 'administrador' | 'operario' | 'tecnico',
    password: ''
  });

  const fetchUsuarios = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setDbError(error.message);
        console.error(error);
      } else if (data) {
        setUsuarios(data as PerfilItem[]);
      }
    } catch (err: any) {
      setDbError(err.message || 'Error al conectar con el servidor.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) {
      alert('Nombre y correo electrónico son obligatorios.');
      return;
    }

    if (!editingId && !formData.password) {
      alert('La contraseña es obligatoria al crear un nuevo usuario.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Actualizar usuario
        const { error } = await supabase.rpc('actualizar_usuario_taller', {
          p_user_id: editingId,
          p_email: formData.email.trim(),
          p_password: formData.password || null, // Si está vacía se envía null para no modificarla
          p_nombre: formData.nombre.trim(),
          p_rol: formData.rol
        });

        if (error) {
          alert('Error al actualizar usuario: ' + error.message);
        } else {
          setIsModalOpen(false);
          fetchUsuarios();
        }
      } else {
        // Crear nuevo usuario
        const { error } = await supabase.rpc('crear_usuario_taller', {
          p_email: formData.email.trim(),
          p_password: formData.password,
          p_nombre: formData.nombre.trim(),
          p_rol: formData.rol
        });

        if (error) {
          alert('Error al crear usuario: ' + error.message);
        } else {
          setIsModalOpen(false);
          fetchUsuarios();
        }
      }
    } catch (err: any) {
      alert('Error en la llamada: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (id === currentUserProfile?.id) {
      alert('No puedes eliminar tu propio usuario actual con el que tienes sesión iniciada.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      setLoading(true);
      try {
        const { error } = await supabase.rpc('eliminar_usuario_taller', {
          p_user_id: id
        });
        
        if (error) {
          alert('Error al eliminar usuario: ' + error.message);
        } else {
          fetchUsuarios();
        }
      } catch (err: any) {
        alert('Error en la llamada: ' + err.message);
      }
      setLoading(false);
    }
  };

  const openModal = (user?: PerfilItem) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        password: '' // Campo vacío para que no cambie la contraseña por defecto
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        email: '',
        rol: 'tecnico',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Administrador</span>;
      case 'operario':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">Operario</span>;
      case 'tecnico':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Técnico</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400">{rol}</span>;
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.rol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-semibold text-sm"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar usuario por nombre, email o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && usuarios.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Cargando usuarios...</td></tr>
              ) : dbError ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-destructive font-medium bg-destructive/10">Error al cargar usuarios: {dbError}</td></tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No se encontraron usuarios.</td></tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />
                      <span>{u.nombre}</span>
                      {u.id === currentUserProfile?.id && (
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-1">Tú</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-zinc-600" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRolBadge(u.rol)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(u)}
                        className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.nombre)}
                        disabled={u.id === currentUserProfile?.id}
                        className={`p-2 rounded-md transition-colors ${
                          u.id === currentUserProfile?.id 
                            ? 'text-zinc-600 cursor-not-allowed opacity-40' 
                            : 'text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                        }`}
                        title={u.id === currentUserProfile?.id ? "No puedes eliminar tu propio usuario" : "Eliminar"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Usuario' : 'Nuevo Usuario del Taller'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input 
                  required 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" 
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select 
                  required
                  value={formData.rol} 
                  onChange={e => setFormData({...formData, rol: e.target.value as any})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="tecnico">Técnico (Solo ve OTs, Reportes e Inventario)</option>
                  <option value="operario">Operario (Ve clientes, vehículos, OTs, cotizaciones e inventario)</option>
                  <option value="administrador">Administrador (Control total)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Key size={14} className="text-muted-foreground" />
                  <span>{editingId ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</span>
                </label>
                <input 
                  required={!editingId}
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  placeholder={editingId ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                  minLength={6}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold transition-colors text-sm shadow-md disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
