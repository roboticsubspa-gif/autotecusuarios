import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, Car } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
}

interface Vehiculo {
  id: string;
  cliente_id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  clientes?: Cliente; // Para el join
}

export const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ cliente_id: '', patente: '', marca: '', modelo: '', anio: '' });

  const fetchVehiculos = async () => {
    setLoading(true);
    let query = supabase.from('vehiculos').select('*, clientes(id, nombre)').order('created_at', { ascending: false });
    
    if (search) {
      query = query.ilike('patente', `%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setVehiculos(data as any);
    }
    setLoading(false);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (data) setClientesList(data);
  };

  useEffect(() => {
    fetchVehiculos();
    fetchClientes();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      anio: parseInt(formData.anio) || new Date().getFullYear()
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('vehiculos').update(dataToSave).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('vehiculos').insert([dataToSave]);
      error = err;
    }

    if (error) {
      alert('Error al guardar vehículo: ' + error.message);
      console.error(error);
    } else {
      setIsModalOpen(false);
      fetchVehiculos();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar vehículo: ' + error.message);
        console.error(error);
      } else {
        fetchVehiculos();
      }
    }
  };

  const openModal = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setEditingId(vehiculo.id);
      setFormData({ 
        cliente_id: vehiculo.cliente_id, 
        patente: vehiculo.patente, 
        marca: vehiculo.marca || '', 
        modelo: vehiculo.modelo || '', 
        anio: vehiculo.anio?.toString() || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ cliente_id: clientesList.length > 0 ? clientesList[0].id : '', patente: '', marca: '', modelo: '', anio: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Car size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Vehículo
        </button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar vehículo por patente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Patente</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Marca</th>
                <th className="px-6 py-4 font-semibold">Modelo</th>
                <th className="px-6 py-4 font-semibold">Año</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Cargando vehículos...</td></tr>
              ) : vehiculos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No se encontraron vehículos.</td></tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium uppercase">{vehiculo.patente}</td>
                    <td className="px-6 py-4 text-primary font-medium">{vehiculo.clientes?.nombre}</td>
                    <td className="px-6 py-4">{vehiculo.marca}</td>
                    <td className="px-6 py-4">{vehiculo.modelo}</td>
                    <td className="px-6 py-4 text-muted-foreground">{vehiculo.anio}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(vehiculo)}
                        className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-md transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(vehiculo.id)}
                        className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-md transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente Propietario</label>
                <select 
                  required
                  value={formData.cliente_id} 
                  onChange={e => setFormData({...formData, cliente_id: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Seleccione un cliente</option>
                  {clientesList.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Patente</label>
                <input required type="text" value={formData.patente} onChange={e => setFormData({...formData, patente: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase" placeholder="XXYY12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marca</label>
                  <input type="text" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <input type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año</label>
                <input type="number" value={formData.anio} onChange={e => setFormData({...formData, anio: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
