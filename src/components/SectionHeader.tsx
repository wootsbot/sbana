import React from 'react';
import { TYPE } from '../typography';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * [Molecule] SectionHeader
 * 
 * Cabecera de sección modular que cumple con los lineamientos del ADAPTA Design System.
 * Muestra un título (en formato sentence case), subtítulo opcional y un elemento de acción
 * alineado a la derecha. Sin fondo ni bordes, con un padding-bottom exacto descatado de 8px (p-sm).
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div 
      id={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex items-start justify-between w-full"
      style={{ paddingBottom: '8px', border: 'none', background: 'none' }}
    >
      <div className="flex flex-col min-w-0">
        <h2 style={TYPE.sectionLabel}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ ...TYPE.muted, marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
