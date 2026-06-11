import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardCheck, Trash2, Eye, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReporteTrabajoPDF, ListaReportesTrabajoPDF } from '../components/PDFDocuments';

interface InsumoReporte {
  id: string;
  cantidad: number;
  precio_unitario: number;
  inventario?: {
    nombre: string;
    codigo: string;
  };
}

interface Reporte {
  id: string;
  numero_secuencial?: number;
  orden_id: string;
  descripcion_trabajo: string;
  costo_total: number;
  cobro_total: number;
  ganancia: number;
  created_at: string;
  ordenes_trabajo?: {
    id: string;
    numero_secuencial?: number;
    descripcion: string;
    vehiculos?: {
      patente: string;
      marca: string;
      modelo: string;
      anio: number;
      clientes?: {
        nombre: string;
        rut: string;
        correo: string;
        telefono: string;
      }
    }
  };
  insumos_reporte?: InsumoReporte[];
}

export const ReportesTrabajo = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  // Modal de detalles
  const [selectedReporteForView, setSelectedReporteForView] = useState<Reporte | null>(null);

  const fetchReportes = async () => {
    setLoading(true);
    setDbError(null);
    let query = supabase
      .from('reportes_trabajo')
      .select(`
        *, 
        ordenes_trabajo(
          id, 
          numero_secuencial,
          descripcion, 
          vehiculos(
            patente, 
            marca, 
            modelo, 
            anio, 
            clientes(nombre, rut, correo, telefono)
          )
        ),
        insumos_reporte(
          id,
          cantidad,
          precio_unitario,
          inventario(nombre, codigo)
        )
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Error al cargar reportes:", error);
      setDbError(error.message);
    } else if (data) {
      const filtered = search ? data.filter((r: any) => 
        r.ordenes_trabajo?.vehiculos?.patente?.toLowerCase().includes(search.toLowerCase()) || 
        r.ordenes_trabajo?.vehiculos?.clientes?.nombre?.toLowerCase().includes(search.toLowerCase())
      ) : data;
      setReportes(filtered as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportes();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      const { error } = await supabase.from('reportes_trabajo').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar reporte: ' + error.message);
        console.error(error);
      } else {
        fetchReportes();
      }
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Trabajo</h1>
        </div>
        <div className="flex gap-3">
          <PDFDownloadLink
            document={<ListaReportesTrabajoPDF list={reportes} />}
            fileName={`Reporte-Ganancias-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`}
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
            onClick={() => navigate('/reportes/nuevo')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={20} />
            Crear Reporte
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
                <th className="px-6 py-4 font-semibold">Fecha / ID OT</th>
                <th className="px-6 py-4 font-semibold">Cliente y Vehículo</th>
                <th className="px-6 py-4 font-semibold text-right">Costo</th>
                <th className="px-6 py-4 font-semibold text-right">Cobro</th>
                <th className="px-6 py-4 font-semibold text-right">Ganancia</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Cargando reportes...</td></tr>
              ) : dbError ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-destructive font-medium bg-destructive/10">Error al cargar reportes: {dbError}</td></tr>
              ) : reportes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No se encontraron reportes.</td></tr>
              ) : (
                reportes.map((reporte) => (
                  <tr key={reporte.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      <div className="text-xs font-semibold text-foreground">RT-{reporte.numero_secuencial}</div>
                      <div className="text-xs">{new Date(reporte.created_at).toLocaleDateString('es-CL')}</div>
                      <div className="font-mono text-xs mt-1 font-bold">OT: {reporte.ordenes_trabajo?.numero_secuencial}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary">{reporte.ordenes_trabajo?.vehiculos?.clientes?.nombre}</div>
                      <div className="text-muted-foreground text-xs uppercase">{reporte.ordenes_trabajo?.vehiculos?.patente}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{formatMoney(reporte.costo_total)}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatMoney(reporte.cobro_total)}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-500">{formatMoney(reporte.ganancia)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedReporteForView(reporte)}
                        className="text-indigo-500 hover:text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-md transition-colors inline-block align-middle"
                        title="Ver Detalles"
                      >
                        <Eye size={18} />
                      </button>

                      <PDFDownloadLink 
                        document={<ReporteTrabajoPDF reporte={reporte} />} 
                        fileName={`Reporte-${reporte.numero_secuencial}.pdf`}
                        className="text-green-500 hover:text-green-400 p-2 hover:bg-green-500/10 rounded-md transition-colors inline-block align-middle"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </PDFDownloadLink>

                      <button 
                        onClick={() => handleDelete(reporte.id)}
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
      {selectedReporteForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardCheck className="text-primary" size={20} />
                <span>Detalle de Reporte de Trabajo</span>
              </h2>
              <button 
                onClick={() => setSelectedReporteForView(null)} 
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* ID, Fecha, Ref OT */}
              <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border pb-3">
                <div>Reporte Nº: <span className="font-mono font-semibold text-foreground uppercase">RT-{selectedReporteForView.numero_secuencial}</span></div>
                <div>Fecha: <span className="font-semibold text-foreground">{new Date(selectedReporteForView.created_at).toLocaleDateString('es-CL')}</span></div>
                <div>Ref. OT: <span className="font-mono font-semibold text-foreground uppercase">OT-{selectedReporteForView.ordenes_trabajo?.numero_secuencial}</span></div>
              </div>

              {/* Datos Cliente y Vehículo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Datos del Cliente</h3>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg border border-border space-y-1">
                    <div><span className="text-xs text-muted-foreground">Nombre:</span> <span className="font-medium text-foreground">{selectedReporteForView.ordenes_trabajo?.vehiculos?.clientes?.nombre || 'N/A'}</span></div>
                    <div><span className="text-xs text-muted-foreground">RUT:</span> <span className="font-medium text-foreground">{selectedReporteForView.ordenes_trabajo?.vehiculos?.clientes?.rut || 'N/A'}</span></div>
                    <div><span className="text-xs text-muted-foreground">Teléfono:</span> <span className="font-medium text-foreground">{selectedReporteForView.ordenes_trabajo?.vehiculos?.clientes?.telefono || 'N/A'}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Datos del Vehículo</h3>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg border border-border space-y-1">
                    <div><span className="text-xs text-muted-foreground">Patente:</span> <span className="font-medium text-foreground uppercase">{selectedReporteForView.ordenes_trabajo?.vehiculos?.patente || 'N/A'}</span></div>
                    <div><span className="text-xs text-muted-foreground">Marca/Modelo:</span> <span className="font-medium text-foreground">{selectedReporteForView.ordenes_trabajo?.vehiculos?.marca} {selectedReporteForView.ordenes_trabajo?.vehiculos?.modelo}</span></div>
                    <div><span className="text-xs text-muted-foreground">Año:</span> <span className="font-medium text-foreground">{selectedReporteForView.ordenes_trabajo?.vehiculos?.anio || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Descripción del Trabajo */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Descripción del Trabajo Realizado</h3>
                <div className="bg-muted/20 p-4 rounded-lg border border-border max-h-32 overflow-y-auto">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{selectedReporteForView.descripcion_trabajo}</p>
                </div>
              </div>

              {/* Insumos Utilizados */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">Insumos y Repuestos Utilizados</h3>
                <div className="border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2">Repuesto</th>
                        <th className="px-4 py-2 text-center">Cant.</th>
                        <th className="px-4 py-2 text-right">Precio Unit.</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {!selectedReporteForView.insumos_reporte || selectedReporteForView.insumos_reporte.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground italic">No se registraron insumos en este reporte.</td>
                        </tr>
                      ) : (
                        selectedReporteForView.insumos_reporte.map((insumo) => (
                          <tr key={insumo.id} className="hover:bg-muted/20">
                            <td className="px-4 py-2 font-medium">{insumo.inventario?.nombre || 'Insumo Eliminado'}</td>
                            <td className="px-4 py-2 text-center">{insumo.cantidad}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{formatMoney(insumo.precio_unitario)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatMoney(insumo.cantidad * insumo.precio_unitario)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="border-t border-border pt-4 flex flex-col items-end space-y-1 text-right">
                {(() => {
                  const totalInsumosFacturado = selectedReporteForView.insumos_reporte?.reduce((acc, curr) => acc + (curr.precio_unitario * curr.cantidad), 0) || 0;
                  const manoObra = Math.max(0, selectedReporteForView.cobro_total - totalInsumosFacturado);
                  return (
                    <>
                      <div className="text-xs text-muted-foreground">
                        Mano de Obra: <span className="font-semibold text-foreground">{formatMoney(manoObra)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Insumos (Venta): <span className="font-semibold text-foreground">{formatMoney(totalInsumosFacturado)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground border-b border-border pb-1">
                        Costo Real Insumos (Compra): <span className="font-semibold text-red-500">{formatMoney(selectedReporteForView.costo_total)}</span>
                      </div>
                      <div className="text-base font-bold pt-2 w-56 flex justify-between">
                        <span className="text-muted-foreground">Total Cobrado:</span>
                        <span className="text-primary">{formatMoney(selectedReporteForView.cobro_total)}</span>
                      </div>
                      <div className="text-sm font-bold w-56 flex justify-between text-green-500">
                        <span>Ganancia Neta:</span>
                        <span>{formatMoney(selectedReporteForView.ganancia)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/10">
              <button 
                onClick={() => setSelectedReporteForView(null)} 
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors text-sm"
              >
                Cerrar
              </button>
              <PDFDownloadLink
                document={<ReporteTrabajoPDF reporte={selectedReporteForView} />}
                fileName={`Reporte-${selectedReporteForView.numero_secuencial}.pdf`}
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
    </div>
  );
};
