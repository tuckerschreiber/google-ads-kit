import { describe, it, expect } from "vitest";
import {
  campaignResourceName,
  adGroupResourceName,
  adGroupAdResourceName,
  geoTargetConstant,
  conversionActionResourceName,
  toMicros,
  fromMicros,
  formatDate,
  dateRange,
} from "../src/utils.js";

describe("resource name builders", () => {
  it("builds campaign resource name", () => {
    expect(campaignResourceName("123-456-7890", "111")).toBe(
      "customers/1234567890/campaigns/111"
    );
  });

  it("builds ad group resource name", () => {
    expect(adGroupResourceName("1234567890", 222)).toBe(
      "customers/1234567890/adGroups/222"
    );
  });

  it("builds ad group ad resource name", () => {
    expect(adGroupAdResourceName("1234567890", 222, 333)).toBe(
      "customers/1234567890/adGroupAds/222~333"
    );
  });

  it("builds geo target constant", () => {
    expect(geoTargetConstant(2840)).toBe("geoTargetConstants/2840");
  });

  it("builds conversion action resource name", () => {
    expect(conversionActionResourceName("1234567890", "555")).toBe(
      "customers/1234567890/conversionActions/555"
    );
  });
});

describe("micros helpers", () => {
  it("converts dollars to micros", () => {
    expect(toMicros(5.5)).toBe(5_500_000);
    expect(toMicros(0)).toBe(0);
    expect(toMicros(100)).toBe(100_000_000);
  });

  it("converts micros to dollars", () => {
    expect(fromMicros(5_500_000)).toBe(5.5);
    expect(fromMicros(0)).toBe(0);
    expect(fromMicros(100_000_000)).toBe(100);
  });

  it("round-trips correctly", () => {
    expect(fromMicros(toMicros(12.34))).toBe(12.34);
  });
});

describe("date helpers", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date("2026-03-15T10:00:00Z");
    expect(formatDate(date)).toBe("2026-03-15");
  });

  it("generates a date range", () => {
    const range = dateRange(7);
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.start < range.end).toBe(true);
  });
});
