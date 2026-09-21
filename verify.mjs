import { computeEconomics } from './calc-core.js';

const scenarios = [
  {
    name: 'Базовый Комфорт',
    values: { tripKm: 300, tariff: 35, pickupKm: 20, returnKm: 300, consumption: 8, fuelPrice: 62, runningCost: 8, otherCosts: 0, returnProbability: 30, targetProfit: 5000, returnTariff: 35 },
    expected: { expectedProfit: 5615, expectedRevenue: 13650, totalCosts: 8035, totalKm: 620, worstProfit: 2465 },
  },
  {
    name: 'Ближний рейс',
    values: { tripKm: 120, tariff: 25, pickupKm: 15, returnKm: 120, consumption: 7.5, fuelPrice: 62, runningCost: 8, otherCosts: 0, returnProbability: 20, targetProfit: 2500, returnTariff: 25 },
    expected: { expectedProfit: 374, expectedRevenue: 3600, totalCosts: 3226, totalKm: 255, worstProfit: -226 },
  },
  {
    name: 'Аэропорт',
    values: { tripKm: 210, tariff: 35, pickupKm: 25, returnKm: 210, consumption: 8, fuelPrice: 62, runningCost: 8, otherCosts: 500, returnProbability: 35, targetProfit: 5000, returnTariff: 35 },
    expected: { expectedProfit: 3655, expectedRevenue: 9923, totalCosts: 6267, totalKm: 445, worstProfit: 1083 },
  },
  {
    name: 'Дальний рейс',
    values: { tripKm: 800, tariff: 45, pickupKm: 35, returnKm: 800, consumption: 9, fuelPrice: 62, runningCost: 10, otherCosts: 2500, returnProbability: 15, targetProfit: 15000, returnTariff: 45 },
    expected: { expectedProfit: 13427, expectedRevenue: 41400, totalCosts: 27973, totalKm: 1635, worstProfit: 8027 },
  },
];

for (const scenario of scenarios) {
  const result = computeEconomics(scenario.values);
  for (const [key, expected] of Object.entries(scenario.expected)) {
    const actual = Math.round(result[key]);
    if (actual !== expected) throw new Error(`${scenario.name}: ${key} = ${actual}, ожидалось ${expected}`);
  }
  console.log(`OK: ${scenario.name}`);
}

const zeroProbability = computeEconomics({ ...scenarios[0].values, returnProbability: 0 });
if (Math.round(zeroProbability.expectedProfit) !== Math.round(zeroProbability.worstProfit)) {
  throw new Error('При 0% обратки ожидаемая прибыль должна совпадать с худшим сценарием');
}
console.log('OK: 0% обратки совпадает с полностью холостым возвратом');
