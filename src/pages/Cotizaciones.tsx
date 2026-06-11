import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, FileText, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CotizacionPDF, ListaCotizacionesPDF } from '../components/PDFDocuments';

interface Cotizacion {
  id: string;
  numero_secuencial?: number;
  cliente_id: string;
  vehiculo_id: string;
  descripcion: string;
  total: number;
  created_at: string;
  clientes?: { 
    nombre: string; 
    rut: string; 
    correo?: string; 
    telefono?: string; 
  };
  vehiculos?: { 
    patente: string; 
    marca?: string; 
    modelo?: string; 
    anio?: number; 
  };
}

export const Cotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [vehiculosList, setVehiculosList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchCliente, setSearchCliente] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    cliente_id: '', 
    vehiculo_id: '', 
    descripcion: '',
    total: ''
  });

  const fetchCotizaciones = async () => {
    setLoading(true);
    let query = supabase
      .from('cotizaciones')
      .select('*, clientes(nombre, rut, correo, telefono), vehiculos(patente, marca, modelo, anio)')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data) {
      const filtered = search ? data.filter((c: any) => 
        c.clientes?.nombre?.toLowerCase().includes(search.toLowerCase()) || 
        c.vehiculos?.patente?.toLowerCase().includes(search.toLowerCase())
      ) : data;
      setCotizaciones(filtered as any);
    }
    setLoading(false);
  };

  const fetchRelations = async () => {
    const { data: cData } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (cData) setClientesList(cData);

    const { data: vData } = await supabase.from('vehiculos').select('id, patente, cliente_id').order('patente');
    if (vData) setVehiculosList(vData);
  };

  useEffect(() => {
    fetchCotizaciones();
    fetchRelations();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      total: parseFloat(formData.total) || 0
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('cotizaciones').update(dataToSave).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('cotizaciones').insert([dataToSave]);
      error = err;
    }

    if (error) {
      alert('Error al guardar cotización: ' + error.message);
      console.error(error);
    } else {
      setIsModalOpen(false);
      fetchCotizaciones();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      const { error } = await supabase.from('cotizaciones').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar cotización: ' + error.message);
        console.error(error);
      } else {
        fetchCotizaciones();
      }
    }
  };

  const openModal = (cot?: Cotizacion) => {
    setSearchCliente('');
    if (cot) {
      setEditingId(cot.id);
      setFormData({ 
        cliente_id: cot.cliente_id || '', 
        vehiculo_id: cot.vehiculo_id || '', 
        descripcion: cot.descripcion,
        total: cot.total.toString()
      });
      const cli = clientesList.find(c => c.id === cot.cliente_id);
      if (cli) {
        setSearchCliente(cli.nombre);
      }
    } else {
      setEditingId(null);
      setFormData({ cliente_id: '', vehiculo_id: '', descripcion: '', total: '0' });
    }
    setIsModalOpen(true);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
        </div>
        <div className="flex gap-3">
          <PDFDownloadLink
            document={<ListaCotizacionesPDF list={cotizaciones} />}
            fileName={`Reporte-Cotizaciones-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`}
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
            Nueva Cotización
          </button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar por cliente o patente..."
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
                <th className="px-6 py-4 font-semibold">Nº / Fecha</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Vehículo</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold text-right">Total</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Cargando cotizaciones...</td></tr>
              ) : cotizaciones.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No se encontraron cotizaciones.</td></tr>
              ) : (
                cotizaciones.map((cot) => (
                  <tr key={cot.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-foreground">Nº {cot.numero_secuencial}</div>
                      <div className="text-xs">{new Date(cot.created_at).toLocaleDateString('es-CL')}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {cot.clientes?.nombre}
                    </td>
                    <td className="px-6 py-4 uppercase">
                      {cot.vehiculos?.patente}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={cot.descripcion}>
                      {cot.descripcion}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatMoney(cot.total)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <PDFDownloadLink 
                        document={<CotizacionPDF cotizacion={cot} />} 
                        fileName={`Cotizacion-${cot.numero_secuencial}.pdf`}
                        className="text-green-500 hover:text-green-400 p-2 hover:bg-green-500/10 rounded-md transition-colors inline-block"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </PDFDownloadLink>
                      <button 
                        onClick={() => openModal(cot)}
                        className="text-blue-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-md transition-colors inline-block"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cot.id)}
                        className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-md transition-colors inline-block"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Cotización' : 'Nueva Cotización'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar y seleccionar cliente..." 
                    value={searchCliente}
                    onChange={e => {
                      setSearchCliente(e.target.value);
                      setShowClienteDropdown(true);
                    }}
                    onFocus={() => setShowClienteDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClienteDropdown(false), 200)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  {showClienteDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {clientesList
                        .filter(c => c.nombre.toLowerCase().includes(searchCliente.toLowerCase()))
                        .map(c => (
                          <div 
                            key={c.id}
                            onClick={() => {
                              setFormData({...formData, cliente_id: c.id, vehiculo_id: ''});
                              setSearchCliente(c.nombre);
                              setShowClienteDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          >
                            {c.nombre}
                          </div>
                        ))}
                      {clientesList.filter(c => c.nombre.toLowerCase().includes(searchCliente.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-muted-foreground text-sm">No se encontraron resultados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehículo</label>
                <select 
                  required
                  value={formData.vehiculo_id} 
                  onChange={e => setFormData({...formData, vehiculo_id: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!formData.cliente_id}
                >
                  <option value="" disabled>Seleccione un vehículo</option>
                  {vehiculosList.filter(v => v.cliente_id === formData.cliente_id).map(v => (
                    <option key={v.id} value={v.id}>{v.patente.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  required 
                  rows={4}
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                  placeholder="Detalle de la cotización..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total (CLP)</label>
                <input required type="number" value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
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
