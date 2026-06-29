import React from 'react';

/**
 * [Token] ColorToken
 * Interfaz que define las propiedades de un token de color para el sistema semafórico de SabIA,
 * siguiendo el patrón del ADAPTA Design System: bg = color.50, text = color.700, border = color.200.
 */
export interface ColorToken {
  bg: string;        // hex color-50
  text: string;      // hex color-700
  border: string;    // hex color-200
  bar: string;       // hex color-500
  badgeBg: string;   // hex color-100
  badgeText: string; // hex color-700
  label: 'En objetivo' | 'Atención' | 'Crítico';
}

export const COLOR_SUCCESS: ColorToken = { 
  bg: '#F0FDF4', 
  text: '#15803D', 
  border: '#BBF7D0', 
  bar: '#22C55E', 
  badgeBg: '#DCFCE7', 
  badgeText: '#15803D', 
  label: 'En objetivo' 
};

export const COLOR_WARNING: ColorToken = { 
  bg: '#FFFBEB', 
  text: '#B45309', 
  border: '#FDE68A', 
  bar: '#F59E0B', 
  badgeBg: '#FEF3C7', 
  badgeText: '#B45309', 
  label: 'Atención' 
};

export const COLOR_DANGER: ColorToken = { 
  bg: '#FEF2F2', 
  text: '#B91C1C', 
  border: '#FECACA', 
  bar: '#EF4444', 
  badgeBg: '#FEE2E2', 
  badgeText: '#B91C1C', 
  label: 'Crítico' 
};

/**
 * Helper que calcula el estado semafórico en base a un valor y un target.
 */
export const getColorByValue = (value: number, target = 60): ColorToken =>
  value >= target + 10 ? COLOR_SUCCESS
  : value >= target     ? COLOR_SUCCESS
  : value >= target - 20 ? COLOR_WARNING
  : COLOR_DANGER;

/**
 * [Atom] MetricBadge
 * Píldora de métrica con color semántico que hereda los estilos del ADAPTA Design System.
 */
export const MetricBadge: React.FC<{ value: number; target?: number; suffix?: string }> = ({
  value,
  target = 60,
  suffix = '%',
}) => {
  const token = getColorByValue(value, target);
  return (
    <span
      className="inline-block"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: token.badgeBg,
        color: token.badgeText,
        padding: '2px 8px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
      }}
    >
      {value}{suffix} · {token.label}
    </span>
  );
};

/**
 * [Atom] ProgressBar
 * Barra de progreso con color semántico, línea vertical marcadora en la posición del target.
 */
export const ProgressBar: React.FC<{ value: number; target?: number; height?: number }> = ({
  value,
  target = 60,
  height = 8,
}) => {
  const token = getColorByValue(value, target);
  const percentage = Math.min(Math.max(value, 0), 100);
  const targetPercentage = Math.min(Math.max(target, 0), 100);

  return (
    <div
      style={{
        height: `${height}px`,
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Barra de progreso coloreada con transition */}
      <div
        className="transition-all duration-300"
        style={{
          height: '100%',
          backgroundColor: token.bar,
          width: `${percentage}%`,
          borderRadius: '4px',
        }}
      />
      
      {/* Línea vertical marcadora en la posición del target (slate-700 con opacidad 0.3) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${targetPercentage}%`,
          width: '0px',
          borderLeft: '1px solid #374151',
          opacity: 0.3,
          zIndex: 10,
        }}
      />
    </div>
  );
};
