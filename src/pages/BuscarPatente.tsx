import { useState } from 'react';
import { 
  Search, Copy, ExternalLink, ClipboardCheck, 
  Check, AlertTriangle, Car, Fuel 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VehicleData {
  plate: string;
  dv: string | null;
  make: string;
  model: string;
  version: string;
  year: number;
  type: string;
  engine: string;
  engine_size: string;
  chassis: string;
  color: string;
  doors: number | null;
  transmission: string;
  kilometers: number;
  valuation: number | null;
  gas_type: string;
  owner: {
    fullname: string;
    documentNumber: string;
  };
  prt: {
    certificate: string;
    date: string;
    due_date: string;
    status: string;
    gases_due_date: string;
    gases_status: string;
    plant_code: string;
  } | null;
  source: string;
}

export const BuscarPatente = () => {
  const [patente, setPatente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatPatente = (val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patente || patente.length < 5) {
      setError('Ingresa una patente válida (mínimo 5 caracteres).');
      return;
    }

    setLoading(true);
    setError(null);
    setVehicle(null);

    try {
      // 1. Intentamos consultar a través de la función del servidor en Supabase (RPC) para evitar bloqueos de CORS del navegador
      const { data: resData, error: rpcError } = await supabase.rpc('buscar_patente_chile', { 
        patente_search: patente 
      });

      if (!rpcError && resData) {
        if (resData.status === 'error') {
          throw new Error(resData.message || 'Error en la consulta del servidor');
        }

        // Si el servidor del bot retornó una limitación de tasa (Rate Limit)
        if (resData.detail && resData.detail.toLowerCase().includes('rate limit')) {
          setError('Límite de consultas del bot alcanzado (máximo 1 por minuto). Por favor, espera 60 segundos o utiliza los portales externos de abajo.');
          setLoading(false);
          return;
        }

        if (resData.vehicle_data && resData.vehicle_data.status === 'success' && resData.vehicle_data.data) {
          setVehicle(resData.vehicle_data.data);
          setLoading(false);
          return;
        } else {
          setError('No se encontraron datos técnicos para esta patente. Puedes intentar en los portales externos.');
          setLoading(false);
          return;
        }
      }

      // 2. Si el RPC falla o no está creado en la base de datos, hacemos fallback a consulta directa
      console.warn('RPC no disponible, intentando conexión directa:', rpcError);
      const response = await fetch(`https://api.autoriesgo.cl/api/v1/report/lookup?patente=${patente}`);
      
      if (response.status === 429) {
        setError('Límite de consultas excedido (1 por minuto). Por favor, espera 60 segundos antes de buscar de nuevo.');
        setLoading(false);
        return;
      }

      if (response.status === 422) {
        setError('El formato de la patente es inválido. Verifica e intenta de nuevo.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo obtener la información.');
      }

      const directData = await response.json();
      
      if (directData.vehicle_data && directData.vehicle_data.status === 'success' && directData.vehicle_data.data) {
        setVehicle(directData.vehicle_data.data);
      } else {
        setError('No se encontraron datos técnicos para esta patente. Puedes intentar en los portales externos.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar de forma automática (CORS del navegador). Para activar la búsqueda directa desde tu app, ingresa al panel de Supabase y ejecuta el script de configuración en la consola SQL.');
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (url: string) => {
    const width = 1050;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Search size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscar Patente</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consulta automática de vehículos mediante bot integrado.
          </p>
        </div>
      </div>

      {/* Panel de Búsqueda */}
      <div className="bg-card/50 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
        <form onSubmit={handleSearch} className="max-w-md mx-auto text-center space-y-4">
          <label htmlFor="patente-input" className="block text-sm font-medium text-foreground">
            Ingresa la Patente del Vehículo
          </label>
          <div className="flex gap-2">
            <input
              id="patente-input"
              type="text"
              placeholder="AAAA12 o AA1234"
              value={patente}
              onChange={(e) => setPatente(formatPatente(e.target.value))}
              className="flex-1 text-center text-2xl font-bold tracking-widest uppercase py-3 px-4 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-normal placeholder:text-lg"
              maxLength={6}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !patente}
              className="px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={20} />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3 items-start">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold">Búsqueda no completada</p>
              <p className="mt-1 text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Resultados del Vehículo */}
        {vehicle && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Car className="text-primary" />
                <span>Datos Vehiculares para {patente}</span>
              </h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                Bot de búsqueda: Activo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bloque Ficha Técnica */}
              <div className="bg-background/40 border border-border/50 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Car size={16} /> Ficha Técnica
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Marca:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{vehicle.make || 'N/A'}</span>
                      {vehicle.make && (
                        <button onClick={() => handleCopy(vehicle.make, 'make')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          {copiedField === 'make' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Modelo:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{vehicle.model || 'N/A'}</span>
                      {vehicle.model && (
                        <button onClick={() => handleCopy(vehicle.model, 'model')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          {copiedField === 'model' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Año:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{vehicle.year || 'N/A'}</span>
                      {vehicle.year && (
                        <button onClick={() => handleCopy(String(vehicle.year), 'year')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          {copiedField === 'year' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Tipo de Vehículo:</span>
                    <span className="font-medium text-foreground text-right text-xs truncate max-w-[200px]" title={vehicle.type}>
                      {vehicle.type || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque Especificaciones */}
              <div className="bg-background/40 border border-border/50 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel size={16} /> Especificaciones
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Combustible:</span>
                    <span className="font-bold text-foreground">{vehicle.gas_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">N° Motor:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-foreground">{vehicle.engine || 'N/A'}</span>
                      {vehicle.engine && (
                        <button onClick={() => handleCopy(vehicle.engine, 'engine')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          {copiedField === 'engine' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">N° Chasis (VIN):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-foreground">{vehicle.chassis || 'N/A'}</span>
                      {vehicle.chassis && (
                        <button onClick={() => handleCopy(vehicle.chassis, 'chassis')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          {copiedField === 'chassis' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Kilometraje (PRT):</span>
                    <span className="font-bold text-foreground">
                      {vehicle.kilometers ? `${vehicle.kilometers.toLocaleString('es-CL')} km` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque Revisión Técnica (PRT) */}
            {vehicle.prt && (
              <div className="bg-background/40 border border-border/50 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck size={16} /> Estado de Revisión Técnica (PRT)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-card/30 border border-border/30 rounded-lg flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado Técnico</span>
                    <span className={`mt-1 font-bold text-sm ${vehicle.prt.status === 'A' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {vehicle.prt.status === 'A' ? 'APROBADO' : 'RECHAZADO / VENCIDO'}
                    </span>
                  </div>
                  <div className="p-3 bg-card/30 border border-border/30 rounded-lg flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Última Inspección</span>
                    <span className="mt-1 font-bold text-sm text-foreground">{vehicle.prt.date || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-card/30 border border-border/30 rounded-lg flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Próximo Vencimiento</span>
                    <span className="mt-1 font-bold text-sm text-foreground">{vehicle.prt.due_date || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección de Portales Externos (Fallback) */}
        <div className="space-y-4 pt-4 border-t border-border/30">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              ¿No encontraste lo que buscabas o excediste el límite?
            </h3>
            <p className="text-xs text-muted-foreground">
              Puedes abrir los portales externos en ventanas emergentes para realizar búsquedas avanzadas manualmente.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => openPopup('https://www.patentechile.com')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>PatenteChile</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={() => openPopup('https://www.autoseguro.gob.cl')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>Auto Seguro</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={() => openPopup('https://www.prt.cl')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>PRT.cl</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={() => openPopup('https://www.registrocivil.cl')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <span>Reg. Civil</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
