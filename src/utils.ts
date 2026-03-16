// ── Resource name builders ──

export function campaignResourceName(
  customerId: string,
  campaignId: string | number
): string {
  return `customers/${strip(customerId)}/campaigns/${campaignId}`;
}

export function adGroupResourceName(
  customerId: string,
  adGroupId: string | number
): string {
  return `customers/${strip(customerId)}/adGroups/${adGroupId}`;
}

export function adGroupAdResourceName(
  customerId: string,
  adGroupId: string | number,
  adId: string | number
): string {
  return `customers/${strip(customerId)}/adGroupAds/${adGroupId}~${adId}`;
}

export function geoTargetConstant(locationId: number): string {
  return `geoTargetConstants/${locationId}`;
}

export function conversionActionResourceName(
  customerId: string,
  conversionActionId: string | number
): string {
  return `customers/${strip(customerId)}/conversionActions/${conversionActionId}`;
}

// ── Micros helpers ──

/** Convert dollars to micros (e.g. 5.50 → 5_500_000). */
export function toMicros(dollars: number): number {
  return Math.round(dollars * 1_000_000);
}

/** Convert micros to dollars (e.g. 5_500_000 → 5.50). */
export function fromMicros(micros: number): number {
  return micros / 1_000_000;
}

// ── Date helpers ──

/** Format a Date as YYYY-MM-DD for GAQL queries. */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Get a date range from N days ago to today. */
export function dateRange(daysBack: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return { start: formatDate(start), end: formatDate(end) };
}

// ── Internal ──

function strip(customerId: string): string {
  return customerId.replace(/-/g, "");
}
