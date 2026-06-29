import React from 'react';

/**
 * [Organism] Grid de Adopción
 * Componente que muestra las tarjetas de métricas de adopción con semáforo automático sin usar Tailwind.
 */

export interface Area {
  nombre: string;
  wau: number;
  usuarios: number;
}

const areas: Area[] = [
  { nombre: "Transformación Digital", wau: 84, usuarios: 296 },
  { nombre: "Recursos Humanos", wau: 71, usuarios: 202 },
  { nombre: "Finanzas", wau: 66, usuarios: 79 },
  { nombre: "Manufactura", wau: 55, usuarios: 109 },
  { nombre: "Calidad", wau: 48, usuarios: 70 },
  { nombre: "Logística", wau: 42, usuarios: 65 },
  { nombre: "TI", wau: 32, usuarios: 35 },
  { nombre: "Comercial Farma", wau: 32, usuarios: 27 },
  { nombre: "Comercial Electrolit", wau: 26, usuarios: 25 },
];

type Estado = {
  bg: string;
  texto: string;
  barra: string;
  etiqueta: string;
};

const getEstado = (wau: number): Estado => {
  if (wau >= 70) return { bg: "#EAF3DE", texto: "#27500A", barra: "#639922", etiqueta: "En objetivo" };
  if (wau >= 40) return { bg: "#FAEEDA", texto: "#633806", barra: "#BA7517", etiqueta: "Atención" };
  return { bg: "#FCEBEB", texto: "#791F1F", barra: "#E24B4A", etiqueta: "Crítico" };
};

export const AdopcionGrid: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    padding: '16px'
  };

  return (
    <div style={containerStyle}>
      {areas.map((area) => {
        const estado = getEstado(area.wau);
        
        const cardStyle: React.CSSProperties = {
          backgroundColor: estado.bg,
          color: estado.texto,
          padding: '24px 24px 32px 24px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        };

        const barContainerStyle: React.CSSProperties = {
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          width: '100%',
          marginTop: '8px'
        };

        const barStyle: React.CSSProperties = {
          height: '100%',
          backgroundColor: estado.barra,
          borderRadius: '4px',
          width: `${Math.min(area.wau, 100)}%`
        };

        return (
          <div key={area.nombre} style={cardStyle}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {area.wau}%
            </div>
            
            <h3 style={{ margin: 0, fontSize: '18px' }}>{area.nombre}</h3>
            
            <div style={barContainerStyle}>
              <div style={barStyle}></div>
            </div>
            
            <div style={{ color: '#666', fontSize: '14px' }}>
              {area.usuarios} usuarios activos
            </div>
            
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: 'auto', paddingTop: '10px' }}>
              {estado.etiqueta}
            </div>
          </div>
        );
      })}
    </div>
  );
};
