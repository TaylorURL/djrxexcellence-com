import { describe, expect, it } from "vitest";
import {
  estimateMonthlyCost,
  monthlyPrincipalAndInterest,
} from "@/lib/mortgage";

describe("monthlyPrincipalAndInterest", () => {
  it("amortizes a fixed rate loan", () => {
    // 300,000 at 6.5% over 30 years is 1896.20 a month.
    expect(monthlyPrincipalAndInterest(300000, 6.5, 30)).toBeCloseTo(1896.2, 1);
  });

  it("splits the principal evenly at a zero rate", () => {
    expect(monthlyPrincipalAndInterest(360000, 0, 30)).toBeCloseTo(1000, 6);
  });

  it("returns zero rather than dividing by an empty term", () => {
    expect(monthlyPrincipalAndInterest(300000, 6.5, 0)).toBe(0);
    expect(monthlyPrincipalAndInterest(0, 6.5, 30)).toBe(0);
  });
});

describe("estimateMonthlyCost", () => {
  it("adds escrow and dues to the loan payment", () => {
    const result = estimateMonthlyCost({
      homePrice: 400000,
      downPercent: 25,
      rate: 6,
      years: 30,
      annualTaxes: 9600,
      annualInsurance: 2400,
      monthlyHoa: 50,
    });

    expect(result.down).toBe(100000);
    expect(result.loan).toBe(300000);
    expect(result.taxes).toBe(800);
    expect(result.insurance).toBe(200);
    expect(result.total).toBeCloseTo(result.principalAndInterest + 1050, 6);
  });

  it("treats blank and junk inputs as zero", () => {
    const result = estimateMonthlyCost({
      homePrice: 250000,
      downPercent: "",
      rate: "",
      years: 30,
      annualTaxes: "not a number",
      annualInsurance: -100,
    });

    expect(result.down).toBe(0);
    expect(result.loan).toBe(250000);
    expect(result.taxes).toBe(0);
    expect(result.insurance).toBe(0);
    expect(result.principalAndInterest).toBeCloseTo(250000 / 360, 6);
  });
});
