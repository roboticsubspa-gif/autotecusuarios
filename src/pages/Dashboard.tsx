import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Wrench, Users, Car } from 'lucide-react';

export const Dashboard = () => {
  const [periodoActivo, setPeriodoActivo] = useState('Mensual');
  const [stats, setStats] = useState({
    ganancias: 0,
    gananciaAnual: 0,
    gananciaMensual: 0,
    gananciaSemanal: 0,
    gananciaDiaria: 0,
    ordenesAbiertas: 0,
    clientes: 0,
    vehiculos: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Ganancias (suma de ganancias en reportes con su fecha de creación)
      const { data: reportes } = await supabase.from('reportes_trabajo').select('ganancia, created_at');
      
      const today = new Date();
      
      // Calcular el inicio de la semana actual (Lunes a las 00:00:00)
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      let totalGanancias = 0;
      let gananciaAnual = 0;
      let gananciaMensual = 0;
      let gananciaSemanal = 0;
      let gananciaDiaria = 0;

      reportes?.forEach((rep) => {
        const value = Number(rep.ganancia) || 0;
        const repDate = new Date(rep.created_at);

        // 1. Ganancia Histórica Total
        totalGanancias += value;

        // 2. Ganancia Anual (Año Calendario Actual)
        if (repDate.getFullYear() === today.getFullYear()) {
          gananciaAnual += value;
        }

        // 3. Ganancia Mensual (Mes Calendario Actual)
        if (repDate.getMonth() === today.getMonth() && repDate.getFullYear() === today.getFullYear()) {
          gananciaMensual += value;
        }

        // 4. Ganancia Semanal (Lunes de la semana en curso hasta hoy)
        if (repDate >= startOfWeek) {
          gananciaSemanal += value;
        }

        // 5. Ganancia Diaria (Hoy)
        if (
          repDate.getDate() === today.getDate() &&
          repDate.getMonth() === today.getMonth() &&
          repDate.getFullYear() === today.getFullYear()
        ) {
          gananciaDiaria += value;
        }
      });

      // OTs Abiertas/En Progreso
      const { count: otCount } = await supabase.from('ordenes_trabajo').select('*', { count: 'exact', head: true }).neq('estado', 'Cerrada');
      
      // Total Clientes
      const { count: clCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true });

      // Total Vehiculos
      const { count: vhCount } = await supabase.from('vehiculos').select('*', { count: 'exact', head: true });

      setStats({
        ganancias: totalGanancias,
        gananciaAnual,
        gananciaMensual,
        gananciaSemanal,
        gananciaDiaria,
        ordenesAbiertas: otCount || 0,
        clientes: clCount || 0,
        vehiculos: vhCount || 0
      });
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen financiero y rendimiento operativo del taller.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-card border border-border rounded-xl animate-pulse"></div>
          <div className="flex flex-col gap-4 h-64">
            <div className="flex-1 bg-card border border-border rounded-xl animate-pulse"></div>
            <div className="flex-1 bg-card border border-border rounded-xl animate-pulse"></div>
            <div className="flex-1 bg-card border border-border rounded-xl animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de Ganancias Detallado */}
          <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Resumen de Ganancias</h3>
                  <p className="text-xs text-muted-foreground">Desglose de ingresos netos del taller</p>
                </div>
              </div>
              
              {/* Selector de Período Activo */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg text-xs">
                {['Diario', 'Semanal', 'Mensual', 'Anual', 'Total'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodoActivo(period)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      periodoActivo === period 
                        ? 'bg-background text-foreground shadow-sm font-semibold' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Destacado del período seleccionado */}
              <div className="space-y-2 text-center md:text-left">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Ganancia {periodoActivo === 'Diario' ? 'de Hoy' : periodoActivo === 'Semanal' ? 'de esta Semana' : periodoActivo === 'Mensual' ? 'de este Mes' : periodoActivo === 'Anual' ? 'de este Año' : 'Acumulada Total'}
                </p>
                <h2 className="text-4xl font-extrabold text-green-500 tracking-tight transition-all">
                  {formatMoney(
                    periodoActivo === 'Diario' ? stats.gananciaDiaria :
                    periodoActivo === 'Semanal' ? stats.gananciaSemanal :
                    periodoActivo === 'Mensual' ? stats.gananciaMensual :
                    periodoActivo === 'Anual' ? stats.gananciaAnual : stats.ganancias
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">Cálculo en base a Mano de Obra y Repuestos vendidos</p>
              </div>
              
              {/* Mini Grilla comparativa */}
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">📅 Hoy:</span>
                  <span className="font-bold text-foreground">{formatMoney(stats.gananciaDiaria)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">🗓️ Esta Semana:</span>
                  <span className="font-bold text-foreground">{formatMoney(stats.gananciaSemanal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">📊 Este Mes:</span>
                  <span className="font-bold text-green-500">{formatMoney(stats.gananciaMensual)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">🏢 Este Año:</span>
                  <span className="font-bold text-foreground">{formatMoney(stats.gananciaAnual)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2 font-bold">
                  <span className="text-muted-foreground flex items-center gap-1.5">💼 Histórico Total:</span>
                  <span className="text-primary">{formatMoney(stats.ganancias)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas Secundarias en Columna */}
          <div className="flex flex-col gap-4">
            {/* OTs Activas */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm flex items-center gap-4 flex-1">
              <div className="p-3.5 rounded-full bg-blue-500/10 text-blue-500">
                <Wrench size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Órdenes Activas</p>
                <h3 className="text-xl font-extrabold mt-0.5">{stats.ordenesAbiertas}</h3>
                <p className="text-[10px] text-muted-foreground">Vehículos en proceso de servicio</p>
              </div>
            </div>

            {/* Clientes */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm flex items-center gap-4 flex-1">
              <div className="p-3.5 rounded-full bg-orange-500/10 text-orange-500">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Clientes Registrados</p>
                <h3 className="text-xl font-extrabold mt-0.5">{stats.clientes}</h3>
                <p className="text-[10px] text-muted-foreground">Clientes fidelizados en sistema</p>
              </div>
            </div>

            {/* Vehículos */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm flex items-center gap-4 flex-1">
              <div className="p-3.5 rounded-full bg-purple-500/10 text-purple-500">
                <Car size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Vehículos Registrados</p>
                <h3 className="text-xl font-extrabold mt-0.5">{stats.vehiculos}</h3>
                <p className="text-[10px] text-muted-foreground">Vehículos asociados a clientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 text-card-foreground">
          <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
          <p className="text-muted-foreground text-sm">Próximamente: Gráfico de ganancias mensuales.</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 text-card-foreground">
          <h3 className="text-lg font-bold mb-4">Órdenes Pendientes</h3>
          <p className="text-muted-foreground text-sm">Próximamente: Lista de OTs que requieren atención.</p>
        </div>
      </div>
    </div>
  );
};
