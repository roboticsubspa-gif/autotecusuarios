import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, Wrench, CheckCircle, Clock, Eye, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OrdenTrabajoPDF, ListaOrdenesTrabajoPDF } from '../components/PDFDocuments';

interface Vehiculo {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio?: number;
  clientes?: { 
    nombre: string;
    rut?: string;
    correo?: string;
    telefono?: string;
  };
}

interface OrdenTrabajo {
  id: string;
  numero_secuencial?: number;
  vehiculo_id: string;
  estado: string;
  descripcion: string;
  created_at: string;
  vehiculos?: Vehiculo;
}

export const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [vehiculosList, setVehiculosList] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    vehiculo_id: '', 
    estado: 'Abierta', 
    descripcion: '' 
  });

  // Modal para ver detalles
  const [selectedOrdenForView, setSelectedOrdenForView] = useState<OrdenTrabajo | null>(null);

  const fetchOrdenes = async () => {
    setLoading(true);
    let query = supabase
      .from('ordenes_trabajo')
      .select('*, vehiculos(id, patente, marca, modelo, anio, clientes(nombre, rut, correo, telefono))')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data) {
      // Filtrado simple en cliente o patente
      const filtered = search ? data.filter((o: any) => 
        o.vehiculos?.patente?.toLowerCase().includes(search.toLowerCase()) || 
        o.vehiculos?.clientes?.nombre?.toLowerCase().includes(search.toLowerCase())
      ) : data;
      setOrdenes(filtered as any);
    }
    setLoading(false);
  };

  const fetchVehiculos = async () => {
    const { data } = await supabase.from('vehiculos').select('id, patente, marca, modelo, clientes(nombre)').order('patente');
    if (data) setVehiculosList(data as any);
  };

  useEffect(() => {
    fetchOrdenes();
    fetchVehiculos();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let error;
    if (editingId) {
      const { error: err } = await supabase.from('ordenes_trabajo').update(formData).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('ordenes_trabajo').insert([formData]);
      error = err;
    }

    if (error) {
      alert('Error al guardar orden de trabajo: ' + error.message);
      console.error(error);
    } else {
      setIsModalOpen(false);
      fetchOrdenes();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden de trabajo?')) {
      const { error } = await supabase.from('ordenes_trabajo').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar orden de trabajo: ' + error.message);
        console.error(error);
      } else {
        fetchOrdenes();
      }
    }
  };

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase.from('ordenes_trabajo').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
      alert('Error al cambiar el estado de la orden: ' + error.message);
      console.error(error);
    } else {
      fetchOrdenes();
    }
  };

  const openModal = (orden?: OrdenTrabajo) => {
    if (orden) {
      setEditingId(orden.id);
      setFormData({ 
        vehiculo_id: orden.vehiculo_id, 
        estado: orden.estado, 
        descripcion: orden.descripcion 
      });
    } else {
      setEditingId(null);
      setFormData({ vehiculo_id: vehiculosList.length > 0 ? vehiculosList[0].id : '', estado: 'Abierta', descripcion: '' });
    }
    setIsModalOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Abierta':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 flex items-center gap-1 w-max"><Wrench size={14}/> Abierta</span>;
      case 'En Progreso':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 flex items-center gap-1 w-max"><Clock size={14}/> En Progreso</span>;
      case 'Cerrada':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 flex items-center gap-1 w-max"><CheckCircle size={14}/> Cerrada</span>;
      default:
        return <span>{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Wrench size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
        </div>
        <div className="flex gap-3">
          <PDFDownloadLink
            document={<ListaOrdenesTrabajoPDF list={ordenes} />}
            fileName={`Reporte-OTs-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-border shadow-sm text-sm font-medium"
          >
            {({ loading }) => (
              <>
                <Download size={18} />
                <span>{loading ? 'Generando...' : 'Exportar Todo'}</span>
              </>
            )}
          </PDFDownloadLink>
          <button 
            onClick={() => openModal()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={20} />
            Nueva Orden
          </button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar por patente o cliente..."
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
                <th className="px-6 py-4 font-semibold">ID / Fecha</th>
                <th className="px-6 py-4 font-semibold">Cliente y Vehículo</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Cargando órdenes...</td></tr>
              ) : ordenes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No se encontraron órdenes de trabajo.</td></tr>
              ) : (
                ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      <div className="font-mono text-xs font-bold">OT-{orden.numero_secuencial}</div>
                      <div className="text-xs">{new Date(orden.created_at).toLocaleDateString('es-CL')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary">{orden.vehiculos?.clientes?.nombre}</div>
                      <div className="text-muted-foreground text-xs uppercase">{orden.vehiculos?.patente} - {orden.vehiculos?.marca} {orden.vehiculos?.modelo}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getEstadoBadge(orden.estado)}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={orden.descripcion}>
                      {orden.descripcion}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {orden.estado !== 'Cerrada' && (
                        <select 
                          className="bg-background border border-border text-xs rounded p-1 mr-2 cursor-pointer align-middle"
                          value={orden.estado}
                          onChange={(e) => handleChangeEstado(orden.id, e.target.value)}
                        >
                          <option value="Abierta">Abierta</option>
                          <option value="En Progreso">En Progreso</option>
                          <option value="Cerrada">Cerrada</option>
                        </select>
                      )}
                      
                      <button 
                        onClick={() => setSelectedOrdenForView(orden)}
                        className="text-indigo-500 hover:text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-md transition-colors inline-block align-middle"
                        title="Ver Detalles"
                      >
                        <Eye size={18} />
                      </button>

                      <PDFDownloadLink 
                        document={<OrdenTrabajoPDF orden={orden} />} 
                        fileName={`OT-${orden.numero_secuencial}.pdf`}
                        className="text-green-500 hover:text-green-400 p-2 hover:bg-green-500/10 rounded-md transition-colors inline-block align-middle"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </PDFDownloadLink>

                      <button 
                        onClick={() => openModal(orden)}
                        className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-md transition-colors inline-block align-middle"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(orden.id)}
                        className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-md transition-colors inline-block align-middle"
                        title="Eliminar"
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

      {/* Modal Ver Detalles */}
      {selectedOrdenForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Wrench className="text-primary" size={20} />
                <span>Detalle de Orden de Trabajo</span>
              </h2>
              <button 
                onClick={() => setSelectedOrdenForView(null)} 
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* ID, Fecha, Estado */}
              <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border pb-3">
                <div>Nº OT: <span className="font-mono font-semibold text-foreground uppercase">OT-{selectedOrdenForView.numero_secuencial}</span></div>
                <div>Fecha: <span className="font-semibold text-foreground">{new Date(selectedOrdenForView.created_at).toLocaleDateString('es-CL')}</span></div>
                <div>Estado: {getEstadoBadge(selectedOrdenForView.estado)}</div>
              </div>

              {/* Datos Cliente */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Datos del Cliente</h3>
                <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">Nombre</span>
                    <span className="font-medium text-foreground">{selectedOrdenForView.vehiculos?.clientes?.nombre || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">RUT</span>
                    <span className="font-medium text-foreground">{selectedOrdenForView.vehiculos?.clientes?.rut || 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground block">Correo</span>
                    <span className="font-medium text-foreground break-all">{selectedOrdenForView.vehiculos?.clientes?.correo || 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground block">Teléfono</span>
                    <span className="font-medium text-foreground">{selectedOrdenForView.vehiculos?.clientes?.telefono || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Datos Vehículo */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Datos del Vehículo</h3>
                <div className="grid grid-cols-3 gap-2 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">Patente</span>
                    <span className="font-medium text-foreground uppercase">{selectedOrdenForView.vehiculos?.patente || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Marca / Modelo</span>
                    <span className="font-medium text-foreground">{selectedOrdenForView.vehiculos?.marca} {selectedOrdenForView.vehiculos?.modelo}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Año</span>
                    <span className="font-medium text-foreground">{selectedOrdenForView.vehiculos?.anio || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Trabajo Solicitado / Diagnóstico</h3>
                <div className="bg-muted/20 p-4 rounded-lg border border-border max-h-40 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{selectedOrdenForView.descripcion}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/10">
              <button 
                onClick={() => setSelectedOrdenForView(null)} 
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors text-sm"
              >
                Cerrar
              </button>
              <PDFDownloadLink
                document={<OrdenTrabajoPDF orden={selectedOrdenForView} />}
                fileName={`OT-${selectedOrdenForView.numero_secuencial}.pdf`}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors text-sm flex items-center gap-2"
              >
                {({ loading }) => (
                  <>
                    <Download size={16} />
                    <span>{loading ? 'Generando...' : 'Descargar PDF'}</span>
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Orden' : 'Nueva Orden de Trabajo'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehículo</label>
                <select 
                  required
                  value={formData.vehiculo_id} 
                  onChange={e => setFormData({...formData, vehiculo_id: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Seleccione un vehículo</option>
                  {vehiculosList.map(v => (
                    <option key={v.id} value={v.id}>{v.patente.toUpperCase()} - {v.clientes?.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select 
                  required
                  value={formData.estado} 
                  onChange={e => setFormData({...formData, estado: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Abierta">Abierta</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción del Problema</label>
                <textarea 
                  required 
                  rows={4}
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                  placeholder="Detalle el problema o trabajo a realizar..."
                />
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
