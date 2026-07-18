// Único lugar donde se traducen los valores internos de nivel/estado a texto
// y color para la UI. Antes esto vivía solo dentro de LessonNav.tsx — cuando
// el dashboard de progreso necesitó las mismas etiquetas, en vez de copiarlas
// (y arriesgar que en algún momento digan cosas distintas para el mismo
// estado) se movieron aquí como fuente única.

export const LEVEL_LABELS: Record<string, string> = {
  base: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// Orden de progresión de niveles — usado para comparar "¿este nivel es igual
// o anterior al nivel desde el que el usuario eligió arrancar?" al calcular
// qué lecciones quedan desbloqueadas automáticamente (ver LessonNav).
export const LEVEL_ORDER: Array<'base' | 'intermediate' | 'advanced'> = [
  'base',
  'intermediate',
  'advanced',
];

export interface LearnerStateConfig {
  label: string;
  color: string;
  bg: string;
}

export const STATE_CONFIG: Record<'struggling' | 'normal' | 'advanced', LearnerStateConfig> = {
  struggling: { label: 'Aprendiendo', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  normal: { label: 'En progreso', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  advanced: { label: 'Dominando', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
};
