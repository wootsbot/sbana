import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

/**
 * [Atom] Gráfica de distribución de usuarios por frecuencia de uso
 * Optimizado con curvas spline suaves, tipografía elegante y un diseño de panel moderno.
 */
export const CohortDistributionChart: React.FC = () => {
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0F172A',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.raw}%`
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '500'
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        max: 60,
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '500'
          },
          callback: (value: any) => `${value}%`,
        },
        border: {
          display: false,
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
    datasets: [
      {
        label: 'Intensivo',
        data: [25, 24, 25, 25, 25],
        borderColor: '#0066FF',
        backgroundColor: '#0066FF',
        borderWidth: 3,
        tension: 0.35,
        pointRadius: (ctx: any) => (ctx.dataIndex === 4 ? 6 : 0),
        pointHoverRadius: 8,
        pointBackgroundColor: '#0066FF',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
      {
        label: 'Regular',
        data: [44, 44, 44, 44, 44],
        borderColor: '#0EA5E9',
        backgroundColor: '#0EA5E9',
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: (ctx: any) => (ctx.dataIndex === 4 ? 6 : 0),
        pointHoverRadius: 8,
        pointBackgroundColor: '#0EA5E9',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
      {
        label: 'Ocasional',
        data: [21, 21, 21, 20, 20],
        borderColor: '#64748B',
        backgroundColor: '#64748B',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: (ctx: any) => (ctx.dataIndex === 4 ? 5 : 0),
        pointHoverRadius: 7,
        pointBackgroundColor: '#64748B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
      {
        label: 'Inactivo',
        data: [14, 14, 14, 14, 14],
        borderColor: '#94A3B8',
        backgroundColor: '#94A3B8',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: (ctx: any) => (ctx.dataIndex === 4 ? 5 : 0),
        pointHoverRadius: 7,
        pointBackgroundColor: '#94A3B8',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full flex flex-col gap-4 p-5 bg-white border border-neutral-raw-600/20 rounded-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Custom Title & Info Block */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-xs font-semibold text-neutral-raw-800">
          Distribución de usuarios por frecuencia de uso
        </h4>
        <p className="text-[11px] text-neutral-raw-500">
          Evolución del porcentaje de participación por cohorte en las últimas 5 semanas
        </p>
      </div>

      {/* Chart Canvas Wrapper */}
      <div className="w-full h-[220px] relative">
        <Line options={options} data={data} />
      </div>

      {/* Elegant HTML Legend with metric capsules */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-neutral-raw-100">
        {data.datasets.map((dataset) => (
          <div key={dataset.label} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dataset.borderColor }} />
            <span className="text-neutral-raw-600 font-medium">{dataset.label}:</span>
            <span className="font-bold text-neutral-raw-800 font-mono">
              {dataset.data[dataset.data.length - 1]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
