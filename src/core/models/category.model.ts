/** Categoría de gasto para el desglose de Análisis (donut + leyenda). */
export type SpendingCategory = {
  name: string;
  pct: number;
  color: string;
  amount: number;
};

export type MonthlySpending = {
  month: string;
  value: number;
  current: boolean;
};
