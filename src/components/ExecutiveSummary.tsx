import React from 'react';
import { Metric, AreaItem } from '../data';
import { AlertTriangle, Circle, CheckCircle } from 'lucide-react';

interface ExecutiveSummaryProps {
  metrics: Metric[];
  areas: AreaItem[];
}

/**
 * [Organism] Resumen Ejecutivo
 * Franja horizontal compacta con diagnóstico automático y mini-stats.
 * Aplica estilos inline con los códigos hexadecimales del ADAPTA Design System.
 */
export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ metrics, areas }) => {
  const criticas = areas.filter(a => a.percentage < 40).length;
  const atencion = areas.filter(a => a.percentage >= 40 && a.percentage < 70).length;
  const promedio = Math.round(areas.reduce((s, a) => s + a.percentage, 0) / areas.length);

  let stateStyle = {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#15803D',
    icon: <CheckCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />,
    message: `Adopción saludable · Promedio WAU: ${promedio}%`
  };

  if (criticas >= 3) {
    stateStyle = {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#B91C1C',
      icon: <AlertTriangle style={{ width: '20px', height: '20px', flexShrink: 0 }} />,
      message: `${criticas} áreas en estado crítico — se requiere intervención`
    };
  } else if (atencion >= 3) {
    stateStyle = {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#B45309',
      icon: <Circle style={{ width: '20px', height: '20px', flexShrink: 0 }} />,
      message: `${atencion} áreas requieren atención · Promedio WAU: ${promedio}%`
    };
  }

  const topArea = areas[0];
  const bottomArea = areas[areas.length - 1];

  const metaLabel = promedio >= 60 ? "+" + (promedio - 60) + "% sobre meta" : (promedio - 60) + "% bajo meta";
  const metaColor = promedio >= 60 ? '#15803D' : '#B91C1C';

  return (
    <div 
      className="flex items-center justify-between w-full"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: stateStyle.bg,
        border: `1px solid ${stateStyle.border}`,
        borderRadius: '8px',
        padding: '16px',
        height: '100px',
        maxHeight: '100px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* ZONA IZQUIERDA (60%) — Diagnóstico automático */}
      <div 
        className="flex items-center" 
        style={{ width: '60%', gap: '8px', color: stateStyle.text }}
      >
        {stateStyle.icon}
        <span 
          style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {stateStyle.message}
        </span>
      </div>

      {/* ZONA DERECHA (40%) — Tres mini-stats en fila */}
      <div 
        className="flex items-center justify-end" 
        style={{ width: '40%', gap: '24px' }}
      >
        {/* Top Area */}
        <div className="flex flex-col text-right" style={{ maxWidth: '35%' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>
            Área top
          </span>
          <span 
            style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#15803D',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis' 
            }}
          >
            {topArea ? `${topArea.name} ${topArea.percentage}%` : 'N/A'}
          </span>
        </div>

        {/* Bottom Area */}
        <div className="flex flex-col text-right" style={{ maxWidth: '35%' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>
            Área crítica
          </span>
          <span 
            style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#B91C1C',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis' 
            }}
          >
            {bottomArea ? `${bottomArea.name} ${bottomArea.percentage}%` : 'N/A'}
          </span>
        </div>

        {/* vs meta */}
        <div className="flex flex-col text-right">
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>
            vs. meta 60%
          </span>
          <span 
            style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: metaColor,
              whiteSpace: 'nowrap'
            }}
          >
            {metaLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

