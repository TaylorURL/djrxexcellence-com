import { useState } from "react";
import { rateSurvey } from "@/data/carryingCosts";

/**
 * The inputs every cost view shares, and their opening values.
 *
 * The price opens at the middle of what the eight towns actually trade at, so
 * the first chart a visitor sees is already about a house they might buy. The
 * rate opens on the survey figure held in `carryingCosts.js`.
 */
export function useCostInputs(initialPrice = 300000) {
  const [homePrice, setHomePrice] = useState(initialPrice);
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState(rateSurvey.thirtyYearFixed);
  const [districts, setDistricts] = useState("typical");

  return {
    values: { homePrice, downPercent, rate, districts },
    setHomePrice,
    setDownPercent,
    setRate,
    setDistricts,
  };
}
