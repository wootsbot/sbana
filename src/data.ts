/**
 * [Token] Base Data Types and Adaptive Datasets
 */

export interface Metric {
  title: string;
  value: string;
  sub: string;
  changeValue: string;
  changeType: 'up' | 'down' | 'neutral';
}

export interface AppItem {
  name: string;
  pilar: string;
  usageCount: number;
  percentage: number;
  category: string;
}

export interface AreaItem {
  name: string;
  percentage: number;
  totalUsers: number;
  trend: number;
}

export interface DashboardData {
  metrics: Metric[];
  topAppsMasUsadas: AppItem[];
  topAppsMenosUsadas: AppItem[];
  allAppsOrdered: AppItem[];
  topAreas: AreaItem[];
  matrixTrends: { label: string; WAU: number; DAU: number }[];
  usagePatterns: { day: string; activeHours: number; peakHour: string; intensity: number }[];
  userDistribution: {
    intensivo: { count: number; percentage: number };
    regular: { count: number; percentage: number };
    ocasional: { count: number; percentage: number };
    inactivo: { count: number; percentage: number };
  };
  weeklyConsumptionUnit: { name: string; queries: number; percentage: number }[];
  weeklyConsumptionApp: { name: string; queries: number; percentage: number }[];
  timelineData: { label: string; consultas: number; habilitados: number; activos: number }[];
}

export const accessLevels = ["Todos", "Súper Admin", "Corporativo", "Operador"];
export const businessUnits = ["Todas", "Transformación digital", "Recursos Humanos", "Manufactura", "Calidad", "TI", "Comercial Electrolit", "Finanzas", "Logística", "Comercial Farma"];
export const appSelections = ["Todas", "Exploración abierta", "biblioteca Pisa", "análisis de datos", "Productividad y oficina", "Hada", "Agentes especializados", "Investigación", "Imágenes y videos"];

// Comprehensive mock database organized by combinations of filters to simulate real database response.
export const getDashboardData = (
  timeframe: 'Mes' | 'Trimestre' | 'Año',
  accessLevel: string,
  businessUnit: string,
  selectedApp: string
): DashboardData => {
  // Parse multi-select items
  const selectedUnits = businessUnit === "Todas" ? ["Todas"] : businessUnit.split(",").map(x => x.trim()).filter(Boolean);
  const selectedApps = selectedApp === "Todas" ? ["Todas"] : selectedApp.split(",").map(x => x.trim()).filter(Boolean);

  // Let's amplify values based on metrics
  let scale = 1.0;
  if (timeframe === 'Trimestre') scale = 2.8;
  if (timeframe === 'Año') scale = 11.4;

  // Small variations based on access levels and business units
  let accessMultiplier = 1.0;
  if (accessLevel === "Súper Admin") accessMultiplier = 0.15;
  if (accessLevel === "Corporativo") accessMultiplier = 0.6;
  if (accessLevel === "Operador") accessMultiplier = 0.35;

  const getUnitMult = (u: string): number => {
    if (u === "Transformación digital") return 1.35;
    if (u === "Recursos Humanos") return 0.85;
    if (u === "Calidad") return 0.95;
    if (u === "TI") return 1.4;
    if (u === "Comercial Electrolit") return 1.25;
    if (u === "Finanzas") return 0.9;
    return 1.0;
  };

  let unitMultiplier = 1.0;
  if (selectedUnits.length > 0 && !selectedUnits.includes("Todas")) {
    const mults = selectedUnits.map(getUnitMult);
    unitMultiplier = mults.reduce((a, b) => a + b, 0) / mults.length;
  }

  const totalMultiplier = scale * accessMultiplier * unitMultiplier;

  // Let's compute final dynamic stats
  const habilitados = Math.round(1248 * accessMultiplier * unitMultiplier);
  const activacion = Math.round(Math.min(98, Math.max(45, 85 + (timeframe === 'Año' ? 7 : 0) - (accessLevel === 'Operador' ? 12 : 0))));
  const pctSemanal = Math.round(Math.min(95, Math.max(25, 62 + (timeframe === 'Trimestre' ? 2 : timeframe === 'Año' ? 5 : 0) - (accessLevel === 'Operador' ? 10 : 0))));
  const pctDiario = Math.round(pctSemanal * 0.38);
  const wau = Math.round(habilitados * (pctSemanal / 100));
  const dau = Math.round(habilitados * (pctDiario / 100));
  const activos = Math.round(habilitados * (activacion / 100));

  const metrics: Metric[] = [
    {
      title: "Usuarios Habilitados",
      value: habilitados.toLocaleString('es-MX'),
      sub: "Usuarios autorizados con acceso",
      changeValue: "+12.4%",
      changeType: "up"
    },
    {
      title: "Cuentas Activadas",
      value: `${activacion}%`,
      sub: "Activado al menos una vez",
      changeValue: "+8.7%",
      changeType: "up"
    },
    {
      title: "Actividad Semanal (WAU)",
      value: `${pctSemanal}%`,
      sub: "Activo al menos una vez a la semana",
      changeValue: "+14.2%",
      changeType: "up"
    },
    {
      title: "Actividad Diaria (DAU)",
      value: `${pctDiario}%`,
      sub: "Activo al menos una vez al día",
      changeValue: "+6.1%",
      changeType: "up"
    }
  ];

  // Distribution of users based on intensity classes
  const intensivoCount = Math.round(habilitados * 0.22);
  const regularCount = Math.round(habilitados * 0.43);
  const ocasionalCount = Math.round(habilitados * 0.23);
  const inactivoCount = Math.max(0, habilitados - (intensivoCount + regularCount + ocasionalCount));
  const userDistribution = {
    intensivo: { count: intensivoCount, percentage: Math.round((intensivoCount / habilitados) * 100) },
    regular: { count: regularCount, percentage: Math.round((regularCount / habilitados) * 100) },
    ocasional: { count: ocasionalCount, percentage: Math.round((ocasionalCount / habilitados) * 100) },
    inactivo: { count: inactivoCount, percentage: Math.round((inactivoCount / habilitados) * 100) }
  };

  // Weekly Consumption by Business Unit
  const weeklyConsumptionUnit = [
    { name: "Transformación digital", queries: Math.round(18500 * totalMultiplier), percentage: 42 },
    { name: "TI", queries: Math.round(12400 * totalMultiplier), percentage: 28 },
    { name: "Recursos Humanos", queries: Math.round(8400 * totalMultiplier), percentage: 19 },
    { name: "Comercial Electrolit", queries: Math.round(4800 * totalMultiplier), percentage: 11 }
  ];

  // Weekly Consumption by Application
  const weeklyConsumptionApp = [
    { name: "Exploración abierta", queries: Math.round(16200 * totalMultiplier), percentage: 37 },
    { name: "biblioteca Pisa", queries: Math.round(11800 * totalMultiplier), percentage: 27 },
    { name: "análisis de datos", queries: Math.round(8900 * totalMultiplier), percentage: 20 },
    { name: "Productividad y oficina", queries: Math.round(4200 * totalMultiplier), percentage: 10 },
    { name: "Hada", queries: Math.round(2800 * totalMultiplier), percentage: 6 }
  ];

  // Multi-line timeline trend
  const timelinePeriods = timeframe === 'Mes'
    ? ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"]
    : timeframe === 'Trimestre'
      ? ["Mes 1", "Mes 2", "Mes 3"]
      : ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Trimestre 4"];

  const timelineData = timelinePeriods.map((label, idx) => {
    const scaleFactor = 0.9 + (idx * 0.03);
    const ptHabilitados = Math.round(habilitados * scaleFactor);
    const ptActivos = Math.round(ptHabilitados * (activacion / 100) * (0.95 + idx * 0.02));
    const ptConsultas = Math.round(ptActivos * (14 + idx * 1.2));
    return {
      label,
      consultas: ptConsultas,
      habilitados: ptHabilitados,
      activos: ptActivos
    };
  });

  // Dynamically compute apps based on selection
  let rawApps: AppItem[] = [
    { name: "Exploración abierta", pilar: "Inteligencia", usageCount: 4890, percentage: 92, category: "Inteligencia" },
    { name: "biblioteca Pisa", pilar: "Productividad", usageCount: 4120, percentage: 86, category: "Productividad" },
    { name: "análisis de datos", pilar: "Inteligencia", usageCount: 3512, percentage: 76, category: "Inteligencia" },
    { name: "Productividad y oficina", pilar: "Productividad", usageCount: 2901, percentage: 65, category: "Productividad" },
    { name: "Hada", pilar: "Acción agéntica", usageCount: 2200, percentage: 55, category: "Acción agéntica" },
    { name: "Agentes especializados", pilar: "Acción agéntica", usageCount: 1980, percentage: 51, category: "Acción agéntica" },
    { name: "Investigación", pilar: "Inteligencia", usageCount: 940, percentage: 31, category: "Inteligencia" },
    { name: "Imágenes y videos", pilar: "Productividad", usageCount: 520, percentage: 18, category: "Productividad" },
  ];

  // Filter apps if a select filter matches
  if (!selectedApps.includes("Todas")) {
    rawApps = rawApps.filter(app => selectedApps.includes(app.name));
  }

  // Adjust counts by timeframe and scaling
  const adjustAppItem = (app: AppItem, indexMultiplier: number): AppItem => {
    const usageCount = Math.round(app.usageCount * totalMultiplier);
    // Add some variation to percentages
    const percentage = Math.min(100, Math.max(5, Math.round(app.percentage * (0.9 + Math.sin(indexMultiplier) * 0.1))));
    return { ...app, usageCount, percentage };
  };

  const processedApps = rawApps.map((app, idx) => adjustAppItem(app, idx)).sort((a, b) => b.usageCount - a.usageCount);

  // Split into Top 5 most and least used
  const topAppsMasUsadas = processedApps.slice(0, 5);
  const topAppsMenosUsadas = [...processedApps].reverse().slice(0, 5);

  // Dynamic Areas
  const rawAreas: AreaItem[] = [
    { name: "Transformación digital", percentage: 88, totalUsers: 340, trend: 1.2 },
    { name: "Recursos Humanos", percentage: 74, totalUsers: 285, trend: 0.5 },
    { name: "Finanzas", percentage: 68, totalUsers: 120, trend: -0.2 },
    { name: "Manufactura", percentage: 56, totalUsers: 198, trend: -1.5 },
    { name: "Calidad", percentage: 48, totalUsers: 145, trend: 2.1 },
    { name: "Logística", percentage: 42, totalUsers: 155, trend: -0.8 },
    { name: "TI", percentage: 32, totalUsers: 110, trend: 3.4 },
    { name: "Comercial Farma", percentage: 31, totalUsers: 85, trend: -0.4 },
    { name: "Comercial Electrolit", percentage: 25, totalUsers: 95, trend: 0.1 },
  ].filter(area => selectedUnits.includes("Todas") || selectedUnits.includes(area.name));

  const topAreas = rawAreas.map((area, idx) => {
    const totalUsers = Math.round(area.totalUsers * (scale * accessMultiplier));
    const percentage = Math.min(100, Math.max(5, Math.round(area.percentage * (0.95 + idx * 0.01))));
    const trend = area.trend;
    return { ...area, percentage, totalUsers, trend };
  }).sort((a, b) => a.percentage - b.percentage);

  // Trend graph values
  const matrixTrends = [
    { label: timeframe === 'Mes' ? 'Semana 1' : timeframe === 'Trimestre' ? 'Mes 1' : 'Trimestre 1', WAU: Math.round(wau * 0.8), DAU: Math.round(dau * 0.82) },
    { label: timeframe === 'Mes' ? 'Semana 2' : timeframe === 'Trimestre' ? 'Mes 2' : 'Trimestre 2', WAU: Math.round(wau * 0.95), DAU: Math.round(dau * 0.9) },
    { label: timeframe === 'Mes' ? 'Semana 3' : timeframe === 'Trimestre' ? 'Mes 3' : 'Trimestre 3', WAU: Math.round(wau * 1.05), DAU: Math.round(dau * 1.05) },
    { label: timeframe === 'Mes' ? 'Semana 4' : timeframe === 'Trimestre' ? 'Mes 4' : 'Trimestre 4', WAU: Math.round(wau * 1.0), DAU: Math.round(dau * 1.0) }
  ];

  // Usage Hourly Matrix Pattern
  const usagePatterns = [
    { day: "Lunes", activeHours: 9.5, peakHour: "10:00 AM", intensity: 85 },
    { day: "Martes", activeHours: 10.2, peakHour: "11:00 AM", intensity: 92 },
    { day: "Miércoles", activeHours: 9.8, peakHour: "02:00 PM", intensity: 88 },
    { day: "Jueves", activeHours: 10.5, peakHour: "11:30 AM", intensity: 95 },
    { day: "Viernes", activeHours: 8.4, peakHour: "09:30 AM", intensity: 78 },
    { day: "Sábado", activeHours: 3.2, peakHour: "10:00 AM", intensity: 20 },
    { day: "Domingo", activeHours: 1.5, peakHour: "04:30 PM", intensity: 10 }
  ];

  return {
    metrics,
    topAppsMasUsadas,
    topAppsMenosUsadas,
    allAppsOrdered: processedApps,
    topAreas,
    matrixTrends,
    usagePatterns,
    userDistribution,
    weeklyConsumptionUnit,
    weeklyConsumptionApp,
    timelineData
  };
};
