import React, { useState, useMemo } from "react";
import { DashboardData, businessUnits, appSelections } from "../data";
import { Info, TrendingUp, Calendar, Filter } from "lucide-react";

// Color maps for different lines to keep them beautiful, corporate, and distinguishable
const AREA_COLORS: Record<string, string> = {
  "Transformación digital": "#0066FF", // Brand Blue
  "Recursos Humanos": "#0D9488",        // Deep Teal
  "Manufactura": "#475569",            // Slate Gray
  "Calidad": "#0EA5E9",                // Sky Blue
  "TI": "#4F46E5",                     // Modern Indigo
  "Comercial Electrolit": "#0052CC",   // Dark Cobalt Blue
  "Finanzas": "#0A2240",               // Deep Navy
  "Logística": "#64748B",              // Cool Gray
  "Comercial Farma": "#0284C7"         // Deep Ocean Blue
};

const APP_COLORS: Record<string, string> = {
  "Exploración abierta": "#0066FF",
  "biblioteca Pisa": "#0D9488",
  "análisis de datos": "#0284C7",
  "Productividad y oficina": "#4F46E5",
  "Hada": "#0A2240",
  "Agentes especializados": "#3B82F6",
  "Investigación": "#64748B",
  "Imágenes y videos": "#0EA5E9"
};

interface PatternsViewProps {
  data: DashboardData;
}

/**
 * [Organism] Vista de Patrones de Uso basada exactamente en el Sketch del Usuario.
 * Muestra únicamente la Evolución Histórica de Consultas y el Mapa de Calor de Picos de Uso,
 * controlados por filtros de Área y Aplicación.
 * Ahora incluye desglose del gráfico para ver múltiples líneas por Área o por Aplicación de forma interactiva.
 */
export const PatternsView = ({ data }: PatternsViewProps) => {
  const { timelineData } = data;

  // Local filter states
  const [selectedArea, setSelectedArea] = useState<string>("Todas");
  const [selectedAppLocal, setSelectedAppLocal] = useState<string>("Todas");

  // Chart series view option state: 'consolidated' | 'byArea' | 'byApp'
  const [chartViewMode, setChartViewMode] = useState<'consolidated' | 'byArea' | 'byApp'>('consolidated');

  // List of series turned off manually in legend
  const [visibleSeriesIds, setVisibleSeriesIds] = useState<Record<string, boolean>>({});

  // Hover point tooltip details
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesName: string;
    label: string;
    value: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  // Granularity selector state
  const [timelineGranularity, setTimelineGranularity] = useState<'Día' | 'Semana' | 'Mes'>("Semana");

  // Heatmap hourly hover details state
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; val: number } | null>(null);

  // Map Spanish weekday abbreviations for heatmap rows
  const daysOfWeek = [
    { key: "Lunes", short: "L" },
    { key: "Martes", short: "M" },
    { key: "Miércoles", short: "M" },
    { key: "Jueves", short: "J" },
    { key: "Viernes", short: "V" },
    { key: "Sábado", short: "S" },
    { key: "Domingo", short: "D" }
  ];

  // Dynamic filter multiplier based on selection to make both remaining charts fully reactive
  const filterFactor = useMemo(() => {
    let factor = 1.0;
    if (selectedArea !== "Todas") {
      // Clean deterministic variation based on the area name
      const code = selectedArea.charCodeAt(0) + selectedArea.charCodeAt(selectedArea.length - 1);
      factor *= (0.5 + (code % 5) * 0.12);
    }
    if (selectedAppLocal !== "Todas") {
      // Clean deterministic variation based on the application name
      const code = selectedAppLocal.charCodeAt(0) + selectedAppLocal.charCodeAt(selectedAppLocal.length - 1);
      factor *= (0.55 + (code % 4) * 0.15);
    }
    return factor;
  }, [selectedArea, selectedAppLocal]);

  // Helper to compute weekday activity heatmap intensity with reactive filtering
  const getCellIntensity = (day: string, hour: number) => {
    const isWeekend = day === "Sábado" || day === "Domingo";
    let baseVal = 10;

    // Night hours
    if (hour < 8 || hour > 20) {
      baseVal = isWeekend ? 5 : 8;
    }
    // Peak hours
    else if (!isWeekend && ((hour >= 10 && hour <= 13) || (hour >= 15 && hour <= 17))) {
      baseVal = 95; // Peak scribble zone
    }
    // Weekday regular working hours
    else if (!isWeekend) {
      baseVal = 65;
    }
    // Weekend daytime
    else if (day === "Sábado" && hour >= 9 && hour <= 14) {
      baseVal = 35;
    }

    // Apply area and application filter multiplier
    let localModifier = filterFactor;
    if (selectedArea !== "Todas") {
      const areaHash = selectedArea.length;
      localModifier *= (0.8 + (areaHash % 4) * 0.1); 
    }
    if (selectedAppLocal !== "Todas") {
      const appHash = selectedAppLocal.length;
      localModifier *= (0.85 + (appHash % 3) * 0.1);
    }

    return Math.min(100, Math.max(1, Math.round(baseVal * localModifier)));
  };

  const avgConsultas = timelineData.reduce((sum, item) => sum + item.consultas, 0) / (timelineData.length || 1);

  // Computed stable labels for graph timeline
  const chartLabels = useMemo(() => {
    if (timelineGranularity === "Día") {
      return ["1 junio", "2 junio", "3 junio", "4 junio", "5 junio", "6 junio", "7 junio"];
    } else if (timelineGranularity === "Semana") {
      return ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"];
    } else {
      return ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    }
  }, [timelineGranularity]);

  // Construct series data for all options
  const seriesList = useMemo(() => {
    const labels = chartLabels;

    if (chartViewMode === 'consolidated') {
      const values = labels.map((label, idx) => {
        let valFactor = 1.0;
        if (timelineGranularity === "Día") {
          valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
          return {
            label,
            value: Math.round((avgConsultas / 5.2) * valFactor * filterFactor)
          };
        } else if (timelineGranularity === "Semana") {
          valFactor = 0.88 + (idx * 0.055);
          return {
            label,
            value: Math.round(avgConsultas * valFactor * filterFactor)
          };
        } else {
          valFactor = 0.72 + (idx * 0.065);
          return {
            label,
            value: Math.round(avgConsultas * 4.3 * valFactor * filterFactor)
          };
        }
      });

      return [{
        id: "consolidated",
        name: "Consolidado total",
        color: "#0066FF",
        visible: true,
        data: values
      }];
    }

    if (chartViewMode === 'byArea') {
      const areasToDisplay = businessUnits.filter(u => u !== "Todas");
      
      const areaWeights: Record<string, number> = {
        "Transformación digital": 1.35,
        "Recursos Humanos": 0.85,
        "Manufactura": 0.45,
        "Calidad": 0.32,
        "TI": 1.6,
        "Comercial Electrolit": 1.25,
        "Finanzas": 0.78,
        "Logística": 0.62,
        "Comercial Farma": 0.52
      };

      return areasToDisplay.map(areaName => {
        const multiplier = areaWeights[areaName] || 0.8;
        let baseAppFactor = 1.0;
        if (selectedAppLocal !== "Todas") {
          const code = selectedAppLocal.charCodeAt(0) + selectedAppLocal.charCodeAt(selectedAppLocal.length - 1);
          baseAppFactor *= (0.55 + (code % 4) * 0.15);
        }

        const values = labels.map((label, idx) => {
          let valFactor = 1.0;
          const areaHash = areaName.charCodeAt(0) + idx;
          const curveVariation = 0.92 + (Math.sin(areaHash * 0.8) * 0.12);

          if (timelineGranularity === "Día") {
            valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
            return {
              label,
              value: Math.round((avgConsultas / 6.5) * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          } else if (timelineGranularity === "Semana") {
            valFactor = 0.88 + (idx * 0.055);
            return {
              label,
              value: Math.round(avgConsultas * 0.22 * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          } else {
            valFactor = 0.72 + (idx * 0.065);
            return {
              label,
              value: Math.round(avgConsultas * 0.95 * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          }
        });

        const visible = visibleSeriesIds[areaName] !== false;

        return {
          id: areaName,
          name: areaName,
          color: AREA_COLORS[areaName] || "#475569",
          visible,
          data: values
        };
      });
    }

    if (chartViewMode === 'byApp') {
      const appsToDisplay = appSelections.filter(app => app !== "Todas");

      const appWeights: Record<string, number> = {
        "Exploración abierta": 1.45,
        "biblioteca Pisa": 1.15,
        "análisis de datos": 1.05,
        "Productividad y oficina": 0.9,
        "Hada": 0.8,
        "Agentes especializados": 0.72,
        "Investigación": 0.52,
        "Imágenes y videos": 0.42
      };

      return appsToDisplay.map(appName => {
        const multiplier = appWeights[appName] || 0.75;
        let baseAreaFactor = 1.0;
        if (selectedArea !== "Todas") {
          const code = selectedArea.charCodeAt(0) + selectedArea.charCodeAt(selectedArea.length - 1);
          baseAreaFactor *= (0.5 + (code % 5) * 0.12);
        }

        const values = labels.map((label, idx) => {
          let valFactor = 1.0;
          const appHash = appName.charCodeAt(0) + idx;
          const curveVariation = 0.94 + (Math.sin(appHash * 1.1) * 0.1);

          if (timelineGranularity === "Día") {
            valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
            return {
              label,
              value: Math.round((avgConsultas / 6.2) * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          } else if (timelineGranularity === "Semana") {
            valFactor = 0.88 + (idx * 0.055);
            return {
              label,
              value: Math.round(avgConsultas * 0.24 * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          } else {
            valFactor = 0.72 + (idx * 0.065);
            return {
              label,
              value: Math.round(avgConsultas * 1.02 * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          }
        });

        const visible = visibleSeriesIds[appName] !== false;

        return {
          id: appName,
          name: appName,
          color: APP_COLORS[appName] || "#475569",
          visible,
          data: values
        };
      });
    }

    return [];
  }, [chartViewMode, timelineGranularity, avgConsultas, filterFactor, selectedArea, selectedAppLocal, visibleSeriesIds, chartLabels]);

  // Coordinates Mapping for timeline SVG line chart
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;

  const seriesWithCoords = useMemo(() => {
    const allVisibleValues = seriesList
      .filter(s => s.visible)
      .flatMap(s => s.data.map(d => d.value));

    const maxVal = Math.max(...allVisibleValues) * 1.18 || 100;

    return seriesList.map(series => {
      const coords = series.data.map((d, idx) => {
        const x = paddingX + (idx * (width - 2 * paddingX)) / (series.data.length - 1);
        const y = height - paddingY - ((d.value / maxVal) * (height - 2 * paddingY));
        return { x, y, value: d.value };
      });

      return {
        ...series,
        coords
      };
    });
  }, [seriesList]);

  // Highlight check for line styling
  const isHighlighted = (seriesName: string) => {
    if (chartViewMode === 'consolidated') return true;
    if (chartViewMode === 'byArea') {
      if (selectedArea === "Todas") return true;
      return seriesName === selectedArea;
    }
    if (chartViewMode === 'byApp') {
      if (selectedAppLocal === "Todas") return true;
      return seriesName === selectedAppLocal;
    }
    return true;
  };

  const getPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, c, idx) => {
      return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, "");
  };

  return (
    <div className="flex flex-col gap-p-md animate-fade-in">
      
      {/* 1. HISTORICAL EVOLUTION LINE GRAPH (MULTI-SERIES CAPABLE) */}
      <section className="bg-white border border-neutral-raw-600/20 rounded-md p-p-lg flex flex-col gap-p-md shadow-sm relative">
        {/* Info Icon Tooltip in top-right corner of the section */}
        <div className="absolute top-4 right-4 z-30 group/info">
          <button
            type="button"
            className="text-neutral-raw-400 hover:text-brand-600 transition-colors p-1 rounded-full hover:bg-neutral-raw-50 focus:outline-hidden cursor-help flex items-center justify-center"
            aria-label="Información sobre evolución de consultas"
          >
            <Info size={15} />
          </button>
          {/* Tooltip Card */}
          <div className="absolute right-0 top-8 w-72 bg-white border border-neutral-raw-600/20 rounded-lg shadow-lg p-3 text-[11px] text-neutral-raw-700 pointer-events-none opacity-0 translate-y-1 group-hover/info:opacity-100 group-hover/info:translate-y-0 group-hover/info:pointer-events-auto transition-all duration-200 z-50">
            <div className="flex items-start gap-2">
              <Info size={13} className="text-brand-600 shrink-0 mt-[2px]" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-neutral-raw-800">Evolución de Consultas</span>
                <p className="leading-normal font-sans text-neutral-raw-600">
                  El gráfico superior representa el <strong>volumen de consultas dinámicas</strong>{chartViewMode === 'byArea' ? " desglosado por áreas de negocio" : chartViewMode === 'byApp' ? " desglosado por soluciones tecnológicas y aplicaciones" : ""}. {chartViewMode !== 'consolidated' && "Las líneas con opacidad completa corresponden a filtros e intensidades predeterminadas. Puedes alternar líneas haciendo clic en la leyenda superior."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-p-md pb-p-xs border-b border-neutral-raw-100 pr-8 sm:pr-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={15} />
            <div>
              <h3 className="text-[13px] font-medium text-neutral-raw-700 font-sans tracking-wide">
                Evolución de Consultas: Tendencia histórica interactiva
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* View layout selection buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-neutral-raw-500">
                Ver como:
              </span>
              <div className="flex rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100">
                {(["consolidated", "byArea", "byApp"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setChartViewMode(mode);
                      setVisibleSeriesIds({});
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-sm cursor-pointer transition-all ${
                      chartViewMode === mode
                        ? "bg-white text-neutral-raw-800 shadow-sm font-semibold"
                        : "text-neutral-raw-600 hover:text-neutral-raw-800 hover:bg-white/40"
                    }`}
                    style={{ minHeight: "28px" }}
                  >
                    {mode === 'consolidated' ? "Consolidado" : mode === 'byArea' ? "Por dirección" : "Por unidad de negocio"}
                  </button>
                ))}
              </div>
            </div>

            {/* Period selector buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-neutral-raw-500">
                Granularidad:
              </span>
              <div className="flex rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100">
                {(["Día", "Semana", "Mes"] as const).map((period) => (
                  <button
                    key={period}
                    id={`period-btn-${period.toLowerCase()}`}
                    onClick={() => {
                      setTimelineGranularity(period);
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-sm cursor-pointer transition-all ${
                      timelineGranularity === period
                        ? "bg-white text-neutral-raw-800 shadow-sm font-semibold"
                        : "text-neutral-raw-600 hover:text-neutral-raw-800 hover:bg-white/40"
                    }`}
                    style={{ minHeight: "28px" }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <div className="relative min-w-[500px] h-[210px] mt-2 pb-2">
            
            {/* TOOLTIP OVERLAY */}
            {hoveredPoint && (
              <div 
                className="absolute z-20 pointer-events-none bg-neutral-raw-900 border border-neutral-raw-800 text-white rounded-sm px-2.5 py-1.5 shadow-md flex flex-col gap-0.5"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold tracking-wider text-slate-300 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hoveredPoint.color }} />
                  <strong>{hoveredPoint.seriesName}</strong>
                </div>
                <div className="text-[11px] font-bold font-sans">
                  {hoveredPoint.label}: <span className="text-brand-300">{hoveredPoint.value.toLocaleString('es-MX')}</span>
                </div>
              </div>
            )}

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
              {/* Background grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingY + ratio * (height - 2 * paddingY);
                return (
                  <line 
                    key={idx}
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="#E5E7EB" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Render each visible line */}
              {seriesWithCoords.map((series) => {
                if (!series.visible) return null;

                const highlighted = isHighlighted(series.name);
                const strokeWidth = highlighted ? (chartViewMode === 'consolidated' ? 3.5 : 2.8) : 1.2;
                const opacity = highlighted ? 1 : 0.22;

                return (
                  <g key={series.id}>
                    {/* Line path */}
                    <path 
                      d={getPath(series.coords)} 
                      fill="none" 
                      stroke={series.color} 
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      className="transition-all duration-300"
                    />

                    {/* Nodes for this line */}
                    {series.coords.map((node, nodeIdx) => (
                      <g key={nodeIdx} className="group/node">
                        {/* Hover outline detector */}
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r="7" 
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({
                            seriesName: series.name,
                            label: series.data[nodeIdx].label,
                            value: node.value,
                            color: series.color,
                            x: node.x,
                            y: node.y
                          })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* Dot point */}
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r={highlighted ? "3.5" : "2"} 
                          fill={series.color} 
                          stroke="#FFF" 
                          strokeWidth={highlighted ? "1.2" : "0.8"}
                          opacity={opacity}
                          className="cursor-pointer"
                        />
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between px-p-lg text-[10px] text-neutral-raw-400 font-bold font-sans uppercase tracking-wider">
              {chartLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CLICKABLE SERIES LEGEND SECTION */}
        {chartViewMode !== 'consolidated' && (
          <div className="mt-4 border-t border-neutral-raw-100 pt-3">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-raw-500">
              <Filter size={14} className="text-neutral-raw-400" />
              <span className="text-[11px] font-semibold text-neutral-raw-500">
                Personalizar líneas visibles en gráfico (Haz clic para ocultar/mostrar):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {seriesList.map((series) => {
                const highlighted = isHighlighted(series.name);
                return (
                  <button
                    key={series.id}
                    onClick={() => {
                      setVisibleSeriesIds((prev) => ({
                        ...prev,
                        [series.id]: prev[series.id] === false ? true : false,
                      }));
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-all cursor-pointer ${
                      series.visible
                        ? "bg-neutral-raw-50/50 border-neutral-raw-600/20 text-neutral-raw-800"
                        : "bg-white border-neutral-raw-600/20 text-neutral-raw-400 opacity-50 line-through"
                    } ${highlighted ? "ring-2 ring-brand-500/10 font-bold" : ""}`}
                  >
                    <span 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: series.color }}
                    />
                    <span>{series.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {/* 2. PICOS DE USO (HEATMAP GRID) */}
      <section className="bg-white border border-neutral-raw-600/20 rounded-md p-p-lg flex flex-col gap-p-md shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-p-md pb-p-xs border-b border-neutral-raw-100 mb-p-xs">
          <div className="flex items-center gap-2">
            <Calendar className="text-brand-500" size={15} />
            <h3 className="text-[13px] font-medium text-neutral-raw-700 font-sans tracking-wide">
              Concentración de Demanda: Picos Horarios de Consulta (Día vs Hora)
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-[11px] font-medium text-neutral-raw-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[2px]" /> Baja (&lt;15%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 bg-[#BBF7D0] border border-[#86EFAC] rounded-[2px]" /> Regular (15-50%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-[2px]" /> Alta (50-85%)
            </span>
            <span className="flex items-center gap-1">
              <span 
                className="h-3 w-3 border border-[#FCA5A5] rounded-[2px]" 
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #EF4444 0px, #EF4444 1px, transparent 1px, transparent 4px)', backgroundColor: '#FEF2F2' }} 
              />
              Pico (&gt;85%)
            </span>
          </div>
        </div>

        {/* Heatmap Outer Protected Scrollable container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] pb-2">
            
            {/* Headers row (0 to 23 hours) */}
            <div className="grid grid-cols-[40px_repeat(24,_1fr)] gap-[2px] mb-1">
              {/* Empty offset for label Column */}
              <div className="text-[11px] font-semibold text-neutral-raw-400 text-center">Día</div>
              {Array.from({ length: 24 }).map((_, hr) => (
                <div key={hr} className="text-[11px] font-bold font-sans text-center text-neutral-raw-500">
                  {hr}
                </div>
              ))}
            </div>

            {/* Days Grid Rows */}
            <div className="flex flex-col gap-[2px]">
              {daysOfWeek.map((dayObj) => {
                return (
                  <div key={dayObj.key} className="grid grid-cols-[40px_repeat(24,_1fr)] gap-[2px] items-center">
                    
                    {/* Weekday Label */}
                    <div className="text-xs font-semibold text-neutral-raw-700 text-center font-sans tracking-wide">
                      {dayObj.short}
                    </div>

                    {/* Hourly Blocks */}
                    {Array.from({ length: 24 }).map((_, hr) => {
                      const val = getCellIntensity(dayObj.key, hr);
                      
                      // Map intensity to visual boxes matching semáforo colors
                      let cellStyle: React.CSSProperties = {};
                      let cellClass = "";

                      if (val > 85) {
                        cellStyle = {
                          backgroundImage: 'repeating-linear-gradient(45deg, #EF4444 0px, #EF4444 1px, transparent 1px, transparent 5px)',
                          backgroundColor: '#FEF2F2'
                        };
                        cellClass = "border-[#FCA5A5]";
                      } else if (val > 50) {
                        cellClass = "bg-[#FEF3C7] border-[#FCD34D]";
                      } else if (val > 15) {
                        cellClass = "bg-[#BBF7D0] border-[#86EFAC]";
                      } else {
                        cellClass = "bg-[#F0FDF4] border-[#DCFCE7]";
                      }

                      return (
                        <button
                          id={`heatmap-${dayObj.key.toLowerCase()}-${hr}`}
                          key={hr}
                          className={`h-7 rounded-[2px] border transition-all cursor-pointer ${cellClass}`}
                          style={cellStyle}
                          onMouseEnter={() => setHoveredCell({ day: dayObj.key, hour: hr, val })}
                          onMouseLeave={() => setHoveredCell(null)}
                          aria-label={`Actividad para ${dayObj.key} a las ${hr}:00 es de ${val}%`}
                        />
                      );
                    })}

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Hover info panel */}
        <div className="mt-2 text-center" style={{ minHeight: "28px" }}>
          {hoveredCell ? (
            <div className="inline-flex items-center gap-2 bg-neutral-raw-900 text-white rounded-sm px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider animate-fade-in">
              <Info size={14} className="text-brand-300" />
              <span>{hoveredCell.day} • {hoveredCell.hour}:00 hrs:</span>
              <span className="text-brand-400 font-bold">
                {hoveredCell.val > 85 ? "PICO CRÍTICO DE CONSULTAS (Semaforo Rojo)" : hoveredCell.val > 50 ? "Tráfico Alto (Semaforo Amarillo)" : hoveredCell.val > 15 ? "Tráfico Regular (Semaforo Verde Claro)" : "Tráfico Bajo (Semaforo Verde)"}
              </span>
              <span className="text-slate-400 font-normal">({hoveredCell.val}% de carga)</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic font-medium">
              Pasa el cursor por encima de los bloques horariales para analizar el comportamiento dinámico de consultas.
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
