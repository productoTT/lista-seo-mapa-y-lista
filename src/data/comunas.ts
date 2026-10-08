// Comunas reconocidas por el buscador y el asistente (datos ficticios del prototipo).

export const COMUNAS = [
  'Ñuñoa', 'Providencia', 'Las Condes', 'Vitacura', 'Santiago Centro',
  'Miraflores', 'La Florida', 'Peñalolén', 'La Reina', 'Macul',
  'San Miguel', 'Estación Central', 'Maipú', 'Pudahuel', 'Quilicura',
  'Lo Barnechea', 'Huechuraba', 'Conchalí', 'Recoleta', 'Independencia',
];

/** "Búsquedas sugeridas" del combobox cuando no hay recientes. */
export const POPULARES = ['Ñuñoa', 'Providencia', 'Las Condes'];

/** Comunas cercanas, para "sumar comunas cercanas". Mapa ficticio de vecindad. */
export const VECINAS: Record<string, string[]> = {
  'Ñuñoa': ['Providencia', 'Peñalolén', 'La Reina', 'Macul'],
  'Providencia': ['Ñuñoa', 'Las Condes', 'Santiago Centro'],
  'Las Condes': ['Providencia', 'Vitacura', 'Lo Barnechea'],
  'Vitacura': ['Las Condes', 'Lo Barnechea'],
  'Santiago Centro': ['Miraflores', 'Providencia', 'Independencia'],
  'Miraflores': ['Santiago Centro'],
  'La Florida': ['Peñalolén', 'Macul'],
  'Peñalolén': ['Ñuñoa', 'La Florida', 'La Reina'],
  'La Reina': ['Ñuñoa', 'Peñalolén', 'Las Condes'],
  'Macul': ['Ñuñoa', 'La Florida', 'Peñalolén'],
};
