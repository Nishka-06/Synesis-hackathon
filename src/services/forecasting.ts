import { HistoricalArrival, ArrivalForecast, DepartmentId } from '../types/hospital';

export function calculateArrivalForecast(
  history: HistoricalArrival[],
  departmentId: DepartmentId = 'ED',
  surgeFactor: number = 1.0,
  availableBeds: number = 4
): ArrivalForecast[] {
  const filtered = history.filter((h) => h.departmentId === departmentId);
  const forecasts: ArrivalForecast[] = [];

  const now = new Date('2026-10-12T22:00:00Z');

  // Compute average arrivals by (dayOfWeek, hourOfDay) across historical dataset
  const dayHourMap: Record<string, { sum: number; count: number }> = {};
  filtered.forEach((item) => {
    const key = `${item.dayOfWeek}-${item.hourOfDay}`;
    if (!dayHourMap[key]) {
      dayHourMap[key] = { sum: 0, count: 0 };
    }
    dayHourMap[key].sum += item.count;
    dayHourMap[key].count += 1;
  });

  // Project next 12 hours
  for (let offset = 1; offset <= 12; offset++) {
    const targetDate = new Date(now.getTime() + offset * 3600 * 1000);
    const day = targetDate.getUTCDay();
    const hour = targetDate.getUTCHours();
    const key = `${day}-${hour}`;

    const cell = dayHourMap[key];
    const baseMean = cell && cell.count > 0 ? cell.sum / cell.count : 4.5;

    // Apply surge factor and slight statistical variance
    const predicted = Math.max(1, Math.round(baseMean * surgeFactor));
    const variance = Math.max(1.2, Math.sqrt(predicted));
    const lowerBound = Math.max(0, Math.round(predicted - 1.96 * variance));
    const upperBound = Math.round(predicted + 1.96 * variance);

    // Format hour label e.g. "23:00", "00:00", "01:00"
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

    // Capacity shortage risk assessment
    // Assumes an hourly bed admission turnover capacity
    let risk: 'none' | 'moderate' | 'high' | 'critical' = 'none';
    if (predicted > availableBeds + 4) {
      risk = 'critical';
    } else if (predicted > availableBeds + 2) {
      risk = 'high';
    } else if (predicted > availableBeds) {
      risk = 'moderate';
    }

    forecasts.push({
      timestamp: targetDate.toISOString(),
      departmentId,
      hourLabel,
      predictedArrivals: predicted,
      lowerBound,
      upperBound,
      availableCapacity: availableBeds,
      capacityShortageRisk: risk,
    });
  }

  return forecasts;
}
