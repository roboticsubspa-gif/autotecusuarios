import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Trash2, ArrowLeft } from 'lucide-react';

export const NuevoReporte = () => {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    orden_id: '',
    descripcion_trabajo: '',
    cobro_mano_obra: 0,
  });

  const [insumosUsados, setInsumosUsados] = useState<{inventario_id: string, cantidad: number, precio_unitario: number, nombre: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Obtener OTs abiertas o en progreso
      const { data: oData, error: oError } = await supabase
        .from('ordenes_trabajo')
        .select('*, vehiculos(patente)')
        .neq('estado', 'Cerrada');
      
      if (oError) {
        console.error("Error cargando OTs activas en Reportes:", oError);
        setDbError(oError.message);
      } else if (oData) {
        setOrdenes(oData);
        setDbError(null);
      }

      // Obtener inventario
      const { data: iData, error: iError } = await supabase
        .from('inventario')
        .select('id, nombre, costo_unitario, precio_venta, stock')
        .gt('stock', 0);
      
      if (iError) {
        console.error("Error cargando inventario en Reportes:", iError);
      } else if (iData) {
        setInventario(iData);
      }
    };
    fetchData();
  }, []);

  const handleAddInsumo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = inventario.find(i => i.id === e.target.value);
    if (item) {
      setInsumosUsados([...insumosUsados, {
        inventario_id: item.id,
        cantidad: 1,
        precio_unitario: item.precio_venta,
        nombre: item.nombre
      }]);
    }
    e.target.value = ''; // reset select
  };

  const removeInsumo = (index: number) => {
    const newInsumos = [...insumosUsados];
    newInsumos.splice(index, 1);
    setInsumosUsados(newInsumos);
  };

  const updateInsumo = (index: number, field: string, value: number) => {
    const newInsumos = [...insumosUsados];
    (newInsumos[index] as any)[field] = value;
    setInsumosUsados(newInsumos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orden_id) {
      alert('Debe seleccionar una Orden de Trabajo.');
      return;
    }

    try {
      setLoading(true);

      // Calcular costos totales
      let costoInsumos = 0;
      let cobroInsumos = 0;

      insumosUsados.forEach(insumo => {
        const invItem = inventario.find(i => i.id === insumo.inventario_id);
        if (invItem) {
          costoInsumos += (invItem.costo_unitario * insumo.cantidad);
        }
        cobroInsumos += (insumo.precio_unitario * insumo.cantidad);
      });

      const cobroTotal = formData.cobro_mano_obra + cobroInsumos;
      const ganancia = cobroTotal - costoInsumos; // asumimos que mano de obra es 100% ganancia

      // 1. Insertar el reporte
      const { data: reporteData, error: reporteError } = await supabase.from('reportes_trabajo').insert([{
        orden_id: formData.orden_id,
        descripcion_trabajo: formData.descripcion_trabajo,
        costo_total: costoInsumos,
        cobro_total: cobroTotal,
        ganancia: ganancia
      }]).select('id').single();

      if (reporteError || !reporteData) {
        console.error('Error al insertar reporte:', reporteError);
        alert('Error al guardar el reporte: ' + (reporteError?.message || 'No se recibió respuesta de la base de datos'));
        setLoading(false);
        return;
      }

      // 2. Insertar insumos (esto disparará el trigger de descuento de inventario automáticamente)
      if (insumosUsados.length > 0) {
        const insumosToInsert = insumosUsados.map(ins => ({
          reporte_id: reporteData.id,
          inventario_id: ins.inventario_id,
          cantidad: ins.cantidad,
          precio_unitario: ins.precio_unitario
        }));

        const { error: insError } = await supabase.from('insumos_reporte').insert(insumosToInsert);
        
        if (insError) {
          console.error('Error al insertar insumos:', insError);
          alert('Error al guardar los insumos del reporte: ' + insError.message);
          setLoading(false);
          return;
        }
      }

      // El trigger en la BD ya habrá cerrado la OT.
      setLoading(false);
      navigate('/reportes');
    } catch (err: any) {
      console.error('Error de ejecución en handleSubmit:', err);
      alert('Error inesperado de ejecución: ' + (err.message || 'Error desconocido'));
      setLoading(false);
    }
  };

  const cobroParcialInsumos = insumosUsados.reduce((acc, curr) => acc + (curr.precio_unitario * curr.cantidad), 0);
  const granTotal = formData.cobro_mano_obra + cobroParcialInsumos;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/reportes')} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <ClipboardCheck size={32} className="text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Reporte de Trabajo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Info Principal */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 text-card-foreground">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Información de la Orden</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Orden de Trabajo Asociada</label>
              <select 
                required
                value={formData.orden_id} 
                onChange={e => setFormData({...formData, orden_id: e.target.value})} 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>Seleccione una OT Activa</option>
                {ordenes.map(o => (
                  <option key={o.id} value={o.id}>OT-{o.numero_secuencial} / {o.vehiculos?.patente}</option>
                ))}
              </select>
              {dbError && (
                <p className="text-red-500 text-xs mt-2 font-medium">Error de base de datos: {dbError}</p>
              )}
              {ordenes.length === 0 && !dbError && (
                <p className="text-amber-500 text-xs mt-2 font-medium">No se encontraron órdenes de trabajo activas (Abiertas o En Progreso).</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cobro por Mano de Obra (CLP)</label>
              <input 
                type="number" 
                value={formData.cobro_mano_obra || ''} 
                onChange={e => setFormData({...formData, cobro_mano_obra: Number(e.target.value)})} 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción del Trabajo Realizado</label>
            <textarea 
              required 
              rows={4}
              value={formData.descripcion_trabajo} 
              onChange={e => setFormData({...formData, descripcion_trabajo: e.target.value})} 
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
              placeholder="Detalle exactamente lo que se hizo..."
            />
          </div>
        </div>

        {/* Insumos */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h2 className="text-lg font-semibold">Insumos y Repuestos Utilizados</h2>
            <select 
              onChange={handleAddInsumo}
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>+ Agregar Insumo</option>
              {inventario.map(i => (
                <option key={i.id} value={i.id}>{i.nombre} (Stock: {i.stock})</option>
              ))}
            </select>
          </div>

          {insumosUsados.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No se han agregado insumos. Seleccione en el menú desplegable.</p>
          ) : (
            <div className="space-y-3">
              {insumosUsados.map((insumo, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="flex-1 font-medium">{insumo.nombre}</div>
                  <div className="w-24">
                    <label className="text-xs text-muted-foreground block mb-1">Cant.</label>
                    <input 
                      type="number" min="1" step="0.5"
                      value={insumo.cantidad}
                      onChange={e => updateInsumo(idx, 'cantidad', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border rounded focus:outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-muted-foreground block mb-1">Precio Unit.</label>
                    <input 
                      type="number"
                      value={insumo.precio_unitario}
                      onChange={e => updateInsumo(idx, 'precio_unitario', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border rounded focus:outline-none"
                    />
                  </div>
                  <div className="w-32 text-right">
                    <label className="text-xs text-muted-foreground block mb-1">Subtotal</label>
                    <div className="font-medium">{(insumo.cantidad * insumo.precio_unitario).toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</div>
                  </div>
                  <button type="button" onClick={() => removeInsumo(idx)} className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors mt-4 md:mt-0">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Insumos: {cobroParcialInsumos.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</p>
            <p className="text-sm text-muted-foreground">Mano de Obra: {(formData.cobro_mano_obra || 0).toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</p>
            <p className="text-2xl font-bold text-primary mt-1">Total a Cobrar: {granTotal.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'})}</p>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Finalizar y Cerrar OT'}
          </button>
        </div>
      </form>
    </div>
  );
};
