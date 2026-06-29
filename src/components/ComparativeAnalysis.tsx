import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardData, AreaItem, AppItem } from "../data";
import { 
  Columns, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  Flame, 
  Activity, 
  CheckSquare, 
  Square, 
  ArrowRightLeft,
  Info
} from "lucide-react";

interface ComparativeAnalysisProps {
  data: DashboardData;
  timeframe: 'Mes' | 'Trimestre' | 'Año';
  selectedUnit: string;
  selectedApp: string;
}

// Cohort color specs for cohesive data visualization
interface CohortSpec {
  id: "intensivo" | "regular" | "ocasional" | "inactivo";
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  stroke: string;
  desc: string;
}

const COHORT_SPECS: Record<string, CohortSpec> = {
  intensivo: {
    id: "intensivo",
    label: "Intensivo (> 20 consultas)",
    color: "bg-brand-500",
    bgColor: "bg-brand-50",
    textColor: "text-brand-700 border-brand-200",
    stroke: "#0066FF",
    desc: "Más de 20 consultas. Usuarios expertos y de alta frecuencia que lideran la adopción de IA."
  },
  regular: {
    id: "regular",
    label: "Regular (10 - 20 consultas)",
    color: "bg-sky-500",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700 border-sky-200",
    stroke: "#0EA5E9",
    desc: "Entre 10 y 20 consultas. Usuarios recurrentes que integran la herramienta en su flujo cotidiano."
  },
  ocasional: {
    id: "ocasional",
    label: "Ocasional (1 - 10 consultas)",
    color: "bg-slate-500",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700 border-slate-200",
    stroke: "#64748B",
    desc: "Entre 1 y 10 consultas. Accesos esporádicos o introductorios para consultas de baja complejidad."
  },
  inactivo: {
    id: "inactivo",
    label: "Inactivo (0 consultas)",
    color: "bg-slate-300",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600 border-slate-200",
    stroke: "#94A3B8",
    desc: "Cero consultas. Cuentas habilitadas con acceso aprobado que no registran actividad."
  }
};

export const ComparativeAnalysis = ({ data, timeframe, selectedUnit, selectedApp }: ComparativeAnalysisProps) => {
  // 1. Interactive Switch States
  const [analysisMode, setAnalysisMode] = useState<'Area' | 'App'>("Area");
  
  // Toggles for the line chart (allowing users to focus on specific cohorts)
  const [activeCohorts, setActiveCohorts] = useState<Record<string, boolean>>({
    intensivo: true,
    regular: true,
    ocasional: true,
    inactivo: true
  });

  // State to track which specific Area or App is selected for Card Detail view
  const [selectedFocusItem, setSelectedFocusItem] = useState<string>("Promedio");

  // Current resolution toggle state for historical trend (Semana, Mes)
  const [resolution, setResolution] = useState<'Semana' | 'Mes'>('Semana');

  // Reset focus item when mode toggles
  const handleModeChange = (newMode: 'Area' | 'App') => {
    setAnalysisMode(newMode);
    setSelectedFocusItem("Promedio");
  };

  // Helper formula to compute stable, deterministic cohort percentages depending on the item name
  const computePercentages = (name: string, isApp: boolean) => {
    // A simple hash generator from name to keep values consistent
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    
    // Vary bases somewhat realistically
    let baseIntensivo = 15 + (seed % 15); // 15% - 30%
    let baseRegular = 30 + (seed % 20);   // 30% - 50%
    let baseOcasional = 15 + ((seed >> 2) % 15); // 15% - 30%
    
    // Core adjustments for business relevance
    if (isApp) {
      if (name.includes("Exploración") || name.includes("Pisa")) {
        baseIntensivo += 12;
        baseRegular += 5;
      }
      if (name.includes("Imágenes") || name.includes("Investigación")) {
        baseIntensivo -= 8;
        baseOcasional += 10;
      }
    } else {
      if (name.includes("digital") || name.includes("TI")) {
        baseIntensivo += 15;
      }
      if (name.includes("Comercial") || name.includes("Logística")) {
        baseRegular += 10;
        baseIntensivo -= 4;
      }
    }

    const total = baseIntensivo + baseRegular + baseOcasional;
    const intensivo = Math.min(60, Math.max(5, baseIntensivo));
    const regular = Math.min(65, Math.max(10, baseRegular));
    const ocasional = Math.min(45, Math.max(5, baseOcasional));
    const inactivo = Math.max(2, 100 - (intensivo + regular + ocasional));

    return { intensivo, regular, ocasional, inactivo };
  };

  // Extract list of areas or apps based on the filters
  const categoryItems = useMemo(() => {
    if (analysisMode === "Area") {
      return data.topAreas.map(area => ({
        name: area.name,
        totalUsers: area.totalUsers,
        percentages: computePercentages(area.name, false)
      }));
    } else {
      return data.allAppsOrdered.map(app => ({
        name: app.name,
        totalUsers: Math.round(app.usageCount / 8) || 50, // proxies total authorized users
        percentages: computePercentages(app.name, true)
      }));
    }
  }, [analysisMode, data.topAreas, data.allAppsOrdered]);

  // Compute aggregate averages across currently listed units for "Promedio"
  const averagePercentages = useMemo(() => {
    if (categoryItems.length === 0) {
      return { intensivo: 22, regular: 43, ocasional: 23, inactivo: 12 };
    }
    const sum = categoryItems.reduce((acc, item) => {
      acc.intensivo += item.percentages.intensivo;
      acc.regular += item.percentages.regular;
      acc.ocasional += item.percentages.ocasional;
      acc.inactivo += item.percentages.inactivo;
      return acc;
    }, { intensivo: 0, regular: 0, ocasional: 0, inactivo: 0 });

    const total = categoryItems.length;
    return {
      intensivo: Math.round(sum.intensivo / total),
      regular: Math.round(sum.regular / total),
      ocasional: Math.round(sum.ocasional / total),
      inactivo: Math.round(sum.inactivo / total)
    };
  }, [categoryItems]);

  // Decouple percentage based on current focus selection
  const activeFocusPercentages = useMemo(() => {
    if (selectedFocusItem === "Promedio") {
      return averagePercentages;
    }
    const found = categoryItems.find(item => item.name === selectedFocusItem);
    return found ? found.percentages : averagePercentages;
  }, [selectedFocusItem, categoryItems, averagePercentages]);

  // Total users for the cards
  const activeFocusTotalUsers = useMemo(() => {
    if (selectedFocusItem === "Promedio") {
      return categoryItems.reduce((sum, item) => sum + item.totalUsers, 0);
    }
    const found = categoryItems.find(item => item.name === selectedFocusItem);
    return found ? found.totalUsers : 100;
  }, [selectedFocusItem, categoryItems]);

  // Toggle active cohort on line chart / column highlight
  const toggleCohort = (cohortId: string) => {
    setActiveCohorts(prev => ({
      ...prev,
      [cohortId]: !prev[cohortId]
    }));
  };

  // Cohort Behavior Over Time Data
  const lineChartTimeline = useMemo(() => {
    const timelinePeriods = resolution === 'Semana'
        ? ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"]
        : ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"];

    return timelinePeriods.map((label, idx) => {
      let trendFactor = 1.0;
      if (idx === 1) trendFactor = 1.04;
      if (idx === 2) trendFactor = 1.12;
      if (idx === 3) trendFactor = 1.18;
      if (idx === 4) trendFactor = 1.25;
      if (idx === 5) trendFactor = 1.28;

      const pInt = Math.min(100, Math.round(activeFocusPercentages.intensivo * trendFactor));
      const pReg = Math.min(100, Math.round(activeFocusPercentages.regular * (1 + (idx * 0.025))));
      const pOca = Math.max(0, Math.round(activeFocusPercentages.ocasional * (1 - (idx * 0.045))));
      const pIna = Math.max(0, 100 - (pInt + pReg + pOca));

      return {
        label,
        intensivo: pInt,
        regular: pReg,
        ocasional: pOca,
        inactivo: pIna
      };
    });
  }, [resolution, activeFocusPercentages]);

  // Max value for line chart scaling (always 100%)
  const maxPctValue = 100;
  const graphWidth = 600;
  const graphHeight = 180;
  const paddingX = 45;
  const paddingY = 20;

  // Custom coordinate calculation for SVG path
  const getLineCoordinates = (key: 'intensivo' | 'regular' | 'ocasional' | 'inactivo') => {
    return lineChartTimeline.map((item, idx) => {
      const x = paddingX + (idx * (graphWidth - 2 * paddingX)) / (lineChartTimeline.length - 1);
      const val = item[key];
      const y = graphHeight - paddingY - ((val / maxPctValue) * (graphHeight - 2 * paddingY));
      return { x, y, value: val };
    });
  };

  // Custom coordinate calculation for stacked area chart
  const getStackedCoordinates = (cohortKey: 'intensivo' | 'regular' | 'ocasional' | 'inactivo') => {
    return lineChartTimeline.map((item, idx) => {
      const x = paddingX + (idx * (graphWidth - 2 * paddingX)) / (lineChartTimeline.length - 1);
      
      // Calculate cumulative sum up to this cohort key in a deterministic stack order:
      // Bottom: 'inactivo', then 'ocasional', then 'regular', and Top: 'intensivo'
      let sum = 0;
      const cohortOrder = ['inactivo', 'ocasional', 'regular', 'intensivo'] as const;
      
      for (const key of cohortOrder) {
        if (activeCohorts[key]) {
          sum += item[key];
        }
        if (key === cohortKey) {
          break;
        }
      }
      
      const val = Math.min(100, sum);
      const y = graphHeight - paddingY - ((val / maxPctValue) * (graphHeight - 2 * paddingY));
      return { x, y, value: val };
    });
  };

  // Custom coordinate calculation for SVG path of the total cumulative sum of active cohorts
  const getTotalLineCoordinates = () => {
    return lineChartTimeline.map((item, idx) => {
      const x = paddingX + (idx * (graphWidth - 2 * paddingX)) / (lineChartTimeline.length - 1);
      let sum = 0;
      if (activeCohorts.intensivo) sum += item.intensivo;
      if (activeCohorts.regular) sum += item.regular;
      if (activeCohorts.ocasional) sum += item.ocasional;
      if (activeCohorts.inactivo) sum += item.inactivo;
      const val = Math.min(100, sum);
      const y = graphHeight - paddingY - ((val / maxPctValue) * (graphHeight - 2 * paddingY));
      return { x, y, value: val };
    });
  };

  const getSvgPathStr = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const getSvgAreaPathStr = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0].x} ${graphHeight - paddingY}`;
    d += ` L ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    d += ` L ${coords[coords.length - 1].x} ${graphHeight - paddingY}`;
    d += " Z";
    return d;
  };

  // 5. Cross Relational Ranking of App usage by Area (or Area usage by App)
  const relationalRankings = useMemo(() => {
    let hash = 0;
    const nameToUse = selectedFocusItem;
    for (let i = 0; i < nameToUse.length; i++) {
      hash = nameToUse.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    if (analysisMode === "Area") {
      // 🏢 Mode: Show ranked Applications for the selected Area
      const apps = data.allAppsOrdered;
      
      const rankedList = apps.map((app, idx) => {
        let baseQueries = Math.round(app.usageCount / 8);
        
        // Custom affinity adjustments per area to make the mockup look realistically distributed
        if (nameToUse === "Recursos Humanos") {
          if (app.name.toLowerCase().includes("biblioteca") || app.name.toLowerCase().includes("oficina")) {
            baseQueries = Math.round(baseQueries * 2.3);
          } else if (app.name.toLowerCase().includes("análisis")) {
            baseQueries = Math.round(baseQueries * 0.4);
          }
        } else if (nameToUse === "TI" || nameToUse === "Transformación digital") {
          if (app.name.toLowerCase().includes("agentes") || app.name.toLowerCase().includes("análisis") || app.name.toLowerCase().includes("hada")) {
            baseQueries = Math.round(baseQueries * 2.5);
          }
        } else if (nameToUse === "Finanzas") {
          if (app.name.toLowerCase().includes("análisis") || app.name.toLowerCase().includes("oficina")) {
            baseQueries = Math.round(baseQueries * 1.9);
          }
        } else {
          // Generic randomized variance for other areas
          baseQueries = Math.round(baseQueries * (0.65 + ((seed + idx * 4) % 10) * 0.12));
        }

        // Apply timeframe scale
        if (timeframe === "Trimestre") baseQueries = Math.round(baseQueries * 3.0);
        if (timeframe === "Año") baseQueries = Math.round(baseQueries * 11.5);

        // Compute estimate of queries done by intensive users (intensive users do 45% - 75% of queries)
        const intensiveSharePct = Math.min(85, Math.max(25, 45 + ((seed + idx * 7) % 31))); 
        const queriesByIntensive = Math.round(baseQueries * (intensiveSharePct / 100));

        return {
          name: app.name,
          totalQueries: Math.max(12, baseQueries),
          intensivePct: intensiveSharePct,
          queriesByIntensive: Math.max(5, queriesByIntensive),
          percentageOfMax: 100
        };
      });

      const sorted = rankedList.sort((a, b) => b.totalQueries - a.totalQueries);
      const maxVal = sorted[0]?.totalQueries || 100;
      return sorted.map(item => ({
        ...item,
        percentageOfMax: Math.round((item.totalQueries / maxVal) * 100)
      }));

    } else {
      // 📲 Mode: Show ranked Areas using the selected Application
      const areas = data.topAreas;

      const rankedList = areas.map((area, idx) => {
        let baseQueries = Math.round(area.totalUsers * 4.2);

        // Custom affinity adjustments based on application
        if (nameToUse.toLowerCase().includes("biblioteca")) {
          if (area.name === "Recursos Humanos" || area.name === "Calidad") {
            baseQueries = Math.round(baseQueries * 2.1);
          } else if (area.name === "TI" || area.name.includes("Electrolit")) {
            baseQueries = Math.round(baseQueries * 0.5);
          }
        } else if (nameToUse.toLowerCase().includes("análisis") || nameToUse.toLowerCase().includes("hada") || nameToUse.toLowerCase().includes("agentes")) {
          if (area.name === "Finanzas" || area.name === "TI" || area.name === "Transformación digital") {
            baseQueries = Math.round(baseQueries * 2.4);
          } else if (area.name === "Recursos Humanos") {
            baseQueries = Math.round(baseQueries * 0.5);
          }
        } else {
          baseQueries = Math.round(baseQueries * (0.6 + ((seed + idx * 3) % 9) * 0.14));
        }

        // Apply timeframe scale
        if (timeframe === "Trimestre") baseQueries = Math.round(baseQueries * 2.8);
        if (timeframe === "Año") baseQueries = Math.round(baseQueries * 11.0);

        // Estimate of usage queries done by intensive users in this Area
        const intensiveSharePct = Math.min(80, Math.max(30, 40 + ((seed + idx * idx + 3) % 36))); 
        const queriesByIntensive = Math.round(baseQueries * (intensiveSharePct / 100));

        return {
          name: area.name,
          totalQueries: Math.max(10, baseQueries),
          intensivePct: intensiveSharePct,
          queriesByIntensive: Math.max(5, queriesByIntensive),
          percentageOfMax: 100
        };
      });

      const sorted = rankedList.sort((a, b) => b.totalQueries - a.totalQueries);
      const maxVal = sorted[0]?.totalQueries || 100;
      return sorted.map(item => ({
        ...item,
        percentageOfMax: Math.round((item.totalQueries / maxVal) * 100)
      }));
    }
  }, [analysisMode, selectedFocusItem, timeframe, data.allAppsOrdered, data.topAreas]);

  return (
    <section 
      id="detailed-comparative-analytics" 
      className="mt-p-md bg-white border border-neutral-raw-600/20 rounded-sm p-p-lg flex flex-col gap-p-md shadow-sm"
    >
      {/* 1. SECTION TITLES & LAYOUT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-p-md pb-p-xs border-b border-neutral-raw-100">
        <div className="flex items-center gap-p-sm">
          <div>
            <h3 className="text-[13px] font-medium text-neutral-raw-700 font-sans tracking-wide">
              Análisis por segmentación de usuarios
            </h3>
          </div>
        </div>

        {/* CONTROLLER: Area vs App Toggle Button Pill - Exact same style as ListCard & Header */}
        <div 
          role="tablist"
          aria-label="Modo de análisis"
          className="flex rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100"
          style={{ height: "36px" }}
        >
          <button
            id="analysis-mode-area-toggle"
            role="tab"
            aria-selected={analysisMode === "Area"}
            onClick={() => handleModeChange("Area")}
            className={`flex items-center justify-center gap-1.5 px-4 py-1 rounded-sm text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              analysisMode === "Area" 
                ? "bg-white text-brand-500 font-semibold shadow-xs" 
                : "text-neutral-raw-600 hover:text-neutral-raw-800"
            }`}
          >
            Análisis por área
          </button>
          <button
            id="analysis-mode-app-toggle"
            role="tab"
            aria-selected={analysisMode === "App"}
            onClick={() => handleModeChange("App")}
            className={`flex items-center justify-center gap-1.5 px-4 py-1 rounded-sm text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              analysisMode === "App" 
                ? "bg-white text-brand-500 font-semibold shadow-xs" 
                : "text-neutral-raw-600 hover:text-neutral-raw-800"
            }`}
          >
            Análisis por aplicación
          </button>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-p-md items-stretch">
        
        {/* ========================================================= */}
        {/* 2. LEFT SIDE: HIGHLIGHTED COHORT SECTIONS & DETAIL FOR FOCUS ITEM */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-p-sm justify-start">
          <div className="flex flex-col gap-1 pb-p-xs border-b border-neutral-raw-100">
            <span className="text-[12px] font-semibold text-neutral-raw-700 font-sans tracking-wide">
              Distribución de usuarios
            </span>
          </div>

          <div className="flex flex-col gap-p-xs">
            {/* Box 1: Intensivo */}
            <div 
              id="cohort-card-intensivo"
              onClick={() => toggleCohort("intensivo")}
              className={`py-3 px-3 rounded-sm border transition-all duration-100 cursor-pointer flex items-center justify-between ${
                activeCohorts.intensivo 
                  ? "border-brand-500 bg-brand-50/50" 
                  : "border-neutral-raw-600/20 bg-white opacity-55 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COHORT_SPECS.intensivo.color}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-raw-800">Intensivos</span>
                  <span className="text-[11px] text-neutral-raw-500 font-normal">Alta actividad (&gt; 20 consultas)</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-sm font-bold text-brand-700">{activeFocusPercentages.intensivo}%</span>
                <span className="text-[11px] text-neutral-raw-500 font-normal">
                  ({Math.round(activeFocusTotalUsers * (activeFocusPercentages.intensivo / 100))} u.)
                </span>
              </div>
            </div>

            {/* Box 2: Regular */}
            <div 
              id="cohort-card-regular"
              onClick={() => toggleCohort("regular")}
              className={`py-3 px-3 rounded-sm border transition-all duration-100 cursor-pointer flex items-center justify-between ${
                activeCohorts.regular 
                  ? "border-sky-500 bg-sky-50/50" 
                  : "border-neutral-raw-600/20 bg-white opacity-55 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COHORT_SPECS.regular.color}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-raw-800">Regulares</span>
                  <span className="text-[11px] text-neutral-raw-500 font-normal">Frecuencia estable (10 - 20 consultas)</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-sm font-bold text-sky-700">{activeFocusPercentages.regular}%</span>
                <span className="text-[11px] text-neutral-raw-500 font-normal">
                  ({Math.round(activeFocusTotalUsers * (activeFocusPercentages.regular / 100))} u.)
                </span>
              </div>
            </div>

            {/* Box 3: Ocasional */}
            <div 
              id="cohort-card-ocasional"
              onClick={() => toggleCohort("ocasional")}
              className={`py-3 px-3 rounded-sm border transition-all duration-100 cursor-pointer flex items-center justify-between ${
                activeCohorts.ocasional 
                  ? "border-slate-500 bg-slate-50/50" 
                  : "border-neutral-raw-600/20 bg-white opacity-55 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COHORT_SPECS.ocasional.color}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-raw-800">Ocasionales</span>
                  <span className="text-[11px] text-neutral-raw-500 font-normal">Uso esporádico (1 - 10 consultas)</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-sm font-bold text-slate-700">{activeFocusPercentages.ocasional}%</span>
                <span className="text-[11px] text-neutral-raw-500 font-normal">
                  ({Math.round(activeFocusTotalUsers * (activeFocusPercentages.ocasional / 100))} u.)
                </span>
              </div>
            </div>

            {/* Box 4: Inactivo */}
            <div 
              id="cohort-card-inactivo"
              onClick={() => toggleCohort("inactivo")}
              className={`py-3 px-3 rounded-sm border transition-all duration-100 cursor-pointer flex items-center justify-between ${
                activeCohorts.inactivo 
                  ? "border-slate-300 bg-slate-100/50" 
                  : "border-neutral-raw-600/20 bg-white opacity-55 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${COHORT_SPECS.inactivo.color}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-raw-800">Inactivos</span>
                  <span className="text-[11px] text-neutral-raw-500 font-normal">Sin consultas (0 consultas)</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-sm font-bold text-slate-600">{activeFocusPercentages.inactivo}%</span>
                <span className="text-[11px] text-neutral-raw-500 font-normal">
                  ({Math.round(activeFocusTotalUsers * (activeFocusPercentages.inactivo / 100))} u.)
                </span>
              </div>
            </div>
          </div>

          {/* Quick tips about selected segment active */}
          <div className="text-[11px] font-sans font-normal text-neutral-raw-500 border-t border-dashed border-neutral-raw-200 pt-3 flex items-center gap-1.5 normal-case tracking-normal">
            <Info size={14} className="shrink-0 text-brand-500" />
            <span>Selecciona un segmento para filtrar la tendencia histórica inferior.</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT SIDE: STACKED 100% PERCENT COLUMN CHART */}
        {/* ========================================================= */}
        <div id="stacked-percent-barchart-column" className="lg:col-span-8 flex flex-col gap-p-sm border-t lg:border-t-0 lg:border-l border-neutral-raw-600/20 pt-p-md lg:pt-0 lg:pl-p-md">
          <div className="flex justify-between items-center pb-p-xs border-b border-neutral-raw-100">
            <span className="text-xs font-semibold text-neutral-raw-700">
              Distribución por unidad organizativa (%)
            </span>
            <span className="text-[11px] text-neutral-raw-500 font-normal">
              Alineación al 100%
            </span>
          </div>

          <div className="relative border border-neutral-raw-600/20 bg-neutral-raw-50/20 p-p-sm rounded-sm flex-1 flex flex-col justify-between" style={{ minHeight: "330px" }}>
            
            {categoryItems.length > 0 ? (
              <>
                {/* Bars Container */}
                <div className="relative w-full h-[185px] mt-4 px-10">
                  {/* Axis grid lines simulation */}
                  <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none select-none text-[8px] font-sans font-bold uppercase tracking-wider text-neutral-raw-400 flex flex-col justify-between">
                    <div className="border-b border-neutral-raw-200/80 w-full pt-1"><span>100%</span></div>
                    <div className="border-b border-neutral-raw-150 w-full pt-1"><span>75%</span></div>
                    <div className="border-b border-neutral-raw-150 w-full pt-1"><span>50%</span></div>
                    <div className="border-b border-neutral-raw-150 w-full pt-1"><span>25%</span></div>
                    <div className="w-full pt-1"><span>0%</span></div>
                  </div>

                  {/* Interactive Bars Row */}
                  <div className="absolute inset-0 flex items-end justify-center gap-6 px-10">
                    {categoryItems.map((item) => {
                      const { intensivo, regular, ocasional, inactivo } = item.percentages;

                      const isIntensivoActive = activeCohorts.intensivo;
                      const isRegularActive = activeCohorts.regular;
                      const isOcasionalActive = activeCohorts.ocasional;
                      const isInactivoActive = activeCohorts.inactivo;

                      const hIntensivo = isIntensivoActive ? intensivo : 0;
                      const hRegular = isRegularActive ? regular : 0;
                      const hOcasional = isOcasionalActive ? ocasional : 0;
                      const hInactivo = isInactivoActive ? inactivo : 0;

                      return (
                        <div 
                          key={item.name}
                          className="flex-1 max-w-[55px] h-full flex flex-col justify-end group"
                        >
                          {/* Percent Stack */}
                          <div className="w-full rounded-sm overflow-hidden flex flex-col justify-end transition-all border-2 border-transparent h-full">
                            
                            {/* 1. Intensivo Block */}
                            {hIntensivo > 0 && (
                              <div 
                                className={`w-full transition-all duration-100 relative ${COHORT_SPECS.intensivo.color}`}
                                style={{ height: `${hIntensivo}%` }}
                                title={`Intensivo: ${hIntensivo}%`}
                              >
                                {hIntensivo > 12 && (
                                    <span className="absolute inset-x-0 bottom-1 text-center font-sans text-[9px] font-semibold text-white pointer-events-none">
                                      {hIntensivo}%
                                    </span>
                                )}
                              </div>
                            )}

                            {/* 2. Regular Block */}
                            {hRegular > 0 && (
                              <div 
                                className={`w-full transition-all duration-100 relative ${COHORT_SPECS.regular.color}`}
                                style={{ height: `${hRegular}%` }}
                                title={`Regular: ${hRegular}%`}
                              >
                                {hRegular > 12 && (
                                    <span className="absolute inset-x-0 bottom-1 text-center font-sans text-[9px] font-semibold text-white pointer-events-none">
                                      {hRegular}%
                                    </span>
                                )}
                              </div>
                            )}

                            {/* 3. Ocasional Block */}
                            {hOcasional > 0 && (
                              <div 
                                className={`w-full transition-all duration-100 relative ${COHORT_SPECS.ocasional.color}`}
                                style={{ height: `${hOcasional}%` }}
                                title={`Ocasional: ${hOcasional}%`}
                              >
                                {hOcasional > 12 && (
                                    <span className="absolute inset-x-0 bottom-1 text-center font-sans text-[9px] font-semibold text-white pointer-events-none">
                                      {hOcasional}%
                                    </span>
                                )}
                              </div>
                            )}

                            {/* 4. Inactivo Block */}
                            {hInactivo > 0 && (
                              <div 
                                className={`w-full transition-all duration-100 relative ${COHORT_SPECS.inactivo.color}`}
                                style={{ height: `${hInactivo}%` }}
                                title={`Inactivo: ${hInactivo}%`}
                              >
                                {hInactivo > 12 && (
                                    <span className="absolute inset-x-0 bottom-1 text-center font-sans text-[9px] font-semibold text-neutral-raw-700 pointer-events-none">
                                      {hInactivo}%
                                    </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-Axis Labels Row */}
                <div className="flex justify-center gap-6 px-10 mt-2 mb-2">
                  {categoryItems.map((item) => (
                    <div key={item.name} className="flex-1 max-w-[55px] text-center">
                      <span className="text-[10px] font-semibold font-sans tracking-tight block text-center text-neutral-raw-600 line-clamp-2 w-full break-words leading-tight">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-neutral-raw-550 text-xs font-bold">
                No se encontraron elementos disponibles.
              </div>
            )}

            {/* Small Legend indicating colors and cohort properties */}
            <div className="z-10 bg-white border border-neutral-raw-600/20 mt-2 p-2 rounded-sm flex flex-wrap justify-center items-center gap-x-12 gap-y-1 text-[11px] text-neutral-raw-600 font-medium font-sans">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${COHORT_SPECS.intensivo.color} ${activeCohorts.intensivo ? "" : "opacity-30"}`} />
                <span className={activeCohorts.intensivo ? "text-neutral-raw-800 font-semibold" : "line-through text-neutral-raw-400"}>Intensivo (&gt; 20 consultas)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${COHORT_SPECS.regular.color} ${activeCohorts.regular ? "" : "opacity-30"}`} />
                <span className={activeCohorts.regular ? "text-neutral-raw-800 font-semibold" : "line-through text-neutral-raw-400"}>Regular (10 - 20 consultas)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${COHORT_SPECS.ocasional.color} ${activeCohorts.ocasional ? "" : "opacity-30"}`} />
                <span className={activeCohorts.ocasional ? "text-neutral-raw-800 font-semibold" : "line-through text-neutral-raw-400"}>Ocasional (1 - 10 consultas)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${COHORT_SPECS.inactivo.color} ${activeCohorts.inactivo ? "" : "opacity-30"}`} />
                <span className={activeCohorts.inactivo ? "text-neutral-raw-800 font-semibold" : "line-through text-neutral-raw-400"}>Inactivo (0 consultas)</span>
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 4. DUAL BOTTOM ROW: COHORT LINE TREND EXPANDED */}
      {/* ========================================================= */}
      <div className="border-t border-neutral-raw-600/20 pt-p-md grid grid-cols-1 lg:grid-cols-12 gap-p-md items-stretch mt-2">
        
        {/* COHORT LINE TREND OVER TIME GRAPH - EXPANDED TO FULL WIDTH */}
        <div id="detailed-cohort-behavior-timeline" className="lg:col-span-12 flex flex-col gap-p-sm">
            {/* Title & Resolution Controls - Flat layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 pt-3">
              <div className="flex items-center gap-p-sm">
                <TrendingUp className="text-brand-500" size={15} />
                <h4 className="text-xs font-semibold text-neutral-raw-700">
                  Tendencia histórica de adopción
                </h4>
              </div>

              {/* Week, Month Resolution Buttons */}
              <div className="flex items-center gap-1 bg-neutral-raw-100 border border-neutral-raw-600/20 rounded-sm p-[2px]">
                {(["Semana", "Mes"] as const).map(resOpt => {
                  const isSel = resolution === resOpt;
                  return (
                    <button
                      key={resOpt}
                      type="button"
                      onClick={() => setResolution(resOpt)}
                      className={`px-3 py-1 rounded-sm text-[12px] font-medium transition-all cursor-pointer ${
                        isSel 
                          ? "bg-white text-brand-500 font-semibold shadow-xs" 
                          : "text-neutral-raw-600 hover:text-neutral-raw-800"
                      }`}
                      style={{ height: "28px" }}
                      title={`Ver datos agrupados por ${resOpt.toLowerCase()}`}
                    >
                      {resOpt}
                    </button>
                  );
                })}
              </div>
            </div>

          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-3 bg-neutral-raw-50/40 p-3 rounded-sm border border-neutral-raw-600/20 min-w-[120px]">
             <span className="text-xs font-semibold text-neutral-raw-700">Cohortes:</span>
              {(["intensivo", "regular", "ocasional", "inactivo"] as const).map(cohortKey => {
                const spec = COHORT_SPECS[cohortKey];
                return (
                  <div
                    key={cohortKey}
                    className="text-xs font-medium text-neutral-raw-700 flex items-center gap-1.5"
                  >
                    <span className={`w-2 h-2 rounded-full ${spec.color}`} />
                    <span className="capitalize">{cohortKey}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 relative bg-neutral-raw-50/10 border border-neutral-raw-600/20 rounded-sm overflow-hidden p-p-xs h-[200px]">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-[180px]">
              <defs>
                <linearGradient id="grad-intensivo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COHORT_SPECS.intensivo.stroke} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={COHORT_SPECS.intensivo.stroke} stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="grad-regular" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COHORT_SPECS.regular.stroke} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={COHORT_SPECS.regular.stroke} stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="grad-ocasional" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COHORT_SPECS.ocasional.stroke} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={COHORT_SPECS.ocasional.stroke} stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="grad-inactivo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COHORT_SPECS.inactivo.stroke} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={COHORT_SPECS.inactivo.stroke} stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Guidelines */}
              <line x1={paddingX} y1={paddingY} x2={graphWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1.5" />
              <line x1={paddingX} y1={graphHeight / 2} x2={graphWidth - paddingX} y2={graphHeight / 2} stroke="#f1f5f9" strokeWidth="1.5" />
              <line x1={paddingX} y1={graphHeight - paddingY} x2={graphWidth - paddingX} y2={graphHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Y Axis labels */}
              <text x={paddingX - 10} y={paddingY + 3} textAnchor="end" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" fill="#94a3b8">100%</text>
              <text x={paddingX - 10} y={graphHeight / 2 + 3} textAnchor="end" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" fill="#94a3b8">50%</text>
              <text x={paddingX - 10} y={graphHeight - paddingY + 3} textAnchor="end" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif" fill="#94a3b8">0%</text>

              {/* Vertical grid lines */}
              {lineChartTimeline.map((item, index) => {
                const x = paddingX + (index * (graphWidth - 2 * paddingX)) / (lineChartTimeline.length - 1);
                return (
                  <line 
                    key={index} 
                    x1={x} 
                    y1={paddingY} 
                    x2={x} 
                    y2={graphHeight - paddingY} 
                    stroke="#f8fafc" 
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* GRADIENT FILLS (rendered top-most cumulative first to bottom-most last so they stack and cover correctly) */}
              {activeCohorts.intensivo && (
                <path 
                  d={getSvgAreaPathStr(getStackedCoordinates('intensivo'))} 
                  fill="url(#grad-intensivo)"
                />
              )}
              {activeCohorts.regular && (
                <path 
                  d={getSvgAreaPathStr(getStackedCoordinates('regular'))} 
                  fill="url(#grad-regular)"
                />
              )}
              {activeCohorts.ocasional && (
                <path 
                  d={getSvgAreaPathStr(getStackedCoordinates('ocasional'))} 
                  fill="url(#grad-ocasional)"
                />
              )}
              {activeCohorts.inactivo && (
                <path 
                  d={getSvgAreaPathStr(getStackedCoordinates('inactivo'))} 
                  fill="url(#grad-inactivo)"
                />
              )}

              {/* Stroke boundary lines */}
              {activeCohorts.inactivo && (
                <path 
                  d={getSvgPathStr(getStackedCoordinates('inactivo'))} 
                  fill="none" 
                  stroke={COHORT_SPECS.inactivo.stroke}
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              )}
              {activeCohorts.ocasional && (
                <path 
                  d={getSvgPathStr(getStackedCoordinates('ocasional'))} 
                  fill="none" 
                  stroke={COHORT_SPECS.ocasional.stroke}
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              )}
              {activeCohorts.regular && (
                <path 
                  d={getSvgPathStr(getStackedCoordinates('regular'))} 
                  fill="none" 
                  stroke={COHORT_SPECS.regular.stroke}
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              )}
              {activeCohorts.intensivo && (
                <path 
                  d={getSvgPathStr(getStackedCoordinates('intensivo'))} 
                  fill="none" 
                  stroke={COHORT_SPECS.intensivo.stroke}
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              )}

              {/* Circle Node Points */}
              {lineChartTimeline.map((item, index) => {
                const x = paddingX + (index * (graphWidth - 2 * paddingX)) / (lineChartTimeline.length - 1);
                return (
                  <g key={index}>
                    {activeCohorts.inactivo && (
                      <circle 
                        cx={x} 
                        cy={getStackedCoordinates('inactivo')[index].y} 
                        r="3.5" 
                        fill={COHORT_SPECS.inactivo.stroke}
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                    )}
                    {activeCohorts.ocasional && (
                      <circle 
                        cx={x} 
                        cy={getStackedCoordinates('ocasional')[index].y} 
                        r="3.5" 
                        fill={COHORT_SPECS.ocasional.stroke}
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                    )}
                    {activeCohorts.regular && (
                      <circle 
                        cx={x} 
                        cy={getStackedCoordinates('regular')[index].y} 
                        r="3.5" 
                        fill={COHORT_SPECS.regular.stroke}
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                    )}
                    {activeCohorts.intensivo && (
                      <circle 
                        cx={x} 
                        cy={getStackedCoordinates('intensivo')[index].y} 
                        r="4" 
                        fill={COHORT_SPECS.intensivo.stroke} 
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Dynamic interactive labels on peak values */}
                    {index === lineChartTimeline.length - 1 && (
                      <>
                        {activeCohorts.inactivo && (
                          <text x={x + 6} y={getStackedCoordinates('inactivo')[index].y + 3} fontSize="9" fontWeight="semibold" fontFamily="Inter, sans-serif" fill={COHORT_SPECS.inactivo.stroke} className="font-sans">
                            {item.inactivo}%
                          </text>
                        )}
                        {activeCohorts.ocasional && (
                          <text x={x + 6} y={getStackedCoordinates('ocasional')[index].y + 3} fontSize="9" fontWeight="semibold" fontFamily="Inter, sans-serif" fill={COHORT_SPECS.ocasional.stroke} className="font-sans">
                            {item.ocasional}%
                          </text>
                        )}
                        {activeCohorts.regular && (
                          <text x={x + 6} y={getStackedCoordinates('regular')[index].y + 3} fontSize="9" fontWeight="semibold" fontFamily="Inter, sans-serif" fill={COHORT_SPECS.regular.stroke} className="font-sans">
                            {item.regular}%
                          </text>
                        )}
                        {activeCohorts.intensivo && (
                          <text x={x + 6} y={getStackedCoordinates('intensivo')[index].y + 3} fontSize="9" fontWeight="semibold" fontFamily="Inter, sans-serif" fill={COHORT_SPECS.intensivo.stroke} className="font-sans">
                            {item.intensivo}%
                          </text>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Time points labels */}
            <div className="absolute inset-x-0 bottom-1 flex justify-between px-p-lg text-[11px] text-neutral-raw-600 font-medium font-sans normal-case tracking-normal">
              {lineChartTimeline.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>

    </section>
  );
};
