import { useState } from "react";
import { AppWindow, Layers, Inbox, X, Info } from "lucide-react";
import { AppItem } from "../data";

interface ListCardProps {
  title: string;
  apps: AppItem[];
  onSelectApp?: (app: AppItem) => void;
  selectedHeatmapArea?: string;
  onClearAreaFilter?: () => void;
  selectedAppForHeatmap?: string;
  onSelectAppForHeatmap?: (appName: string) => void;
}

/**
 * [Organism] ListCard
 * 
 * Muestra el listado de aplicaciones inteligentes ordenadas por uso, de acuerdo con la heurística H6 y H8.
 * Utiliza sentence case para sus títulos, colores de categoría neutros, y avisos de estado claros.
 */
export const ListCard = ({ 
  title, 
  apps, 
  onSelectApp, 
  selectedHeatmapArea = "Todas", 
  onClearAreaFilter,
  selectedAppForHeatmap = "Todas",
  onSelectAppForHeatmap 
}: ListCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewLevel, setViewLevel] = useState<"Aplicación" | "Pilar">("Aplicación");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Filtrar o agrupar según jerarquía
  let displayApps: AppItem[] = [];
  if (viewLevel === "Aplicación") {
    displayApps = apps;
  } else {
    // Agrupar por pilar corporativo
    const grouped = apps.reduce((acc, app) => {
      const pilar = app.pilar;
      if (!acc[pilar]) {
        acc[pilar] = {
          name: pilar,
          pilar: pilar,
          usageCount: 0,
          percentageSum: 0,
          count: 0,
          category: "Consolidados"
        };
      }
      acc[pilar].usageCount += app.usageCount;
      acc[pilar].percentageSum += app.percentage;
      acc[pilar].count += 1;
      return acc;
    }, {} as Record<string, { name: string; pilar: string; usageCount: number; percentageSum: number; count: number; category: string }>);

    displayApps = Object.values(grouped).map(g => ({
      name: g.name,
      pilar: g.pilar,
      usageCount: g.usageCount,
      percentage: Math.min(100, Math.round(g.percentageSum / g.count)),
      category: g.category
    })).sort((a, b) => b.usageCount - a.usageCount);
  }

  // Filtrar localmente por búsqueda
  const filteredApps = displayApps.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.pilar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar según el estado sortOrder (Adopción)
  const sortedAndFilteredApps = [...filteredApps].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.percentage - a.percentage;
    } else {
      return a.percentage - b.percentage;
    }
  });

  const hasAreaFilter = selectedHeatmapArea && selectedHeatmapArea !== "Todas";
  const finalTitle = hasAreaFilter ? `Aplicaciones en ${selectedHeatmapArea}` : "Adopción de aplicaciones";

  return (
    <div className="rounded-md border border-neutral-raw-600/20 bg-white p-p-lg flex flex-col gap-p-md h-full shadow-sm">
      
      {/* Título de sección - Estilizado exactamente a Inter 13px / 500 / #374151 - Sentence Case (H4) */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-p-xs border-b border-neutral-raw-100">
        <h3 id="list-card-section-title" className="text-[13px] font-medium text-neutral-raw-700 font-sans tracking-wide">
          {finalTitle} ({viewLevel === "Aplicación" ? "por aplicación" : "por pilar"})
        </h3>
      </div>

      {/* Selector de nivel jerárquico */}
      <div className="flex w-full rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100">
        <button
          type="button"
          id="hierarchy-toggle-app"
          onClick={() => setViewLevel("Aplicación")}
          className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-all cursor-pointer ${
            viewLevel === "Aplicación"
              ? "bg-white text-neutral-raw-800 shadow-sm font-semibold"
              : "text-neutral-raw-600 hover:text-neutral-raw-800"
          }`}
          style={{ minHeight: "32px" }}
        >
          <AppWindow size={13} />
          <span>Aplicación</span>
        </button>
        <button
          type="button"
          id="hierarchy-toggle-pilar"
          onClick={() => setViewLevel("Pilar")}
          className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-all cursor-pointer ${
            viewLevel === "Pilar"
              ? "bg-white text-neutral-raw-800 shadow-sm font-semibold"
              : "text-neutral-raw-600 hover:text-neutral-raw-800"
          }`}
          style={{ minHeight: "32px" }}
        >
          <Layers size={13} />
          <span>Pilar</span>
        </button>
      </div>

      {/* Buscador de texto minimalista */}
      <div className="relative">
        <input 
          id="local-app-search-input"
          type="text"
          placeholder="Buscar aplicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs font-normal border border-neutral-raw-600/20 rounded-sm h-9 pl-3 pr-8 focus:outline-none focus:border-brand-500 bg-white"
        />
        {searchTerm && (
          <button 
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-raw-400 hover:text-neutral-raw-600 cursor-pointer p-1"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Banner de estado del filtro de área (H1 y H3 con touch target de 44px) */}
      {hasAreaFilter && (
        <div id="active-area-filter-banner" className="flex items-center justify-between bg-brand-50 border border-brand-200 px-3 py-1 bg-[#E6EFF6] rounded-sm text-xs font-normal text-brand-700 transition-all duration-150">
          <span className="truncate py-1">Mostrando apps de: <strong className="font-semibold">{selectedHeatmapArea}</strong></span>
          <button 
            type="button" 
            onClick={onClearAreaFilter}
            className="text-brand-700 hover:text-brand-900 transition-colors flex items-center justify-center rounded-sm hover:bg-neutral-raw-100"
            style={{ width: "44px", height: "44px", minWidth: "44px", minHeight: "44px" }}
            aria-label={`Quitar filtro ${selectedHeatmapArea}`}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Control de ordenamiento minimalista sin carga visual */}
      <div className="flex items-center justify-between text-[11px] text-neutral-raw-500 font-sans border-b border-neutral-raw-100 pb-1.5 mt-1 select-none">
        <div className="flex items-center gap-1.5 text-neutral-raw-400 ml-auto">
          <span>Adopción:</span>
          <button
            type="button"
            onClick={() => setSortOrder("desc")}
            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
              sortOrder === "desc"
                ? "text-brand-600 bg-brand-50/70 font-semibold"
                : "hover:text-neutral-raw-700 hover:bg-neutral-raw-50"
            }`}
          >
            Mayor a Menor
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setSortOrder("asc")}
            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
              sortOrder === "asc"
                ? "text-brand-600 bg-brand-50/70 font-semibold"
                : "hover:text-neutral-raw-700 hover:bg-neutral-raw-50"
            }`}
          >
            Menor a Mayor
          </button>
        </div>
      </div>

      {/* Listado de aplicaciones */}
      <div className="flex flex-col gap-2 min-h-[220px]">
        {sortedAndFilteredApps.length > 0 ? (
          sortedAndFilteredApps.map((app, index) => {
            const isRowSelected = selectedAppForHeatmap === app.name;
            const originalRank = displayApps.findIndex(x => x.name === app.name) + 1;
            const rankNumber = originalRank > 0 ? originalRank : index + 1;

            return (
              <div
                id={`app-row-${app.name.replace(/\s+/g, '-').toLowerCase()}`}
                key={app.name}
                className={`flex w-full items-center justify-between border rounded-lg transition-all duration-300 ${
                  isRowSelected
                    ? "bg-brand-50/50 border-brand-500 shadow-sm border-l-4 border-l-brand-500"
                    : "bg-white border-neutral-raw-600/20 hover:border-brand-500/50 hover:shadow-xs hover:-translate-y-0.5"
                }`}
              >
                {/* Botón principal (Acción: Alternar Filtro de Cobertura) */}
                <button
                  type="button"
                  aria-pressed={isRowSelected}
                  onClick={() => {
                    if (onSelectAppForHeatmap) {
                      onSelectAppForHeatmap(app.name === selectedAppForHeatmap ? "Todas" : app.name);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3.5 text-left focus:outline-none focus:bg-brand-50/20 rounded-lg transition-colors cursor-pointer group"
                  style={{ minHeight: "56px" }}
                  aria-label={`Alternar destaque de ${app.name} en visualizaciones`}
                >
                  {/* Nombre, pilar y Ranking Medal / Badge */}
                  <div className="flex items-center gap-3 overflow-hidden mr-3">
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-[13px] font-semibold leading-tight transition-colors ${
                        isRowSelected ? "text-brand-600" : "text-neutral-raw-800 group-hover:text-brand-500"
                      }`}>
                        {app.name}
                      </span>
                      {viewLevel !== "Pilar" && (
                        <div className="flex flex-wrap mt-1">
                          <span className="inline-flex items-center rounded-full bg-neutral-raw-100 text-neutral-raw-600 py-0.5 px-2 text-[10px] font-medium leading-none border border-neutral-raw-200/50">
                            {app.pilar}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porcentaje de progreso con mini gráfica (Sparkline) */}
                  {(() => {
                    const seed = app.percentage;
                    const nameSum = app.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const var1 = 1 + (nameSum % 3) * 0.05;
                    const var2 = 1 - ((nameSum + 2) % 3) * 0.04;

                    const p0 = Math.min(100, Math.max(5, Math.round(seed * 0.7 * var1)));
                    const p1 = Math.min(100, Math.max(5, Math.round(seed * 0.85 * var2)));
                    const p2 = Math.min(100, Math.max(5, Math.round(seed * 0.78 * var1)));
                    const p3 = Math.min(100, Math.max(5, Math.round(seed * 0.92 * var2)));
                    const p4 = seed;

                    const x0 = 2, y0 = 18 - (p0 / 100) * 16;
                    const x1 = 14, y1 = 18 - (p1 / 100) * 16;
                    const x2 = 26, y2 = 18 - (p2 / 100) * 16;
                    const x3 = 38, y3 = 18 - (p3 / 100) * 16;
                    const x4 = 50, y4 = 18 - (p4 / 100) * 16;

                    const lineD = `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;
                    const areaD = `M ${x0} 18 L ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} L ${x4} 18 Z`;
                    const diff = p4 - p0;
                    const isUp = diff >= 0;
                    const strokeColor = isUp ? "#10B981" : "#F43F5E";
                    const gradId = `grad-${app.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

                    return (
                       <div className="flex items-center gap-3 shrink-0 mr-1">
                        {/* Mini Sparkline Chart - compact sizing */}
                        <svg className="w-12 h-6 overflow-visible hidden sm:block" viewBox="0 0 54 20" aria-hidden="true">
                          <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Area fill */}
                          <path
                            d={areaD}
                            fill={`url(#${gradId})`}
                          />
                          {/* Line path */}
                          <path
                            d={lineD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Final point indicator with halo glow */}
                          <circle cx={x4} cy={y4} r="3" fill={strokeColor} stroke="#FFFFFF" strokeWidth="1" />
                        </svg>

                        {/* Percentage and Trend text with extra vertical space */}
                        <div className="flex flex-col items-end min-w-[50px] gap-1">
                          <span className="text-base font-extrabold text-neutral-raw-800 leading-none">
                            {app.percentage}%
                          </span>
                          <span className={`inline-flex items-center text-[10px] font-semibold leading-none ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {diff >= 0 ? '▲' : '▼'}{Math.abs(diff)}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-p-lg text-center border border-dashed border-neutral-raw-200 rounded-sm bg-neutral-raw-50 py-10">
            <Inbox className="text-neutral-raw-400 mb-2" size={32} />
            <p className="text-xs font-semibold text-neutral-raw-600">
              No se encontraron coincidencias
            </p>
            <p className="text-[12px] text-neutral-raw-500 mt-1 max-w-[200px]">
              Intenta reduciendo el nivel de filtrado o buscando otra palabra.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
