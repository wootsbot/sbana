import { X, Cpu, Info, Check, Sparkles, Database, FileText } from "lucide-react";
import { useState } from "react";
import { AppItem } from "../data";

interface DetailModalProps {
  app: AppItem | null;
  onClose: () => void;
}

/**
 * [Organism] Modal de Detalle de Aplicación
 * Presenta métricas detalladas a nivel de base de datos e infraestructura para la solución seleccionada.
 */
export const DetailModal = ({ app, onClose }: DetailModalProps) => {
  const [notif, setNotif] = useState<string | null>(null);

  if (!app) return null;

  const triggerNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  // Safe mock calculations for deep infrastructure stats
  const licenciasAsignadas = Math.round(app.usageCount * 1.45);
  const throughputPromedio = (app.usageCount / 120).toFixed(2);
  const scoreSalud = Math.round(Math.min(100, 78 + (app.percentage % 20)));

  return (
    <div className="fixed inset-0 bg-neutral-raw-900/60 flex items-center justify-center p-p-md z-50 animate-fade-in">
      <div 
        id="modal-card-box"
        className="relative bg-white rounded-r-md border border-neutral-raw-600/20 w-full max-w-[550px] shadow-lg overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Banner Section */}
        <div className="bg-brand-500 p-p-md text-white flex items-start justify-between">
          <div className="flex gap-p-sm items-center">
            <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-r-xs">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-widest text-brand-100 block">
                Detalle Técnico de Solución
              </span>
              <h4 className="text-lg font-black tracking-tight leading-tight">
                {app.name}
              </h4>
            </div>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-r-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Temporary toast style feedback notification code (Usability Heuristics 1: Visibility of system status) */}
        {notif && (
          <div className="bg-emerald-500 text-white text-xs px-p-md py-p-xs font-semibold flex items-center gap-1 justify-center animate-fade-in">
            <Check size={14} />
            <span>{notif}</span>
          </div>
        )}

        <div className="p-p-md tablet:p-p-lg flex flex-col gap-p-md">
          {/* Badge line */}
          <div className="flex items-center gap-p-xs">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
              Pilar:
            </span>
            <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-r-xs text-xxs font-bold border border-brand-500">
              {app.pilar}
            </span>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest ml-p-sm">
              Categoría:
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-r-xs text-xxs font-bold border border-neutral-raw-600/20">
              {app.category}
            </span>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-3 gap-p-sm border-t border-b border-neutral-raw-600/20 py-p-md bg-slate-50/50 rounded-r-xs p-p-sm">
            <div className="text-center">
              <span className="text-xxs font-bold text-slate-400 uppercase block">Licencias</span>
              <span className="text-md font-black text-neutral-raw-800">{licenciasAsignadas.toLocaleString('es-MX')}</span>
            </div>
            <div className="text-center border-l border-r border-neutral-raw-600/20">
              <span className="text-xxs font-bold text-slate-400 uppercase block">Tráfico Prom.</span>
              <span className="text-md font-black text-neutral-raw-800">{throughputPromedio} r/s</span>
            </div>
            <div className="text-center">
              <span className="text-xxs font-bold text-slate-400 uppercase block">Index Salud</span>
              <span className={`${scoreSalud > 85 ? 'text-success-700' : 'text-amber-700'} text-md font-black block`}>
                {scoreSalud}%
              </span>
            </div>
          </div>

          {/* Technical Info Box */}
          <div className="flex gap-p-sm items-start bg-brand-50 border border-brand-500 p-p-sm rounded-r-xs">
            <Info className="text-brand-500 shrink-0 mt-[2px]" size={15} />
            <div className="text-xxs text-brand-900 flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider">Análisis Crítico de Patrones</span>
              <p className="leading-relaxed">
                Esta aplicación representa el <span className="font-semibold">{app.percentage}%</span> del uso consolidado del pilar de <span className="font-semibold">{app.pilar}</span>. Los picos registrados se concentran en un horario que coincide con procesos de cierre y conciliación masiva.
              </p>
            </div>
          </div>

          {/* Integration recommendations */}
          <div className="flex flex-col gap-p-xs">
            <h5 className="text-xxs font-bold uppercase tracking-widest text-neutral-raw-400 flex items-center gap-1">
              <Sparkles size={11} className="text-brand-500" /> Diagnóstico y Optimización recomendada
            </h5>
            <div className="rounded-r-xs border border-neutral-raw-600/20 p-p-sm bg-white text-xxs flex flex-col gap-2">
              <div className="flex justify-between border-b border-neutral-raw-600/20 pb-1">
                <span className="font-bold text-neutral-raw-700">Estado de Servidores</span>
                <span className="font-sans text-[10px] text-emerald-600 font-bold uppercase tracking-wider">ESTABLE (99.98%)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-neutral-raw-700">Recomendación Adicional</span>
                <span className="text-right text-stone-500 font-medium">Asignar mayor ancho de banda en horas pico</span>
              </div>
            </div>
          </div>

          {/* Action CTAs complying with touch zones */}
          <div className="flex items-center justify-end gap-x-p-sm mt-p-sm border-t pt-p-md border-neutral-raw-600/20">
            <button
              id="export-pdf-btn"
              onClick={() => triggerNotif("Reporte PDF exportado satisfactoriamente")}
              className="flex items-center gap-p-xs rounded-r-sm border border-neutral-raw-600/20 bg-white px-p-md text-xs font-semibold text-neutral-raw-700 hover:bg-neutral-raw-50 cursor-pointer"
              style={{ height: "44px" }}
            >
              <FileText size={14} />
              <span>Exportar PDF</span>
            </button>
            <button
              id="sync-db-btn"
              onClick={() => triggerNotif("Plataforma Sincronizada con base de datos Principal")}
              className="flex items-center gap-p-xs rounded-r-sm bg-brand-500 text-white px-p-md text-xs font-semibold hover:bg-brand-650 cursor-pointer"
              style={{ height: "44px" }}
            >
              <Database size={14} />
              <span>Sincronizar DB</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
