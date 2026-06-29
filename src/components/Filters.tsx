import React, { useState, useRef, useEffect } from "react";
import { X, RotateCcw, ChevronDown, Check } from "lucide-react";
import { businessUnits, appSelections } from "../data";

interface FiltersProps {
  timeframe: 'Mes' | 'Trimestre' | 'Año';
  setTimeframe: (t: 'Mes' | 'Trimestre' | 'Año') => void;
  selectedUnit: string;
  setSelectedUnit: (u: string) => void;
  selectedApp: string;
  setSelectedApp: (a: string) => void;
  resetAllFilters: () => void;
}

/**
 * [Organism] Panel de Filtros Globales (Período, Área y Aplicación)
 * Unifica los selectores en una única fila horizontal conforme a la heurística H7 y pautas minimalistas.
 * Integra multiselectores con checkboxes (H5 de prevención de errores) y chips independientes (H6).
 */
export const Filters = ({
  timeframe,
  setTimeframe,
  selectedUnit,
  setSelectedUnit,
  selectedApp,
  setSelectedApp,
  resetAllFilters,
}: FiltersProps) => {

  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);
  
  const unitRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns cuando el usuario hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unitRef.current && !unitRef.current.contains(event.target as Node)) {
        setIsUnitOpen(false);
      }
      if (appRef.current && !appRef.current.contains(event.target as Node)) {
        setIsAppOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validar si una aplicación es compatible con una unidad organizativa específica (Prevenir combinaciones con 0 datos)
  const isCompatible = (unit: string, app: string): boolean => {
    if (!unit || !app) return true;
    if (unit === "Todas" || app === "Todas") return true;

    const uLower = unit.toLowerCase();
    const aLower = app.toLowerCase();

    if (uLower.includes("recursos humanos")) {
      return ["biblioteca pisa", "productividad y oficina", "imágenes y videos", "exploración abierta"].some(x => aLower.includes(x));
    }
    if (uLower.includes("ti") || uLower.includes("transformación digital")) {
      return ["análisis de datos", "hada", "agentes especializados", "productividad y oficina", "exploración abierta"].some(x => aLower.includes(x));
    }
    if (uLower.includes("finanzas") || uLower.includes("logística")) {
      return ["análisis de datos", "productividad y oficina", "exploración abierta", "investigación"].some(x => aLower.includes(x));
    }
    if (uLower.includes("calidad") || uLower.includes("manufactura")) {
      return ["biblioteca pisa", "análisis de datos", "productividad y oficina", "investigación", "hada", "agentes especializados"].some(x => aLower.includes(x));
    }
    return true; // por defecto compatible
  };

  const isAppCompatibleWithSelection = (app: string): boolean => {
    if (selectedUnit === "Todas" || app === "Todas") return true;
    const currentUnits = selectedUnit.split(",").map(u => u.trim());
    return currentUnits.some(unit => isCompatible(unit, app));
  };

  const isModified = timeframe !== "Mes" || selectedUnit !== "Todas" || selectedApp !== "Todas";

  const currentUnits = selectedUnit === "Todas" ? [] : selectedUnit.split(",").map(u => u.trim());
  const currentApps = selectedApp === "Todas" ? [] : selectedApp.split(",").map(a => a.trim());

  const handleUnitToggle = (unit: string) => {
    if (unit === "Todas") {
      setSelectedUnit("Todas");
      // Si el reset de unidades provoca incompatibilidades con las actuales aplicaciones,
      // resetear las aplicaciones no compatibles a "Todas"
      const activeApps = selectedApp === "Todas" ? [] : selectedApp.split(",").map(a => a.trim());
      const filteredApps = activeApps.filter(app => isCompatible("Todas", app));
      if (filteredApps.length === 0) {
        setSelectedApp("Todas");
      } else if (filteredApps.length !== activeApps.length) {
        setSelectedApp(filteredApps.join(", "));
      }
      return;
    }

    let newUnits: string[];
    if (currentUnits.includes(unit)) {
      newUnits = currentUnits.filter(u => u !== unit);
    } else {
      newUnits = [...currentUnits, unit];
    }

    const finalUnitStr = newUnits.length === 0 ? "Todas" : newUnits.join(", ");
    setSelectedUnit(finalUnitStr);

    // Ajustar aplicaciones seleccionadas si se volvieron incompatibles con TODAS las nuevas unidades seleccionadas
    if (finalUnitStr !== "Todas") {
      const activeApps = selectedApp === "Todas" ? [] : selectedApp.split(",").map(a => a.trim());
      const filteredApps = activeApps.filter(app => 
        newUnits.some(u => isCompatible(u, app))
      );
      if (filteredApps.length === 0 && activeApps.length > 0) {
        setSelectedApp("Todas");
      } else if (filteredApps.length !== activeApps.length) {
        setSelectedApp(filteredApps.length === 0 ? "Todas" : filteredApps.join(", "));
      }
    }
  };

  const handleAppToggle = (app: string) => {
    if (app === "Todas") {
      setSelectedApp("Todas");
      return;
    }

    let newApps: string[];
    if (currentApps.includes(app)) {
      newApps = currentApps.filter(a => a !== app);
    } else {
      newApps = [...currentApps, app];
    }

    setSelectedApp(newApps.length === 0 ? "Todas" : newApps.join(", "));
  };

  const getUnitDisplayLabel = () => {
    if (currentUnits.length === 0) return "Todas las áreas";
    if (currentUnits.length === 1) return currentUnits[0];
    return `${currentUnits.length} áreas seleccionadas`;
  };

  const getAppDisplayLabel = () => {
    if (currentApps.length === 0) return "Todas las aplicaciones";
    if (currentApps.length === 1) return currentApps[0];
    return `${currentApps.length} aplicaciones seleccionadas`;
  };

  return (
    <section 
      id="global-filters"
      aria-label="Filtros principales"
      className="sticky top-0 z-40 w-full flex flex-col gap-3 bg-white border-b border-neutral-raw-600/20 py-3 px-p-md tablet:px-p-lg shadow-sm rounded-none animate-fadeIn"
    >
      {/* Filters Selectors Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-p-md">
        
        <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-p-md flex-1">
          {/* Selector 1: Período Temporal */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-neutral-raw-700">Período</span>
            <div 
              role="group"
              aria-label="Seleccionar período"
              className="flex rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100"
              style={{ height: "36px", minWidth: "180px" }}
            >
              {(['Mes', 'Trimestre', 'Año'] as const).map((period) => {
                const isActive = timeframe === period;
                return (
                  <button
                    id={`filter-timeframe-${period}`}
                    key={period}
                    type="button"
                    onClick={() => setTimeframe(period)}
                    className={`flex-1 rounded-sm text-xs font-medium px-2.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand-500 text-white font-semibold"
                        : "text-neutral-raw-600 hover:text-neutral-raw-800 hover:bg-neutral-raw-200/50"
                    }`}
                    style={{ minHeight: "30px" }}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupo: Filtros de Selección de Área y Aplicación */}
          <div className="flex flex-col sm:flex-row gap-p-md justify-start w-full md:max-w-[65%] flex-1 animate-fadeIn">
            
            {/* Selector 2: Multiselector de Unidad Organizativa (Área) */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px] relative" ref={unitRef}>
              <span className="text-xs font-semibold text-neutral-raw-700 font-sans">Área o unidad</span>
              <button
                id="unit-selector-btn"
                type="button"
                onClick={() => {
                  setIsUnitOpen(!isUnitOpen);
                  setIsAppOpen(false);
                }}
                className="w-full h-9 rounded-sm border border-neutral-raw-600/20 bg-white px-3 text-xs font-semibold text-neutral-raw-800 focus:border-brand-500 focus:outline-none cursor-pointer flex items-center justify-between select-none shadow-sm hover:border-brand-500/50 transition-colors"
              >
                <span className="truncate pr-2 font-sans">{getUnitDisplayLabel()}</span>
                <ChevronDown size={14} className={`text-neutral-raw-500 transition-transform duration-200 ${isUnitOpen ? "rotate-180" : ""}`} />
              </button>

              {isUnitOpen && (
                <div 
                  id="unit-dropdown"
                  className="absolute left-0 top-[105%] w-full bg-white border border-neutral-raw-600/20 shadow-lg rounded-sm z-50 py-1 max-h-60 overflow-y-auto animate-fadeIn"
                >
                  {/* Opción 'Todas' */}
                  <div
                    onClick={() => handleUnitToggle("Todas")}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-brand-50/50 cursor-pointer select-none border-b border-neutral-raw-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUnit === "Todas"}
                      onChange={() => {}}
                      className="rounded-xs border-neutral-raw-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans">Todas las áreas</span>
                  </div>

                  {/* Resto de unidades */}
                  {businessUnits.filter(u => u !== "Todas").map((unit) => {
                    const isChecked = currentUnits.includes(unit);
                    return (
                      <div
                        key={unit}
                        onClick={() => handleUnitToggle(unit)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-brand-50/50 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded-xs border-neutral-raw-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-sans">{unit}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selector 3: Multiselector de Aplicación inteligente */}
            <div className="flex flex-col gap-1 flex-1 min-w-[210px] relative" ref={appRef}>
              <span className="text-xs font-semibold text-neutral-raw-700 font-sans">Aplicación inteligente</span>
              <button
                id="app-selector-btn"
                type="button"
                onClick={() => {
                  setIsAppOpen(!isAppOpen);
                  setIsUnitOpen(false);
                }}
                className="w-full h-9 rounded-sm border border-neutral-raw-600/20 bg-white px-3 text-xs font-semibold text-neutral-raw-800 focus:border-brand-500 focus:outline-none cursor-pointer flex items-center justify-between select-none shadow-sm hover:border-neutral-raw-300 transition-colors"
              >
                <span className="truncate pr-2 font-sans">{getAppDisplayLabel()}</span>
                <ChevronDown size={14} className={`text-neutral-raw-500 transition-transform duration-200 ${isAppOpen ? "rotate-180" : ""}`} />
              </button>

              {isAppOpen && (
                <div 
                  id="app-dropdown"
                  className="absolute left-0 top-[105%] w-full bg-white border border-neutral-raw-600/20 shadow-lg rounded-sm z-50 py-1 max-h-60 overflow-y-auto animate-fadeIn"
                >
                  {/* Opción 'Todas' */}
                  <div
                    onClick={() => handleAppToggle("Todas")}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-brand-50/50 cursor-pointer select-none border-b border-neutral-raw-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedApp === "Todas"}
                      onChange={() => {}}
                      className="rounded-xs border-neutral-raw-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans">Todas las aplicaciones</span>
                  </div>

                  {/* Resto de aplicaciones con validación de compatibilidad (H5) */}
                  {appSelections.filter(a => a !== "Todas").map((app) => {
                    const isChecked = currentApps.includes(app);
                    const compatible = isAppCompatibleWithSelection(app);

                    return (
                      <div
                        key={app}
                        onClick={() => {
                          if (compatible) handleAppToggle(app);
                        }}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold select-none ${
                          compatible 
                            ? "hover:bg-brand-50/50 cursor-pointer text-neutral-raw-800" 
                            : "text-neutral-raw-400 cursor-not-allowed bg-neutral-raw-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!compatible}
                            onChange={() => {}}
                            className={`rounded-xs border-neutral-raw-300 text-brand-600 focus:ring-brand-500 w-4 h-4 ${
                              compatible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                            }`}
                          />
                          <span className="font-sans">{app}</span>
                        </div>
                        {!compatible && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full scale-90 origin-right font-sans">
                            Incompatible
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Chips of Active Filters (H6) */}
      {isModified && (
        <div className="flex flex-wrap items-center gap-2 pt-p-xs border-t border-neutral-raw-100">
          <span className="text-[11px] font-medium text-neutral-raw-500">Filtros activos:</span>
          
          {timeframe !== "Mes" && (
            <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full border border-brand-200/60 shadow-sm transition-all hover:bg-brand-100/50">
              <span className="font-sans">Período: {timeframe}</span>
              <button 
                type="button" 
                onClick={() => setTimeframe("Mes")}
                className="w-4 h-4 hover:bg-brand-200 text-brand-700 hover:text-brand-900 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{ minWidth: "16px", minHeight: "16px" }}
                aria-label="Quitar filtro período"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {/* Render individual chips for each active Area */}
          {currentUnits.map((unit) => (
            <div 
              key={unit} 
              className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full border border-brand-200/60 shadow-sm transition-all hover:bg-brand-100/50 animate-fadeIn"
            >
              <span className="font-sans">Área: {unit}</span>
              <button 
                type="button" 
                onClick={() => {
                  const remaining = currentUnits.filter(u => u !== unit);
                  setSelectedUnit(remaining.length === 0 ? "Todas" : remaining.join(", "));
                }}
                className="w-4 h-4 hover:bg-brand-200 text-brand-700 hover:text-brand-900 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{ minWidth: "16px", minHeight: "16px" }}
                aria-label={`Quitar filtro área ${unit}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {/* Render individual chips for each active App */}
          {currentApps.map((app) => (
            <div 
              key={app} 
              className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full border border-brand-200/60 shadow-sm transition-all hover:bg-brand-100/50 animate-fadeIn"
            >
              <span className="font-sans">Aplicación: {app}</span>
              <button 
                type="button" 
                onClick={() => {
                  const remaining = currentApps.filter(a => a !== app);
                  setSelectedApp(remaining.length === 0 ? "Todas" : remaining.join(", "));
                }}
                className="w-4 h-4 hover:bg-brand-200 text-brand-700 hover:text-brand-900 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{ minWidth: "16px", minHeight: "16px" }}
                aria-label={`Quitar filtro aplicación ${app}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {/* Botón de restablecer filtros integrado en la barra de filtros activos */}
          <button
            id="reset-filters-btn"
            type="button"
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50/50 bg-transparent py-1 px-2.5 rounded-sm focus:outline-none transition-all cursor-pointer whitespace-nowrap ml-auto"
          >
            <X size={14} className="stroke-[2.5]" />
            <span>Restablecer filtros</span>
          </button>

        </div>
      )}

    </section>
  );
};
