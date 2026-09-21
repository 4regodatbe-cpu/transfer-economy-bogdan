export function computeEconomics(v) {
  const probability = Math.min(100, Math.max(0, v.returnProbability)) / 100;
  const totalKm = v.pickupKm + v.tripKm + v.returnKm;
  const fuelLiters = totalKm * v.consumption / 100;
  const fuelCost = fuelLiters * v.fuelPrice;
  const wearCost = totalKm * v.runningCost;
  const totalCosts = fuelCost + wearCost + v.otherCosts;
  const outboundRevenue = v.tripKm * v.tariff;
  const expectedReturnRevenue = probability * v.returnKm * v.returnTariff;
  const expectedRevenue = outboundRevenue + expectedReturnRevenue;
  const expectedProfit = expectedRevenue - totalCosts;
  const worstProfit = outboundRevenue - totalCosts;
  const expectedPaidKm = v.tripKm + probability * v.returnKm;
  const expectedEmptyKm = v.pickupKm + (1 - probability) * v.returnKm;
  const margin = expectedRevenue > 0 ? expectedProfit / expectedRevenue * 100 : 0;
  const requiredOutboundRate = v.tripKm > 0
    ? (totalCosts + v.targetProfit - expectedReturnRevenue) / v.tripKm
    : 0;

  return { ...v, probability, totalKm, fuelLiters, fuelCost, wearCost, totalCosts, outboundRevenue, expectedReturnRevenue, expectedRevenue, expectedProfit, worstProfit, expectedPaidKm, expectedEmptyKm, margin, requiredOutboundRate };
}
