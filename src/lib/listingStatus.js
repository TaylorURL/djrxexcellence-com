export const STATUS_LABELS = {
  coming_soon: "Coming Soon",
  active: "For Sale",
  pending: "Pending",
  sold: "Sold",
  off_market: "Off Market",
};

export const STATUS_TONES = {
  coming_soon: "bg-brand-blue text-white",
  active: "bg-brand-red text-on-accent",
  pending: "bg-brand-red-light text-ink",
  sold: "bg-ink text-white",
  off_market: "bg-ink-muted text-white",
};

export const PROPERTY_TYPE_LABELS = {
  single_family: "Single Family",
  townhouse: "Townhouse",
  condo: "Condo",
  multi_family: "Multi Family",
  land: "Land",
  farm_ranch: "Farm & Ranch",
  commercial: "Commercial",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? STATUS_LABELS.active;
}

export function statusTone(status) {
  return STATUS_TONES[status] ?? STATUS_TONES.active;
}

export function propertyTypeLabel(type) {
  return PROPERTY_TYPE_LABELS[type] ?? "Property";
}
