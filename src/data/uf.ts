// Valor de la UF en pesos usado en todo el prototipo. Es ficticio: no se actualiza ni proviene de una fuente real.
export const UF_CLP = 39000;

export function ufToClp(uf: number): number {
  return uf * UF_CLP;
}

export function clpToUf(clp: number): number {
  return Math.round(clp / UF_CLP);
}
