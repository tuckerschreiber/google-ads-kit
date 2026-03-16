import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleAdsClient } from "../src/client.js";
import { campaigns } from "../src/resources/campaigns.js";

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

describe("campaigns", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("creates a campaign with budget", async () => {
    const fetchMock = mockFetch({
      mutateOperationResponses: [
        {
          campaignBudgetResult: {
            resourceName: "customers/123/campaignBudgets/789",
          },
        },
        {
          campaignResult: {
            resourceName: "customers/123/campaigns/456",
          },
        },
      ],
    });

    const client = new GoogleAdsClient(mockConfig);
    const c = campaigns(client);

    const resourceName = await c.create({
      name: "Test Campaign",
      dailyBudgetMicros: 10_000_000,
    });

    expect(resourceName).toBe("customers/123/campaigns/456");

    const call = fetchMock.mock.calls[1];
    const body = JSON.parse(call[1].body);
    expect(body.mutateOperations).toHaveLength(2);
    expect(body.mutateOperations[0].campaignBudgetOperation).toBeDefined();
    expect(body.mutateOperations[1].campaignOperation).toBeDefined();
  });

  it("updates campaign status", async () => {
    const fetchMock = mockFetch({ mutateOperationResponses: [{}] });

    const client = new GoogleAdsClient(mockConfig);
    const c = campaigns(client);

    await c.update("customers/123/campaigns/456", { status: "ENABLED" });

    const call = fetchMock.mock.calls[1];
    const body = JSON.parse(call[1].body);
    const op = body.mutateOperations[0].campaignOperation;
    expect(op.update.status).toBe("ENABLED");
    expect(op.updateMask).toBe("status");
  });

  it("sets geo-targeting locations", async () => {
    const fetchMock = mockFetch({ mutateOperationResponses: [{}, {}, {}] });

    const client = new GoogleAdsClient(mockConfig);
    const c = campaigns(client);

    await c.setLocations({
      campaignResourceName: "customers/123/campaigns/456",
      locationIds: [2840, 2124],
    });

    const call = fetchMock.mock.calls[1];
    const body = JSON.parse(call[1].body);
    // 1 campaign update + 2 location criteria
    expect(body.mutateOperations).toHaveLength(3);
  });
});
