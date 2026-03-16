import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleAdsClient } from "../src/client.js";
import { query, queryAll } from "../src/query.js";

const mockConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  developerToken: "test-dev-token",
  refreshToken: "test-refresh-token",
  customerId: "1234567890",
};

function mockFetch(...responses: unknown[]) {
  const tokenResponse = {
    json: () => Promise.resolve({ access_token: "token", expires_in: 3600 }),
  };
  const fn = vi.fn();
  fn.mockResolvedValueOnce(tokenResponse);
  for (const r of responses) {
    fn.mockResolvedValueOnce({ json: () => Promise.resolve(r) });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("query", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("sends GAQL to search endpoint", async () => {
    const fetchMock = mockFetch({
      results: [{ campaign: { name: "Test" } }],
    });

    const client = new GoogleAdsClient(mockConfig);
    const result = await query(client, "SELECT campaign.name FROM campaign");

    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual({ campaign: { name: "Test" } });

    const call = fetchMock.mock.calls[1];
    expect(call[0]).toContain("/googleAds:search");
    const body = JSON.parse(call[1].body);
    expect(body.query).toBe("SELECT campaign.name FROM campaign");
  });

  it("handles empty results", async () => {
    mockFetch({});

    const client = new GoogleAdsClient(mockConfig);
    const result = await query(client, "SELECT campaign.name FROM campaign");
    expect(result.results).toEqual([]);
  });
});

describe("queryAll", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("paginates through all results", async () => {
    const tokenResponse = {
      json: () => Promise.resolve({ access_token: "token", expires_in: 3600 }),
    };
    const fn = vi.fn();
    fn.mockResolvedValueOnce(tokenResponse);
    fn.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          results: [{ campaign: { name: "A" } }],
          nextPageToken: "page2",
        }),
    });
    fn.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          results: [{ campaign: { name: "B" } }],
        }),
    });
    vi.stubGlobal("fetch", fn);

    const client = new GoogleAdsClient(mockConfig);
    const results = await queryAll(client, "SELECT campaign.name FROM campaign");

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ campaign: { name: "A" } });
    expect(results[1]).toEqual({ campaign: { name: "B" } });
  });
});
