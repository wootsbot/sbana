import React, { useEffect, useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AreaItem } from '../data';

/**
 * Interface para las propiedades de DiagnosticBanner.
 * Define los contratos de entrada de datos desde el backend (o data layer)
 * y previene mutaciones inesperadas.
 */
interface DiagnosticBannerProps {
  /** Colección de áreas y su porcentaje de uso / adopción */
  areas: AreaItem[];
  /** Período temporal de análisis del dashboard */
  timeframe: 'Mes' | 'Trimestre' | 'Año';
}

/**
 * [Organism] DiagnosticBanner
 * 
 * Componente que muestra de forma dinámica un diagnóstico de adopción de IA corporativa
 * utilizando Gemini de manera directa en el cliente, de acuerdo a la especificación de SabIA.
 * Cumple rigurosamente con los tokens de color, bordes, espaciados y tipografía de ADAPTA DS.
 */
export const DiagnosticBanner: React.FC<DiagnosticBannerProps> = ({ areas, timeframe }) => {
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Genera el diagnóstico llamando a la API de Gemini
  const generateDiagnosis = useCallback(async () => {
    setLoading(true);
    setError(false);

    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[ADAPTA DS] VITE_GEMINI_API_KEY no encontrada en las variables de entorno.');
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Instancia estándar usando GoogleGenerativeAI como solicita el usuario
      const genAI = new GoogleGenerativeAI(apiKey);
      // El usuario solicita el uso específico de gemini-2.0-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Eres analista de adopción tecnológica corporativa. Responde SOLO con 2 frases directas, sin introducción ni cierre.
Frase 1: estado general y áreas más críticas.
Frase 2: recomendación de acción concreta para dirección.
Período: ${timeframe}. Meta: 60% WAU.
Datos: ${JSON.stringify(areas.map(a => ({ area: a.name, wau: a.percentage })))}`;

      const result = await model.generateContent(prompt);
      const text = result.response?.text?.() || '';

      if (text) {
        setDiagnosis(text.trim());
      } else {
        throw new Error('Respuesta de Gemini vacía');
      }
    } catch (err) {
      console.error('[ADAPTA DS Error] Error al obtener el diagnóstico de Gemini:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [areas, timeframe]);

  // Ejecución al montar el componente y al cambiar dependencias de negocio
  useEffect(() => {
    generateDiagnosis();
  }, [generateDiagnosis]);

  // 1. Estado de Carga (Loading): Muestra barras de carga tipo esqueleto
  if (loading) {
    return (
      <div 
        id="diagnostic-banner-loading"
        className="w-full flex flex-col gap-2.5 p-4 border border-dashed border-neutral-raw-600/20 bg-white"
        style={{ borderRadius: '8px' }}
      >
        <div 
          className="animate-pulse bg-[#E5E7EB]" 
          style={{ height: '14px', width: '80%', borderRadius: '4px' }} 
        />
        <div 
          className="animate-pulse bg-[#E5E7EB]" 
          style={{ height: '12px', width: '60%', borderRadius: '4px' }} 
        />
      </div>
    );
  }

  // 2. Estado de Error
  if (error) {
    return (
      <div 
        id="diagnostic-banner-error"
        className="w-full p-4 border border-[#FECACA] bg-[#FEF2F2] flex items-center justify-between"
        style={{ borderRadius: '8px', fontFamily: "'Inter', sans-serif" }}
      >
        <span 
          style={{ fontSize: '14px', color: '#B91C1C', fontWeight: 400 }}
        >
          No se pudo generar el diagnóstico
        </span>
        <button
          onClick={generateDiagnosis}
          className="text-xs font-semibold underline hover:text-[#991B1B] transition-colors"
          style={{ color: '#B91C1C', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // 3. Estado de Éxito (Success)
  return (
    <div 
      id="diagnostic-banner-success"
      className="w-full p-4 border border-[#B3CEFC] bg-[#EEF4FC] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      style={{ 
        borderRadius: '8px', // r-sm
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      <div className="flex-1 flex flex-col items-start min-w-0">
        {/* Identificador de Marca (Badge "Diagnóstico IA") */}
        <span 
          style={{ 
            backgroundColor: '#D9E6FC', // Blue-100
            color: '#003E99', // Blue-700
            fontSize: '11px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            borderRadius: '9999px', // r-full
            padding: '2px 8px'
          }}
        >
          Diagnóstico IA
        </span>
        {/* Cuerpo del diagnóstico */}
        <p 
          style={{ 
            fontSize: '14px', // text-sm
            color: '#475569', // Slate-600 (neutral-raw-700)
            fontWeight: 400,
            marginTop: '6px',
            lineHeight: '1.45',
            marginRight: '8px'
          }}
        >
          {diagnosis}
        </p>
      </div>

      {/* Botón de control: Regenerar */}
      <button
        onClick={generateDiagnosis}
        className="shrink-0 self-end sm:self-start underline transition-colors"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px', // text-xs
          color: '#0066FF', // Blue-500
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          padding: 0
        }}
      >
        Regenerar
      </button>
    </div>
  );
};
