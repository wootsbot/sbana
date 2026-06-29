import { Metric } from "../data";
import { TYPE } from "../typography";
import { Info, Users, UserCheck, Activity, Zap, Percent, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface MetricsBarProps {
  metrics: Metric[];
  viewMode?: "extended" | "compact";
}

/**
 * [Organism] Fila de Tarjetas KPI con diseño responsivo, tooltips interactivos y visuales premium de alta fidelidad.
 * Aplica minimalismo estricto, paleta APCA-safe, micro-interacciones suaves y acentos de color modernos.
 */
export const MetricsBar = ({ metrics, viewMode = "extended" }: MetricsBarProps) => {

  const getKpiId = (title: string): string => {
    const tLower = title.toLowerCase();
    if (tLower.includes("semanal") || tLower.includes("semana") || tLower.includes("wau")) {
      return "activos-esta-semana";
    }
    if (tLower.includes("diari") || tLower.includes("dau") || tLower.includes("hoy")) {
      return "activos-hoy";
    }
    if (tLower.includes("cuenta") || tLower.includes("activad") || tLower.includes("histórica") || tLower.includes("historica")) {
      return "cuentas-activadas";
    }
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  const getCustomTooltipText = (title: string): string => {
    const tLower = title.toLowerCase();
    if (tLower.includes("habilitados")) {
      return "Usuarios autorizados con credenciales de acceso activas en el ecosistema SabIA corporativo.";
    }
    if (tLower.includes("cuenta") || tLower.includes("activad") || tLower.includes("histórica") || tLower.includes("historica")) {
      return "Porcentaje de cuentas habilitadas que han completado al menos un login o acceso inicial.";
    }
    if (tLower.includes("semanal") || tLower.includes("semana")) {
      return "Activos últ. 30 días: total de usuarios que han hecho por lo menos una consulta en los últimos 30 días.";
    }
    if (tLower.includes("diari") || tLower.includes("hoy") || tLower.includes("día")) {
      return "Activos últ. 7 días: total de usuarios únicos con interacciones registradas durante los últimos 7 días.";
    }
    return "";
  };

  const getCleanLabel = (title: string): string => {
    const tLower = title.toLowerCase();
    if (tLower.includes("semanal") || tLower.includes("semana") || tLower.includes("wau")) {
      return "Activos últ. 30 días";
    }
    if (tLower.includes("diari") || tLower.includes("dau") || tLower.includes("hoy")) {
      return "Activos últ. 7 días";
    }
    if (tLower.includes("cuenta") || tLower.includes("activad") || tLower.includes("histórica") || tLower.includes("historica")) {
      return "Activación Histórica";
    }
    return title;
  };

  // Helper to resolve specific icons and premium accents for each metric type
  const getMetricStyle = (title: string) => {
    const tLower = title.toLowerCase();
    if (tLower.includes("habilitados")) {
      return {
        icon: <Users className="text-brand-600" size={16} />,
        borderAccent: "border-l-slate-400",
        bgGradient: "from-white to-slate-50/10",
        bgIcon: ""
      };
    }
    if (tLower.includes("activad") || tLower.includes("tasa") || tLower.includes("histórica") || tLower.includes("historica")) {
      return {
        icon: <UserCheck className="text-brand-600" size={16} />,
        borderAccent: "border-l-sky-500",
        bgGradient: "from-white to-sky-50/15",
        bgIcon: ""
      };
    }
    if (tLower.includes("30") || tLower.includes("semanal") || tLower.includes("semana") || tLower.includes("wau")) {
      return {
        icon: <Calendar className="text-brand-600" size={16} />,
        borderAccent: "border-l-brand-500",
        bgGradient: "from-white to-brand-50/10",
        bgIcon: ""
      };
    }
    return {
      icon: <Activity className="text-brand-600" size={16} />,
      borderAccent: "border-l-brand-700",
      bgGradient: "from-white to-brand-50/15",
      bgIcon: ""
    };
  };

  return (
    <section 
      id="kpi-metrics-row"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-p-md w-full"
    >
      {metrics.map((m) => {
        const isUp = m.changeType === "up";
        const isDown = m.changeType === "down";

        const badgeClass = isUp
          ? "bg-emerald-500/10 text-emerald-700"
          : isDown
            ? "bg-rose-500/10 text-rose-700"
            : "bg-neutral-raw-500/10 text-neutral-raw-700";

        const cleanTitle = getCleanLabel(m.title);
        const tooltipText = getCustomTooltipText(m.title);
        const metaStyle = getMetricStyle(m.title);

        if (viewMode === "compact") {
          return (
            <div 
              id={`kpi-card-${getKpiId(m.title)}`}
              key={m.title} 
              className={`relative flex items-center justify-between rounded-md border border-neutral-raw-600/20 bg-white py-2.5 px-p-md w-full transition-all duration-300 hover:border-brand-500/50 hover:shadow-md min-h-[50px] shadow-sm animate-fadeIn`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="flex items-center justify-center shrink-0">
                  {metaStyle.icon}
                </div>
                <span 
                  id={`kpi-label-${getKpiId(m.title)}`} 
                  className="text-[11px] font-semibold text-neutral-raw-600 truncate block leading-tight font-sans"
                >
                  {cleanTitle}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span 
                  id={`kpi-value-${getKpiId(m.title)}`} 
                  className="text-base font-bold text-neutral-raw-800 font-sans"
                >
                  {m.value}
                </span>
                <span 
                  id={`kpi-delta-${getKpiId(m.title)}`} 
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 font-sans ${badgeClass}`}
                >
                  {isUp && <TrendingUp size={10} className="shrink-0" />}
                  {isDown && <TrendingDown size={10} className="shrink-0" />}
                  <span>{m.changeValue}</span>
                </span>
              </div>
            </div>
          );
        }

        return (
          <div 
            id={`kpi-card-${getKpiId(m.title)}`}
            key={m.title} 
            className={`group relative flex flex-col justify-between rounded-lg border border-neutral-raw-600/20 bg-white p-3.5 w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-500/50 min-h-[105px] shadow-sm animate-fadeIn`}
          >
            {/* KPI Title & Interactive Help Icon & Category Icon */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shrink-0">
                  {metaStyle.icon}
                </div>
                <span 
                  id={`kpi-label-${getKpiId(m.title)}`} 
                  className="text-[11px] font-semibold text-neutral-raw-600 truncate block leading-tight font-sans"
                >
                  {cleanTitle}
                </span>
              </div>
              
              {/* Tooltip on Info Icon with exact style requirements */}
              <div className="relative group/tooltip flex items-center flex-shrink-0">
                <button
                  type="button"
                  aria-label={`Información sobre ${cleanTitle}`}
                  className="text-neutral-raw-400 hover:text-neutral-raw-600 focus:outline-none cursor-help p-0.5 rounded-full hover:bg-neutral-raw-100 transition-colors"
                >
                  <Info size={11} />
                </button>
                {tooltipText && (
                  <div 
                    role="tooltip"
                    className="hidden group-hover/tooltip:block absolute bottom-full mb-2 right-0 bg-neutral-raw-900 text-white p-2.5 rounded-md z-50 pointer-events-none text-[10px] font-normal leading-relaxed whitespace-normal w-52 text-left shadow-lg border border-neutral-raw-600/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {tooltipText}
                  </div>
                )}
              </div>
            </div>

            {/* El divisor siempre en medio de ambos componentes */}
            <div className="w-full h-px bg-neutral-raw-200 my-2 opacity-50" />

            {/* Core KPI Values - High Visual Weight */}
            <div className="flex items-baseline justify-between mt-0.5">
              <span 
                id={`kpi-value-${getKpiId(m.title)}`} 
                className="text-2xl font-bold tracking-tight text-neutral-raw-800 font-sans"
              >
                {m.value}
              </span>
              
              {/* Delta value always visible styled exactly like business area cards */}
              <div className="flex items-center">
                <span 
                  id={`kpi-delta-${getKpiId(m.title)}`} 
                  className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-md shrink-0 font-sans ${badgeClass}`}
                >
                  {isUp && <TrendingUp size={9} className="shrink-0" />}
                  {isDown && <TrendingDown size={9} className="shrink-0" />}
                  <span>{m.changeValue}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

