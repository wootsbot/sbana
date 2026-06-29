import React from 'react';

/**
 * Interface representing the data structure for a business area's adoption metrics.
 */
interface AreaMetrics {
  name: string;
  wau: number;
  users: number;
}

/**
 * [Organism] Dashboard de Adopción
 * Componente que muestra las tarjetas de métricas de adopción con semáforo automático.
 */
export const AdoptionDashboard: React.FC = () => {
  const data: AreaMetrics[] = [
    { name: "Transformación Digital", wau: 0.84, users: 296 },
    { name: "Recursos Humanos", wau: 0.71, users: 202 },
    { name: "Finanzas", wau: 0.66, users: 79 },
    { name: "Manufactura", wau: 0.55, users: 109 },
    { name: "Calidad", wau: 0.48, users: 70 },
    { name: "Logística", wau: 0.42, users: 65 },
    { name: "TI", wau: 0.32, users: 35 },
    { name: "Comercial Farma", wau: 0.32, users: 27 },
    { name: "Comercial Electrolit", wau: 0.26, users: 25 },
  ];

  const getStatus = (wau: number) => {
    if (wau >= 0.7) return { label: "En objetivo", bgColor: "bg-[#EAF3DE]", textColor: "text-[#27500A]", barColor: "bg-[#27500A]" };
    if (wau >= 0.4) return { label: "Atención", bgColor: "bg-[#FAEEDA]", textColor: "text-[#633806]", barColor: "bg-[#633806]" };
    return { label: "Crítico", bgColor: "bg-[#FCEBEB]", textColor: "text-[#791F1F]", barColor: "bg-[#791F1F]" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-p-md">
      {data.map((area) => {
        const status = getStatus(area.wau);

        return (
          <div
            key={area.name}
            className={`p-p-md rounded-r-md border border-neutral-raw-200 ${status.bgColor} flex flex-col`}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-p-xs">
              {area.name}
            </h3>
            
            {/* Progress bar */}
            <div className="w-full bg-neutral-raw-200 rounded-full h-2 mb-p-sm">
              <div 
                className={`h-2 rounded-full ${status.barColor}`} 
                style={{ width: `${Math.min(area.wau * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-end mb-p-md">
              <span className={`text-2xl font-bold ${status.textColor}`}>
                {(area.wau * 100).toFixed(0)}%
              </span>
              <span className="text-sm font-normal text-slate-600">
                {area.users} usuarios
              </span>
            </div>
            
            <div className={`px-p-sm py-p-xs rounded-r-sm inline-block self-start font-semibold text-xs ${status.textColor} bg-white bg-opacity-50`}>
              {status.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
