import { MaterialItem, BOQSummary } from '../types';

export function calculateBOQ(
  materials: MaterialItem[],
  agencyMarginPercent: number = 15,
  gstPercent: number = 18
): BOQSummary {
  let materialSubtotal = 0;
  let laborSubtotal = 0;
  let totalSqFtCovered = 0;

  for (const item of materials) {
    const matCost = item.rate * item.quantity;
    const labCost = item.laborRatePerUnit * item.quantity;
    materialSubtotal += matCost;
    laborSubtotal += labCost;

    if (item.unit === 'sq.ft') {
      totalSqFtCovered += item.quantity;
    }
  }

  const baseCost = materialSubtotal + laborSubtotal;
  const gstAmount = Math.round(baseCost * (gstPercent / 100));
  const architectMarginAmount = Math.round(baseCost * (agencyMarginPercent / 100));
  const finalClientTotal = baseCost + gstAmount + architectMarginAmount;

  return {
    materialSubtotal,
    laborSubtotal,
    baseCost,
    gstAmount,
    architectMarginAmount,
    finalClientTotal,
    totalSqFtCovered
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
