import { Search } from 'lucide-react';

export const BuscarPatente = () => {
  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Search size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscar Patente</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Consulta de patentes chilenas integradas desde PatenteChile.com</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <iframe 
          src="https://www.patentechile.com" 
          title="Buscador de Patentes Chile"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
