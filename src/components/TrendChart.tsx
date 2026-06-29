import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendChartProps {
  timelineData: { label: string; consultas: number; habilitados: number; activos: number }[];
}

/**
 * [Organism] Gráfica de Tendencia (TrendChart)
 * Muestra el comportamiento histórico de consultas, usuarios activos y habilitados
 * Elevado con un diseño premium: degradados de área modernos apilados, micro-interacciones de pulso,
 * tipografía cuidada y gama de azules/grises corporativos cohesivos.
 */
export const TrendChart: React.FC<TrendChartProps> = ({ timelineData }) => {
  // Obtener el último punto de la serie para mostrar en la leyenda custom
  const lastItem = timelineData[timelineData.length - 1] || { consultas: 0, activos: 0, habilitados: 0 };

  // Crear el conjunto de datos normalizado al 100% para la gráfica de área apilada
  const chartData = React.useMemo(() => {
    return timelineData.map(item => {
      const pctActivos = Math.round((item.activos / item.habilitados) * 100);
      const pctInactivos = 100 - pctActivos;
      return {
        ...item,
        pctActivos,
        pctInactivos
      };
    });
  }, [timelineData]);

  // Componente CustomDot para renderizar SOLO el círculo en el último punto con efecto pulso de halo
  const CustomDot = (props: any) => {
    const { cx, cy, index, stroke } = props;
    if (index === chartData.length - 1) {
      return (
        <g>
          {/* Glowing pulse outer circle */}
          <circle
            cx={cx}
            cy={cy}
            r={8}
            fill={stroke}
            fillOpacity={0.25}
            className="animate-pulse"
          />
          {/* Crisp solid inner point */}
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill={stroke}
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
        </g>
      );
    }
    return null;
  };

  // CustomTooltip estilizado con glassmorphism moderno
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Buscar el elemento original para recuperar valores absolutos
      const originalItem = timelineData.find(item => item.label === label) || {
        consultas: 0,
        activos: 0,
        habilitados: 0
      };

      const pctActivos = Math.round((originalItem.activos / originalItem.habilitados) * 100);
      const pctInactivos = 100 - pctActivos;

      return (
        <div
          className="bg-white/95 backdrop-blur-md border border-neutral-raw-600/20 rounded-lg p-3.5 shadow-lg font-sans text-xs animate-fadeIn"
          style={{ minWidth: '190px' }}
        >
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">
            {label}
          </p>
          
          <div className="flex flex-col gap-2">
            {/* Activos */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0 bg-brand-500" />
                <span>Usuarios Activos</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">
                {originalItem.activos.toLocaleString('es-MX')} ({pctActivos}%)
              </span>
            </div>

            {/* Inactivos */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                <span>Usuarios Inactivos</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">
                {(originalItem.habilitados - originalItem.activos).toLocaleString('es-MX')} ({pctInactivos}%)
              </span>
            </div>

            {/* Total Habilitados */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-1.5 mt-0.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0 bg-slate-400" />
                <span>Total Habilitados</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">
                {originalItem.habilitados.toLocaleString('es-MX')} (100%)
              </span>
            </div>

            {/* Consultas */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-1.5 mt-0.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0 bg-sky-500" />
                <span>Consultas realizadas</span>
              </div>
              <span className="font-bold text-sky-600 font-mono">
                {originalItem.consultas.toLocaleString('es-MX')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Leyenda custom ENCIMA del chart */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        {/* Consultas (Sólida, azul corporativo) */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-raw-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />
          <span>Consultas:</span>
          <span className="font-bold text-neutral-raw-800">
            {lastItem.consultas.toLocaleString('es-MX')}
          </span>
        </div>

        {/* Activos (Dashed, azul cielo) */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-raw-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
          <span>Activos:</span>
          <span className="font-bold text-neutral-raw-800">
            {lastItem.activos.toLocaleString('es-MX')}
          </span>
        </div>

        {/* Habilitados (Dashed, gris azulado) */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-raw-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" />
          <span>Habilitados:</span>
          <span className="font-bold text-neutral-raw-800">
            {lastItem.habilitados.toLocaleString('es-MX')}
          </span>
        </div>
      </div>

      {/* Contenedor Responsive de la Gráfica */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActivosTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.85}/>
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0.55}/>
              </linearGradient>
              <linearGradient id="colorInactivosTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E2E8F0" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#E2E8F0" stopOpacity={0.4}/>
              </linearGradient>
            </defs>

            {/* Subtle grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }}
            />
            
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }}
              tickFormatter={(val) => `${val}%`}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1.5 }} />
            
            {/* Area Activos: Bottom layer of stack */}
            <Area
              type="monotone"
              dataKey="pctActivos"
              name="activos"
              stackId="trendStack"
              stroke="#0066FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorActivosTrend)"
              dot={<CustomDot />}
              activeDot={{ r: 6, strokeWidth: 1.5, stroke: '#FFFFFF' }}
            />

            {/* Area Inactivos: Top layer of stack to reach 100% */}
            <Area
              type="monotone"
              dataKey="pctInactivos"
              name="inactivos"
              stackId="trendStack"
              stroke="#CBD5E1"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorInactivosTrend)"
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
