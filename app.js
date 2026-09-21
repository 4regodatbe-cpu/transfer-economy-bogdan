import { computeEconomics } from './calc-core.js';

const BASE_RATES = {
  economy: { name: 'Эконом', rate: 25 },
  comfort: { name: 'Комфорт', rate: 35 },
  comfortPlus: { name: 'Комфорт+', rate: 45 },
};

const DEFAULTS = {
  classKey: 'comfort', tripKm: 300, tariff: 35, pickupKm: 20, returnKm: 300,
  consumption: 8, fuelPrice: 62, runningCost: 8, otherCosts: 0,
  returnProbability: 30, targetProfit: 5000, returnTariff: 35,
};

const SCENARIOS = {
  near: { classKey: 'economy', tripKm: 120, tariff: 25, pickupKm: 15, returnKm: 120, consumption: 7.5, fuelPrice: 62, runningCost: 8, otherCosts: 0, returnProbability: 20, targetProfit: 2500, returnTariff: 25 },
  airport: { classKey: 'comfort', tripKm: 210, tariff: 35, pickupKm: 25, returnKm: 210, consumption: 8, fuelPrice: 62, runningCost: 8, otherCosts: 500, returnProbability: 35, targetProfit: 5000, returnTariff: 35 },
  long: { classKey: 'comfortPlus', tripKm: 800, tariff: 45, pickupKm: 35, returnKm: 800, consumption: 9, fuelPrice: 62, runningCost: 10, otherCosts: 2500, returnProbability: 15, targetProfit: 15000, returnTariff: 45 },
};

const inputIds = ['tripKm', 'tariff', 'pickupKm', 'returnKm', 'consumption', 'fuelPrice', 'runningCost', 'otherCosts', 'returnProbability', 'targetProfit', 'returnTariff'];
const inputs = Object.fromEntries(inputIds.map(id => [id, document.getElementById(id)]));
let selectedClass = DEFAULTS.classKey;

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const rub = value => `${money.format(Math.round(value))} ₽`;
const km = value => `${decimal.format(value)} км`;
const valueOf = id => Math.max(0, Number.parseFloat(inputs[id].value) || 0);

function calculate(overrides = {}) {
  const v = Object.fromEntries(inputIds.map(id => [id, valueOf(id)]));
  Object.assign(v, overrides);
  return computeEconomics(v);
}

function setStatus(result) {
  const card = document.getElementById('verdictCard');
  const pill = document.getElementById('statusPill');
  const copy = document.getElementById('verdictCopy');
  const goalGap = result.expectedProfit - result.targetProfit;
  let label, color, text;

  if (result.expectedProfit < 0) {
    label = 'Убыточно'; color = 'var(--red)';
    text = `Даже с вероятной обраткой рейс приносит убыток ${rub(Math.abs(result.expectedProfit))}. Тариф или условия нужно менять.`;
  } else if (goalGap < 0) {
    label = 'На грани'; color = 'var(--yellow)';
    text = `Рейс остаётся в плюсе, но до цели ${rub(result.targetProfit)} не хватает ${rub(Math.abs(goalGap))}.`;
  } else {
    label = 'Выгодно'; color = 'var(--green)';
    text = `Цель по прибыли выполнена с запасом ${rub(goalGap)} с учётом вероятности обратного заказа.`;
  }

  card.style.setProperty('--status-color', color);
  pill.style.background = color;
  pill.textContent = label;
  copy.textContent = text;
  const meter = document.getElementById('profitMeter');
  const score = result.targetProfit > 0 ? Math.max(0, Math.min(100, result.expectedProfit / result.targetProfit * 72)) : (result.expectedProfit >= 0 ? 100 : 0);
  meter.style.width = `${score}%`;
}

function renderRates(result) {
  const container = document.getElementById('rateCards');
  container.innerHTML = Object.entries(BASE_RATES).map(([key, item]) => {
    const recommended = Math.max(item.rate, Math.ceil(Math.max(0, result.requiredOutboundRate)));
    const classProfit = result.tripKm * item.rate + result.expectedReturnRevenue - result.totalCosts;
    const baseWorks = item.rate >= result.requiredOutboundRate;
    const note = baseWorks
      ? `Базовая ставка даёт ${rub(classProfit)} прибыли`
      : `Нужно поднять базу на ${rub(recommended - item.rate)} за км`;
    return `<article class="rate-card ${key === selectedClass ? 'selected' : ''}">
      <header><b>${item.name}</b><span>база ${item.rate} ₽</span></header>
      <strong class="rate ${baseWorks ? 'positive' : 'negative'}">${recommended} ₽/км</strong>
      <p>${note}</p>
    </article>`;
  }).join('');
}

function render() {
  const result = calculate();
  inputs.returnProbability.style.setProperty('--range', `${result.returnProbability}%`);
  document.getElementById('probabilityValue').textContent = `${Math.round(result.returnProbability)}%`;
  document.getElementById('expectedProfit').textContent = rub(result.expectedProfit);
  document.getElementById('marginPercent').textContent = `${decimal.format(result.margin)}%`;
  document.getElementById('outboundRevenue').textContent = rub(result.outboundRevenue);
  document.getElementById('expectedRevenue').textContent = rub(result.expectedRevenue);
  document.getElementById('totalCosts').textContent = rub(result.totalCosts);
  document.getElementById('worstProfit').textContent = rub(result.worstProfit);
  document.getElementById('fuelLiters').textContent = `· ${decimal.format(result.fuelLiters)} л`;
  document.getElementById('fuelCost').textContent = rub(result.fuelCost);
  document.getElementById('wearCost').textContent = rub(result.wearCost);
  document.getElementById('otherCostOutput').textContent = rub(result.otherCosts);
  document.getElementById('totalKm').textContent = km(result.totalKm);
  document.getElementById('paidKm').textContent = km(result.expectedPaidKm);
  document.getElementById('emptyKm').textContent = km(result.expectedEmptyKm);
  setStatus(result);
  renderRates(result);
}

function setValues(values, updateScenario = true) {
  selectedClass = values.classKey || selectedClass;
  for (const id of inputIds) if (values[id] !== undefined) inputs[id].value = values[id];
  document.querySelectorAll('.class-tabs button').forEach(button => button.classList.toggle('active', button.dataset.class === selectedClass));
  if (updateScenario) document.getElementById('scenarioSelect').value = 'custom';
  render();
}

for (const input of Object.values(inputs)) {
  input.addEventListener('input', () => {
    document.getElementById('scenarioSelect').value = 'custom';
    render();
  });
}

document.querySelectorAll('.class-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    selectedClass = button.dataset.class;
    const rate = BASE_RATES[selectedClass].rate;
    inputs.tariff.value = rate;
    inputs.returnTariff.value = rate;
    document.getElementById('scenarioSelect').value = 'custom';
    document.querySelectorAll('.class-tabs button').forEach(item => item.classList.toggle('active', item === button));
    render();
  });
});

document.getElementById('scenarioSelect').addEventListener('change', event => {
  if (SCENARIOS[event.target.value]) setValues(SCENARIOS[event.target.value], false);
});

document.getElementById('resetButton').addEventListener('click', () => setValues(DEFAULTS));
document.getElementById('infoButton').addEventListener('click', event => {
  const note = document.getElementById('formulaNote');
  note.hidden = !note.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!note.hidden));
});

// Exposed for deterministic verification in the browser console and automated smoke tests.
window.transferCalculator = { calculate, BASE_RATES, SCENARIOS };
render();
