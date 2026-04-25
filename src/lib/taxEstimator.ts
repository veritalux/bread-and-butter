// Estimates effective tax rate for Salem, Oregon based on annual income.
// Combines federal income tax + Oregon state income tax + FICA.
// Uses 2024/2025 brackets as approximation.

const FEDERAL_STANDARD_DEDUCTION = 14600;
// Dependent filers: greater of $1,300 or (earned income + $450), capped at regular deduction
const FEDERAL_DEPENDENT_BASE_DEDUCTION = 1300;
const FEDERAL_DEPENDENT_EARNED_BONUS = 450;

const FEDERAL_BRACKETS: [number, number][] = [
  [11600, 0.10],
  [47150, 0.12],
  [100525, 0.22],
  [191950, 0.24],
  [243725, 0.32],
  [609350, 0.35],
  [Infinity, 0.37],
];

const OREGON_STANDARD_DEDUCTION = 2745;
// Oregon dependent deduction: greater of $1,100 or (earned income + $350), capped at regular deduction
const OREGON_DEPENDENT_BASE_DEDUCTION = 1100;
const OREGON_DEPENDENT_EARNED_BONUS = 350;

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

export function estimateTaxRate(monthlyIncome: number, isDependent = false): number {
  const annualIncome = monthlyIncome * 12;
  if (annualIncome <= 0) return 0;

  let federalDeduction: number;
  let oregonDeduction: number;

  if (isDependent) {
    federalDeduction = Math.min(
      FEDERAL_STANDARD_DEDUCTION,
      Math.max(FEDERAL_DEPENDENT_BASE_DEDUCTION, annualIncome + FEDERAL_DEPENDENT_EARNED_BONUS)
    );
    oregonDeduction = Math.min(
      OREGON_STANDARD_DEDUCTION,
      Math.max(OREGON_DEPENDENT_BASE_DEDUCTION, annualIncome + OREGON_DEPENDENT_EARNED_BONUS)
    );
  } else {
    federalDeduction = FEDERAL_STANDARD_DEDUCTION;
    oregonDeduction = OREGON_STANDARD_DEDUCTION;
  }

  const federalTaxable = Math.max(0, annualIncome - federalDeduction);
  const federalTax = calcProgressiveTax(federalTaxable, FEDERAL_BRACKETS);

  const oregonTaxable = Math.max(0, annualIncome - oregonDeduction);
  const oregonTax = calcProgressiveTax(oregonTaxable, OREGON_BRACKETS);

  // FICA (Social Security 6.2% up to $168,600 + Medicare 1.45%)
  const socialSecurity = Math.min(annualIncome, 168600) * 0.062;
  const medicare = annualIncome * 0.0145;

  const totalTax = federalTax + oregonTax + socialSecurity + medicare;
  const effectiveRate = Math.round((totalTax / annualIncome) * 100);

  return Math.min(effectiveRate, 50); // cap at 50%
}
