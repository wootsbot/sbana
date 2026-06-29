import React from 'react';
import { AreaItem, AppItem } from "../data";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users,
  Search
} from "lucide-react";

interface ChartCardProps {
  areas: AreaItem[];
  apps?: AppItem[];
  selectedUnit: string;
  selectedHeatmapArea?: string;
  onSelectHeatmapArea?: (areaName: string) => void;
  onSelectUnit?: (unitName: string) => void;
}

/**
 * Classifies the adoption level and returns consistent semantic colors
 * following a clean, minimalist design language.
 */
const getAdoptionLevel = (percentage: number) => {
  if (percentage >= 70) {
    return {
      label: "Óptima",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      textClass: "text-emerald-600",
      progressGradient: "from-emerald-500 to-teal-400",
      borderLeftColor: "#10B981", // emerald-500
      bgClass: "bg-emerald-500/[0.04] border-emerald-500/15 hover:bg-emerald-500/[0.08] hover:border-emerald-500/30 hover:shadow-sm",
      dotColor: "bg-emerald-500",
      pulseColor: "bg-emerald-400"
    };
  } else if (percentage >= 40) {
    return {
      label: "Media",
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-200",
      textClass: "text-amber-600",
      progressGradient: "from-amber-500 to-orange-400",
      borderLeftColor: "#F59E0B", // amber-500
      bgClass: "bg-amber-500/[0.04] border-amber-500/15 hover:bg-amber-500/[0.08] hover:border-amber-500/30 hover:shadow-sm",
      dotColor: "bg-amber-500",
      pulseColor: "bg-amber-400"
    };
  } else {
    return {
      label: "Baja",
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-100",
      textClass: "text-rose-600",
      progressGradient: "from-rose-500 to-red-400",
      borderLeftColor: "#EF4444", // red-500 (red/rose)
      bgClass: "bg-rose-500/[0.04] border-rose-500/15 hover:bg-rose-500/[0.08] hover:border-rose-500/30 hover:shadow-sm",
      dotColor: "bg-rose-500",
      pulseColor: "bg-rose-400"
    };
  }
};

/**
 * [Organism] Mapa de Calor / Adopción de Aplicaciones y Áreas de Negocio
 * 
 * Permite cambiar entre la vista por área de negocio o por aplicación corporativa.
 * Incluye un potente filtro de búsqueda en tiempo real y ordenación de mayor a menor o de menor a mayor.
 */
export const ChartCard = ({ 
  areas, 
  apps = [],
  selectedUnit, 
  selectedHeatmapArea = "Todas", 
  onSelectHeatmapArea,
  onSelectUnit
}: ChartCardProps) => {
  const [viewMode, setViewMode] = React.useState<'area' | 'app'>('area');
  const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Datos Dummies para "Adopción por unidad de negocio" de alta fidelidad, dinámicos y responsivos
  const businessUnitsData = React.useMemo(() => {
    return [
      { name: "PISA Farmacéutica", pilar: "Dirección General", percentage: 84, totalUsers: 640, trend: 2.4 },
      { name: "Comercial Electrolit", pilar: "Comercialización", percentage: 76, totalUsers: 320, trend: 4.1 },
      { name: "Distribución y Logística", pilar: "Operaciones y Envíos", percentage: 61, totalUsers: 180, trend: -1.2 },
      { name: "Manufactura y Plantas", pilar: "Producción", percentage: 53, totalUsers: 450, trend: 0.8 },
      { name: "Corporativo y TI", pilar: "Soporte y Sistemas", percentage: 48, totalUsers: 210, trend: 3.5 },
      { name: "Calidad y Regulación", pilar: "Garantía de Calidad", percentage: 42, totalUsers: 95, trend: -0.5 },
      { name: "Recursos Humanos", pilar: "Cultura y Talento", percentage: 31, totalUsers: 150, trend: 1.7 },
      { name: "Comercial Farma", pilar: "Ventas y Farmacia", percentage: 28, totalUsers: 110, trend: -2.3 }
    ];
  }, []);

  // Filtrar áreas de negocio según búsqueda y ordenamiento
  const filteredAndSortedAreas = React.useMemo(() => {
    const filtered = areas.filter(area => 
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.percentage - a.percentage;
      } else {
        return a.percentage - b.percentage;
      }
    });
  }, [areas, searchTerm, sortOrder]);

  // Filtrar unidades de negocio según búsqueda y ordenamiento (Altamente Responsivos)
  const filteredAndSortedUnits = React.useMemo(() => {
    const filtered = businessUnitsData.filter(unit => 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.pilar.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.percentage - a.percentage;
      } else {
        return a.percentage - b.percentage;
      }
    });
  }, [businessUnitsData, searchTerm, sortOrder]);

  return (
    <div 
      id="adoption-heatmap-container" 
      className="rounded-lg border border-neutral-raw-600/20 bg-white p-5 flex flex-col gap-4 h-full shadow-sm"
    >
      
      {/* Título de sección interactivo y filtros en cascada */}
      <div className="flex flex-col gap-3 pb-3 border-b border-neutral-raw-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 id="heatmap-section-title" className="text-[13px] font-semibold text-neutral-raw-700 font-sans tracking-wide">
              {viewMode === 'area' 
                ? 'Adopción por dirección (activos esta semana)' 
                : 'Adopción por unidad de negocio (activos esta semana)'}
            </h3>
          </div>
          
          {selectedUnit !== "Todas" && viewMode === 'area' && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200 self-start sm:self-auto shrink-0">
              Unidad: {selectedUnit}
            </span>
          )}
        </div>

        {/* Panel de Control Unificado: Vista, Buscador, Ordenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          
          {/* Selector de tipo de visualización */}
          <div className="md:col-span-5 flex items-center bg-neutral-raw-100 rounded-lg p-0.5 border border-neutral-raw-600/20 h-9">
            <button
              onClick={() => {
                setViewMode('area');
                setSearchTerm('');
              }}
              className={`flex-1 text-center py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer h-full flex items-center justify-center ${
                viewMode === 'area'
                  ? 'bg-white text-brand-600 shadow-xs border border-neutral-raw-200/30 font-bold'
                  : 'text-neutral-raw-500 hover:text-neutral-raw-800'
              }`}
            >
              Por dirección
            </button>
            <button
              onClick={() => {
                setViewMode('app');
                setSearchTerm('');
              }}
              className={`flex-1 text-center py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer h-full flex items-center justify-center ${
                viewMode === 'app'
                  ? 'bg-white text-brand-600 shadow-xs border border-neutral-raw-200/30 font-bold'
                  : 'text-neutral-raw-500 hover:text-neutral-raw-800'
              }`}
            >
              Por unidad de negocio
            </button>
          </div>

          {/* Buscador inteligente */}
          <div className="md:col-span-4 relative h-9">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={13} className="text-neutral-raw-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={viewMode === 'area' ? 'Buscar dirección...' : 'Buscar unidad de negocio...'}
              className="w-full h-full pl-8 pr-7 bg-neutral-raw-50/50 border border-neutral-raw-600/20 rounded-lg text-xs text-neutral-raw-800 placeholder-neutral-raw-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-raw-400 hover:text-neutral-raw-600 text-[10px] font-semibold cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Sorter segmentado */}
          <div className="md:col-span-3 flex items-center bg-neutral-raw-100 rounded-lg p-0.5 border border-neutral-raw-600/20 h-9">
            <button
              onClick={() => setSortOrder('desc')}
              className={`flex-1 text-center py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer h-full flex items-center justify-center ${
                sortOrder === 'desc'
                  ? 'bg-white text-brand-600 shadow-xs border border-neutral-raw-200/30 font-bold'
                  : 'text-neutral-raw-500 hover:text-neutral-raw-800'
              }`}
            >
              Mayor a Menor
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`flex-1 text-center py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer h-full flex items-center justify-center ${
                sortOrder === 'asc'
                  ? 'bg-white text-brand-600 shadow-xs border border-neutral-raw-200/30 font-bold'
                  : 'text-neutral-raw-500 hover:text-neutral-raw-800'
              }`}
            >
              Menor a Mayor
            </button>
          </div>

        </div>
      </div>

      {/* Contenedor responsivo con límites de altura optimizados y scrollbar sutil de alta fidelidad */}
      <div className="flex-1 min-h-[340px] sm:min-h-[420px] lg:min-h-0 overflow-y-auto pr-1.5 scrollbar-thin">
        
        {/* Grid inteligente sincronizado con la proporción de la pantalla y la división lateral (35%/65%) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr items-stretch content-start pb-1">
          
          {viewMode === 'area' ? (
            filteredAndSortedAreas.length > 0 ? (
              filteredAndSortedAreas.map((area) => {
                const isCardActive = selectedHeatmapArea === area.name;
                const wauActiveUsers = Math.round(area.totalUsers * (area.percentage / 100));
                const level = getAdoptionLevel(area.percentage);

                return (
                  <div 
                    key={area.name} 
                    id={`heatmap-card-${area.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      const newActive = isCardActive ? "Todas" : area.name;
                      if (onSelectHeatmapArea) {
                        onSelectHeatmapArea(newActive);
                      }
                    }}
                    className={`group p-3.5 sm:p-4 border flex flex-col justify-between transition-all duration-300 cursor-pointer rounded-xl relative h-full w-full min-h-[120px] xs:min-h-[130px] sm:min-h-[140px] ${level.bgClass} ${
                      isCardActive 
                        ? "ring-2 ring-brand-500 ring-offset-1 relative z-10 shadow-lg transform scale-[1.01]" 
                        : "shadow-xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                    style={{ 
                      borderColor: isCardActive ? '#0066FF' : undefined,
                    }}
                  >
                    {/* Header: Name (No solid indicator dot) */}
                    <div className="flex items-start mb-3">
                      <span className="text-[13px] font-bold text-neutral-raw-800 leading-tight break-words group-hover:text-brand-600 transition-colors">
                        {area.name}
                      </span>
                    </div>

                    {/* Main Metrics Block: Large percentage & trend capsule */}
                    <div className="flex flex-col mb-3 mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-neutral-raw-900 leading-none">
                          {area.percentage}%
                        </span>
                        
                        {/* Modern minimalist trend pill relocated next to percentage */}
                        <span 
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            area.trend >= 0 
                              ? "bg-emerald-500/10 text-emerald-700" 
                              : "bg-rose-500/10 text-rose-700"
                          }`}
                        >
                          {area.trend >= 0 ? (
                            <TrendingUp size={10} className="shrink-0" />
                          ) : (
                            <TrendingDown size={10} className="shrink-0" />
                          )}
                          <span>{area.trend >= 0 ? '+' : ''}{area.trend}%</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-raw-500 uppercase tracking-wider mt-1.5">
                        Adopción
                      </span>
                    </div>

                    {/* Elegant, thin glow-progress bar */}
                    <div className="w-full bg-neutral-raw-200/40 overflow-hidden h-1 rounded-full relative shrink-0">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${level.progressGradient} transition-all duration-500 ease-out`}
                        style={{ 
                          width: `${Math.min(area.percentage, 100)}%` 
                        }}
                      />
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center border border-dashed border-neutral-raw-200 rounded-lg bg-neutral-raw-50">
                <p className="text-xs font-semibold text-neutral-raw-500">
                  No se encontraron direcciones compatibles con la búsqueda.
                </p>
              </div>
            )
          ) : (
            // viewMode === 'app' (Business Units List)
            filteredAndSortedUnits.length > 0 ? (
              filteredAndSortedUnits.map((unit) => {
                const isUnitActive = selectedUnit === unit.name;
                const level = getAdoptionLevel(unit.percentage);

                return (
                  <div 
                    key={unit.name} 
                    id={`heatmap-app-card-${unit.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      const newActive = isUnitActive ? "Todas" : unit.name;
                      if (onSelectUnit) {
                        onSelectUnit(newActive);
                      }
                    }}
                    className={`group p-3.5 xs:p-4 md:p-5 lg:p-4 xl:p-5 border flex flex-col justify-between transition-all duration-300 cursor-pointer rounded-xl relative h-full w-full min-h-[120px] xs:min-h-[130px] sm:min-h-[140px] ${level.bgClass} ${
                      isUnitActive 
                        ? "ring-2 ring-brand-500 ring-offset-1 relative z-10 shadow-lg transform scale-[1.01]" 
                        : "shadow-xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                    style={{ 
                      borderColor: isUnitActive ? '#0066FF' : undefined,
                    }}
                  >
                    {/* Header: Business Unit Name & Pillar/Division */}
                    <div className="flex items-start mb-2 sm:mb-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-[13px] font-bold text-neutral-raw-800 leading-tight group-hover:text-brand-600 transition-colors break-words">
                          {unit.name}
                        </span>
                        <span className="text-[10px] text-neutral-raw-600 mt-0.5 font-bold tracking-wide uppercase">
                          {unit.pilar}
                        </span>
                      </div>
                    </div>

                    {/* Main Metrics Block: Large percentage & trend capsule */}
                    <div className="flex flex-col mb-2 sm:mb-3 mt-auto">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl xs:text-3xl sm:text-4xl md:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-neutral-raw-900 leading-none">
                          {unit.percentage}%
                        </span>
                        
                        {/* Modern trend pill */}
                        <span 
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            unit.trend >= 0 
                              ? "bg-emerald-500/10 text-emerald-700" 
                              : "bg-rose-500/10 text-rose-700"
                          }`}
                        >
                          {unit.trend >= 0 ? (
                            <TrendingUp size={10} className="shrink-0" />
                          ) : (
                            <TrendingDown size={10} className="shrink-0" />
                          )}
                          <span>{unit.trend >= 0 ? '+' : ''}{unit.trend}%</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                        <span className="text-[9px] font-bold text-neutral-raw-500 uppercase tracking-wider">
                          Adopción
                        </span>
                        <span className="text-[10px] font-bold text-neutral-raw-600 font-mono">
                          {unit.totalUsers} WAU
                        </span>
                      </div>
                    </div>

                    {/* Elegant, thin glow-progress bar */}
                    <div className="w-full bg-neutral-raw-200/40 overflow-hidden h-1 rounded-full relative shrink-0">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${level.progressGradient} transition-all duration-500 ease-out`}
                        style={{ 
                          width: `${Math.min(unit.percentage, 100)}%` 
                        }}
                      />
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center border border-dashed border-neutral-raw-200 rounded-lg bg-neutral-raw-50">
                <p className="text-xs font-semibold text-neutral-raw-500">
                  No se encontraron unidades de negocio compatibles con la búsqueda.
                </p>
              </div>
            )
          )}
          
        </div>
      </div>

    </div>
  );
};
