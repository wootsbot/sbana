import { useState, useTransition, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ActiveTab } from './components/Header';
import { Filters } from './components/Filters';
import { MetricsBar } from './components/MetricsBar';
import { ListCard } from './components/ListCard';
import { ChartCard } from './components/ChartCard';
import { DetailModal } from './components/DetailModal';
import { PatternsView } from './components/PatternsView';
import { ComparativeAnalysis } from './components/ComparativeAnalysis';
import { getDashboardData, AppItem } from './data';

/**
 * [Page] SABIA Dashboard Main Assembly page.
 * Implements high-fidelity styling (grayscale outline + brand/sky accents), custom breakpoints, and 4px-multiple grid system.
 */
export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("Adopción");

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("adeavila@corpcab.com.mx");
  const [loginPassword, setLoginPassword] = useState<string>("••••••••");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Filter States
  const [timeframe, setTimeframe] = useState<'Mes' | 'Trimestre' | 'Año'>("Mes");
  const [selectedAccessArea, setSelectedAccessArea] = useState<string>("Todos");
  const [selectedUnit, setSelectedUnit] = useState<string>("Todas");
  const [selectedApp, setSelectedApp] = useState<string>("Todas");

  // Heatmap Selected Area state for filtering ListCard
  const [selectedHeatmapArea, setSelectedHeatmapArea] = useState<string>("Todas");

  // Selected App state for filtering the Heatmap Areas
  const [selectedAppForHeatmap, setSelectedAppForHeatmap] = useState<string>("Todas");

  // KPI Visualization control state
  const [showKpis, setShowKpis] = useState<boolean>(true);

  // Detail Modal popup trigger
  const [selectedAppDetail, setSelectedAppDetail] = useState<AppItem | null>(null);

  // Transition optimization state
  const [, startTransition] = useTransition();

  // Load backend-ready computed statistics based on filters
  const currentData = getDashboardData(timeframe, selectedAccessArea, selectedUnit, selectedApp);

  const filterSummary = `${timeframe} • ${selectedUnit} • ${selectedApp}`;

  const resetAllFilters = () => {
    setTimeframe("Mes");
    setSelectedAccessArea("Todos");
    setSelectedUnit("Todas");
    setSelectedApp("Todas");
    setSelectedHeatmapArea("Todas");
    setSelectedAppForHeatmap("Todas");
  };

  // Dynamically compute heatmap areas percentage based on the selected application
  const filteredAreasForHeatmap = useMemo(() => {
    const rawAreas = currentData.topAreas;
    if (selectedAppForHeatmap === "Todas") {
      return rawAreas;
    }

    const appLower = selectedAppForHeatmap.toLowerCase();
    return rawAreas.map((area, index) => {
      const areaLower = area.name.toLowerCase();
      let factor = 1.0;

      // Realistic variation of app adoption across different business departments
      if (appLower.includes("biblioteca pisa")) {
        if (areaLower.includes("humanos")) factor = 1.15;
        else if (areaLower.includes("calidad")) factor = 1.25;
        else if (areaLower.includes("farma")) factor = 1.1;
        else factor = 0.55;
      } else if (appLower.includes("hada") || appLower.includes("agentes especializados")) {
        if (areaLower.includes("ti")) factor = 1.35;
        else if (areaLower.includes("manufactura")) factor = 1.15;
        else if (areaLower.includes("digital")) factor = 1.3;
        else factor = 0.4;
      } else if (appLower.includes("análisis de datos") || appLower.includes("analisis de datos")) {
        if (areaLower.includes("finanzas")) factor = 1.35;
        else if (areaLower.includes("ti")) factor = 1.25;
        else if (areaLower.includes("digital")) factor = 1.15;
        else if (areaLower.includes("calidad")) factor = 1.1;
        else factor = 0.5;
      } else if (appLower.includes("productividad")) {
        factor = 0.95; // Wide overall baseline
      } else if (appLower.includes("abierta")) {
        if (areaLower.includes("digital")) factor = 1.25;
        else if (areaLower.includes("electrolit")) factor = 1.15;
        else factor = 0.85;
      } else {
        factor = 0.7;
      }

      // Maintain high quality with bounds checking [5%, 100%]
      const basePct = area.percentage;
      const computedPct = Math.min(100, Math.max(5, Math.round(basePct * factor)));

      // Add small individual variation based on layout index so areas look dynamic
      const finalPct = Math.min(100, Math.max(5, computedPct + (index % 3 - 1) * 3));

      return {
        ...area,
        percentage: finalPct
      };
    }).sort((a, b) => a.percentage - b.percentage);
  }, [selectedAppForHeatmap, currentData.topAreas]);

  // Dynamically compute apps matching the selected heatmap area filter (Heuristic 3: User Control & Freedom)
  const filteredAppsForList = useMemo(() => {
    const listApps = currentData.allAppsOrdered;
    if (selectedHeatmapArea === "Todas") {
      return listApps;
    }

    // Set of allowed applications per area to simulate realistic area-specific adoption
    const areaLower = selectedHeatmapArea.toLowerCase();
    let allowedAppNames: string[] = [];
    if (areaLower.includes("recursos humanos")) {
      allowedAppNames = ["biblioteca Pisa", "Productividad y oficina", "Imágenes y videos", "Exploración abierta"];
    } else if (areaLower.includes("ti")) {
      allowedAppNames = ["análisis de datos", "Hada", "Agentes especializados", "Productividad y oficina"];
    } else if (areaLower.includes("finanzas")) {
      allowedAppNames = ["análisis de datos", "Productividad y oficina", "Exploración abierta", "Investigación"];
    } else if (areaLower.includes("digital")) { // Transformación digital
      allowedAppNames = ["Exploración abierta", "análisis de datos", "Hada", "Agentes especializados"];
    } else if (areaLower.includes("manufactura")) {
      allowedAppNames = ["Hada", "Agentes especializados", "Productividad y oficina", "Exploración abierta"];
    } else if (areaLower.includes("calidad")) {
      allowedAppNames = ["biblioteca Pisa", "análisis de datos", "Productividad y oficina", "Investigación"];
    } else if (areaLower.includes("farma") || areaLower.includes("electrolit")) {
      allowedAppNames = ["Exploración abierta", "biblioteca Pisa", "Productividad y oficina"];
    } else {
      allowedAppNames = listApps.slice(0, 4).map(a => a.name);
    }

    return listApps
      .filter(app => allowedAppNames.includes(app.name))
      .map((app, index) => {
        // Boost percentages slightly differently per Area to feel dynamic and cohesive
        const seed = areaLower.length + index;
        const percentage = Math.min(100, Math.max(10, Math.round(app.percentage * (0.85 + (seed % 4) * 0.05))));
        return {
          ...app,
          percentage
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [selectedHeatmapArea, currentData.allAppsOrdered]);

  if (isLoggingOut) {
    return (
      <div className="min-h-screen w-full bg-neutral-raw-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-neutral-raw-800">Cerrando sesión de manera segura</h3>
            <p className="text-[11px] text-neutral-raw-400 font-medium">Por favor, espera un momento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-neutral-raw-200 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-400/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[420px] bg-white border border-neutral-raw-200 rounded-2xl shadow-xl p-8 relative z-10 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex flex-col items-center gap-1 mb-8">
              <span className="text-2xl font-bold tracking-tight text-neutral-raw-900 leading-none">
                SabIA
              </span>
              <span className="text-[10px] text-brand-600 font-bold tracking-wider uppercase mt-1">
                Portal de Adopción
              </span>
            </div>

            {/* Avatar Profile */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center font-bold text-white text-xl shadow-md mb-3 border border-brand-400/20">
              AA
            </div>
            
            <h2 className="text-lg font-bold text-neutral-raw-800 mb-1">
              ¡Hola de nuevo, Adrián!
            </h2>
            <p className="text-xs text-neutral-raw-400 mb-8">
              Introduce tus credenciales para acceder a la plataforma
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoggingIn(true);
                setTimeout(() => {
                  setIsLoggingIn(false);
                  setIsAuthenticated(true);
                }, 900);
              }}
              className="w-full flex flex-col gap-4 text-left"
            >
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-raw-200 bg-neutral-raw-50 text-neutral-raw-700 text-xs font-medium focus:border-brand-500 focus:bg-white focus:outline-hidden transition-all duration-200"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <a href="#" className="text-[10px] font-semibold text-brand-600 hover:text-brand-700">
                    ¿La olvidaste?
                  </a>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-raw-200 bg-neutral-raw-50 text-neutral-raw-700 text-xs font-medium focus:border-brand-500 focus:bg-white focus:outline-hidden transition-all duration-200"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-brand-500/10 cursor-pointer disabled:opacity-80"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-raw-200 font-sans text-neutral-raw-800 flex flex-row">
      
      {/* 1. Navigation Sidebar Module */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => {
          setIsLoggingOut(true);
          setTimeout(() => {
            setIsLoggingOut(false);
            setIsAuthenticated(false);
          }, 1200);
        }}
      />
      
      <div className="flex flex-col flex-grow">
        
        {/* Secondary Navbar of Filters */}
        <Filters 
          timeframe={timeframe}
          setTimeframe={(t) => startTransition(() => setTimeframe(t))}
          selectedUnit={selectedUnit}
          setSelectedUnit={(u) => startTransition(() => setSelectedUnit(u))}
          selectedApp={selectedApp}
          setSelectedApp={(a) => startTransition(() => setSelectedApp(a))}
          resetAllFilters={resetAllFilters}
        />

      {/* 3. Core Workspace Section */}
      <main className="w-full max-w-none min-h-[calc(100vh-4rem)] px-p-md py-p-md tablet:px-p-lg tablet:py-p-lg flex flex-col flex-grow gap-p-md">
        
        <div className="flex flex-col flex-grow gap-p-md">

          {/* Conditional Rendering based on selected tab */}
          {activeTab === "Adopción" && (
            <div className="flex flex-col flex-grow gap-p-md rounded-sm">
              
              {/* KPI metrics bar rendered directly */}
              <MetricsBar metrics={currentData.metrics} viewMode="extended" />

              <div className="flex flex-col flex-grow lg:flex-row gap-p-md items-stretch">
                {/* Area Distribution block (Heatmap) - covers 65% width - SWAPPED */}
                <div className="w-full lg:w-[65%] flex flex-col flex-grow min-h-0">
                  <ChartCard 
                    areas={filteredAreasForHeatmap} 
                    apps={filteredAppsForList}
                    selectedUnit={selectedUnit}
                    selectedHeatmapArea={selectedHeatmapArea}
                    onSelectHeatmapArea={setSelectedHeatmapArea}
                    onSelectUnit={setSelectedUnit}
                  />
                </div>

                {/* Applications block - covers 35% width - SWAPPED */}
                <div className="w-full lg:w-[35%] flex flex-col flex-grow min-h-0">
                  <ListCard 
                    title="Adopción" 
                    apps={filteredAppsForList}
                    onSelectApp={(app) => setSelectedAppDetail(app)}
                    selectedHeatmapArea={selectedHeatmapArea}
                    onClearAreaFilter={() => setSelectedHeatmapArea("Todas")}
                    selectedAppForHeatmap={selectedAppForHeatmap}
                    onSelectAppForHeatmap={setSelectedAppForHeatmap}
                  />
                </div>
              </div>

              {/* Detailed Comparative Analysis Module */}
              <ComparativeAnalysis 
                data={currentData}
                timeframe={timeframe}
                selectedUnit={selectedUnit}
                selectedApp={selectedApp}
              />
            </div>
          )}

          {activeTab === "Patrones de uso" && (
            <div>
              <PatternsView data={currentData} />
            </div>
          )}

        </div>

      </main>

      {/* 5. Detailed App Overlaid slide details (Interactive Popup) */}
      <DetailModal 
        app={selectedAppDetail}
        onClose={() => setSelectedAppDetail(null)}
      />
      </div>
    </div>
  );
}
