import { useState } from 'react';
import { Search, Copy, ExternalLink, ShieldCheck, ClipboardCheck, FileText, Check } from 'lucide-react';

export const BuscarPatente = () => {
  const [patente, setPatente] = useState('');
  const [copied, setCopied] = useState(false);

  const formatPatente = (val: string) => {
    // Limpia y convierte a mayúsculas, máx 6 caracteres para patentes chilenas
    return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  };

  const handleCopy = () => {
    if (!patente) return;
    navigator.clipboard.writeText(patente);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPopup = (url: string) => {
    // Abre una ventana emergente (popup) en el centro de la pantalla
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

  const portals = [
    {
      name: 'PatenteChile.com',
      description: 'Buscador general de vehículos. Obtén marca, modelo, año, número de motor y chasis.',
      url: 'https://www.patentechile.com',
      color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
      badgeColor: 'bg-blue-500/10 text-blue-400',
      icon: Search,
    },
    {
      name: 'Auto Seguro (Carabineros)',
      description: 'Verifica si el vehículo cuenta con algún encargo por robo vigente.',
      url: 'https://www.autoseguro.gob.cl',
      color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
      icon: ShieldCheck,
    },
    {
      name: 'Plantas de Revisión Técnica (PRT)',
      description: 'Consulta el historial de revisiones técnicas del vehículo y sus kilometrajes.',
      url: 'https://www.prt.cl',
      color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 hover:border-amber-500/60',
      badgeColor: 'bg-amber-500/10 text-amber-400',
      icon: ClipboardCheck,
    },
    {
      name: 'Registro Civil (Oficial)',
      description: 'Acceso directo para adquirir el Certificado de Anotaciones Vigentes oficial.',
      url: 'https://www.registrocivil.cl',
      color: 'from-purple-600/20 to-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
      badgeColor: 'bg-purple-500/10 text-purple-400',
      icon: FileText,
    }
  ];

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
            Consulta rápida de vehículos en portales oficiales y bases de datos de Chile.
          </p>
        </div>
      </div>

      {/* Tarjeta Principal del Buscador */}
      <div className="bg-card/50 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
        <div className="max-w-md mx-auto text-center space-y-3">
          <label htmlFor="patente-input" className="block text-sm font-medium text-foreground">
            Ingresa la Patente del Vehículo
          </label>
          <div className="flex gap-2 justify-center items-center">
            <div className="relative flex-1">
              <input
                id="patente-input"
                type="text"
                placeholder="AAAA12 o AA1234"
                value={patente}
                onChange={(e) => setPatente(formatPatente(e.target.value))}
                className="w-full text-center text-2xl font-bold tracking-widest uppercase py-3 px-4 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-normal placeholder:text-lg"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleCopy}
              disabled={!patente}
              title="Copiar patente al portapapeles"
              className={`p-4 rounded-xl border transition-all flex items-center justify-center ${
                patente 
                  ? 'border-border bg-background hover:bg-muted text-foreground' 
                  : 'border-border/40 bg-background/20 text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              {copied ? <Check className="text-emerald-500" size={20} /> : <Copy size={20} />}
            </button>
          </div>
          {patente && (
            <p className="text-xs text-emerald-500 font-medium animate-pulse flex items-center justify-center gap-1">
              Patente lista para copiar y pegar. Elige el portal de consulta abajo.
            </p>
          )}
        </div>

        {/* Grilla de Portales */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Selecciona el Portal de Consulta
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((portal) => {
              const IconComponent = portal.icon;
              return (
                <div
                  key={portal.name}
                  className={`flex flex-col justify-between p-5 rounded-xl border bg-gradient-to-br transition-all duration-300 ${portal.color}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${portal.badgeColor}`}>
                        Portal Externo
                      </span>
                      <IconComponent className="text-foreground/60" size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{portal.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{portal.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/20">
                    <button
                      onClick={() => openPopup(portal.url)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-xs transition-colors shadow-sm"
                    >
                      <span>Abrir y Buscar</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instrucciones de Ayuda */}
        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
          <p className="font-semibold text-foreground">💡 Instrucciones de uso rápido:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Escribe la patente del vehículo en el recuadro superior.</li>
            <li>Haz clic en el botón de copiar (icono de portapapeles) para guardarla en la memoria.</li>
            <li>Haz clic en <strong>"Abrir y Buscar"</strong> del portal que deseas consultar. Se abrirá una ventana flotante.</li>
            <li>Pega la patente directamente (<kbd className="px-1.5 py-0.5 rounded bg-muted-foreground/20 text-foreground font-mono">Ctrl + V</kbd>) en el campo de búsqueda de la página que se abrió.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
