// Estimates effective tax rate for Salem, Oregon based on annual income.
// Combines federal income tax + Oregon state income tax + FICA.
// Uses 2024/2025 brackets. Single filer. Dependent filers get a reduced standard deduction.

const FEDERAL_STANDARD_DEDUCTION = 14600;
const OREGON_STANDARD_DEDUCTION = 2745;

const FEDERAL_BRACKETS: [number, number][] = [
  [11600, 0.10],
  [47150, 0.12],
  [100525, 0.22],
  [191950, 0.24],
  [243725, 0.32],
  [609350, 0.35],
  [Infinity, 0.37],
];

const OREGON_BRACKETS: [number, number][] = [
  [4050, 0.0475],
  [10200, 0.0675],
  [125000, 0.0875],
  [Infinity, 0.099],
];

function calcProgressiveTax(taxableIncome: number, brackets: [number, number][]): number {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, limit) - prev;
    tax += taxable * rate;
    prev = limit;
  }
  return tax;
}

// When claimed as a dependent, the standard deduction is limited to
// the greater of $1,300 or (earned income + $450), capped at the normal deduction.
function dependentDeduction(annualIncome: number, normalDeduction: number): number {
  return Math.max(1300, Math.min(normalDeduction, annualIncome + 450));
}

export function estimateTaxRate(monthlyIncome: number, isDependent = false): number {
  const annualIncome = monthlyIncome * 12;
  if (annualIncome <= 0) return 0;

  const fedDeduction = isDependent
    ? dependentDeduction(annualIncome, FEDERAL_STANDARD_DEDUCTION)
    : FEDERAL_STANDARD_DEDUCTION;
  const orDeduction = isDependent
    ? dependentDeduction(annualIncome, OREGON_STANDARD_DEDUCTION)
    : OREGON_STANDARD_DEDUCTION;

  const federalTax = calcProgressiveTax(Math.max(0, annualIncome - fedDeduction), FEDERAL_BRACKETS);
  const oregonTax = calcProgressiveTax(Math.max(0, annualIncome - orDeduction), OREGON_BRACKETS);

  // FICA (Social Security 6.2% up to $168,600 + Medicare 1.45%)
  const socialSecurity = Math.min(annualIncome, 168600) * 0.062;
  const medicare = annualIncome * 0.0145;

  const totalTax = federalTax + oregonTax + socialSecurity + medicare;
  const effectiveRate = Math.round((totalTax / annualIncome) * 100);

  return Math.min(effectiveRate, 50); // cap at 50%
}
