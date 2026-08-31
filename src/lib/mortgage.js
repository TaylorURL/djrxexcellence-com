/**
 * Amortized payment for a fixed-rate loan.
 *
 * A zero rate divides the principal across the term rather than dividing by a
 * zero denominator.
 */
export function monthlyPrincipalAndInterest(principal, annualRate, years) {
  if (!(principal > 0) || !(years > 0)) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const payments = years * 12;
  if (monthlyRate === 0) return principal / payments;
  const growth = (1 + monthlyRate) ** payments;
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function nonNegative(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function estimateMonthlyCost({
  homePrice,
  downPercent,
  rate,
  years,
  annualTaxes,
  annualInsurance,
  monthlyHoa = 0,
}) {
  const value = nonNegative(homePrice);
  const down = (value * nonNegative(downPercent)) / 100;
  const loan = Math.max(value - down, 0);
  const principalAndInterest = monthlyPrincipalAndInterest(
    loan,
    nonNegative(rate),
    nonNegative(years),
  );
  const taxes = nonNegative(annualTaxes) / 12;
  const insurance = nonNegative(annualInsurance) / 12;
  const hoa = nonNegative(monthlyHoa);

  return {
    down,
    loan,
    principalAndInterest,
    taxes,
    insurance,
    hoa,
    total: principalAndInterest + taxes + insurance + hoa,
  };
}
