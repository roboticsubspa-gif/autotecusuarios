import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';

interface InventarioItem {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
  costo_unitario: number;
  precio_venta: number;
}

export const Inventario = () => {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    codigo: '', 
    nombre: '', 
    stock: '', 
    costo_unitario: '', 
    precio_venta: '' 
  });

  const fetchInventario = async () => {
    setLoading(true);
    let query = supabase.from('inventario').select('*').order('nombre', { ascending: true });
    
    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventario();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      codigo: formData.codigo.trim() === '' ? null : formData.codigo.trim(),
      nombre: formData.nombre,
      stock: parseFloat(formData.stock) || 0,
      costo_unitario: parseFloat(formData.costo_unitario) || 0,
      precio_venta: parseFloat(formData.precio_venta) || 0,
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('inventario').update(dataToSave).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('inventario').insert([dataToSave]);
      error = err;
    }

    if (error) {
      alert('Error al guardar en inventario: ' + error.message);
      console.error(error);
    } else {
      setIsModalOpen(false);
      fetchInventario();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este insumo/repuesto?')) {
      const { error } = await supabase.from('inventario').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar insumo: ' + error.message);
        console.error(error);
      } else {
        fetchInventario();
      }
    }
  };

  const openModal = (item?: InventarioItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        codigo: item.codigo || '', 
        nombre: item.nombre, 
        stock: item.stock.toString(), 
        costo_unitario: item.costo_unitario.toString(), 
        precio_venta: item.precio_venta.toString() 
      });
    } else {
      setEditingId(null);
      setFormData({ codigo: '', nombre: '', stock: '0', costo_unitario: '0', precio_venta: '0' });
    }
    setIsModalOpen(true);
  };

  // Helper para formatear a moneda local
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Insumo
        </button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre..."
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
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Costo Unit.</th>
                <th className="px-6 py-4 font-semibold text-right">Precio Venta</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Cargando inventario...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No se encontraron insumos.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{item.codigo}</td>
                    <td className="px-6 py-4 font-medium">{item.nombre}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.stock <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{formatMoney(item.costo_unitario)}</td>
                    <td className="px-6 py-4 text-right font-medium text-primary">{formatMoney(item.precio_venta)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(item)}
                        className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-md transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
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
              <h2 className="text-xl font-bold">{editingId ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código (Opcional)</label>
                  <input type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input required type="number" step="0.01" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Costo Unitario</label>
                  <input required type="number" step="0.01" value={formData.costo_unitario} onChange={e => setFormData({...formData, costo_unitario: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Venta</label>
                  <input required type="number" step="0.01" value={formData.precio_venta} onChange={e => setFormData({...formData, precio_venta: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
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
