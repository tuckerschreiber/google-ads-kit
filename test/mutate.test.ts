import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleAdsClient } from "../src/client.js";
import { mutate } from "../src/mutate.js";

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

describe("mutate", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("sends operations to the mutate endpoint", async () => {
    const fetchMock = mockFetch({
      mutateOperationResponses: [
        { campaignResult: { resourceName: "customers/123/campaigns/456" } },
      ],
    });

    const client = new GoogleAdsClient(mockConfig);
    const result = await mutate(client, [
      { campaignOperation: { create: { name: "Test" } } },
    ]);

    expect(result.mutateOperationResponses).toHaveLength(1);

    // Verify the request body
    const call = fetchMock.mock.calls[1];
    const body = JSON.parse(call[1].body);
    expect(body.mutateOperations).toHaveLength(1);
    expect(body.partialFailure).toBe(true);
  });

  it("sends validateOnly when specified", async () => {
    const fetchMock = mockFetch({ mutateOperationResponses: [] });

    const client = new GoogleAdsClient(mockConfig);
    await mutate(client, [{ campaignOperation: { create: {} } }], {
      validateOnly: true,
    });

    const call = fetchMock.mock.calls[1];
    const body = JSON.parse(call[1].body);
    expect(body.validateOnly).toBe(true);
  });

  it("throws on partial failure", async () => {
    mockFetch({
      mutateOperationResponses: [],
      partialFailureError: { message: "Some fields failed" },
    });

    const client = new GoogleAdsClient(mockConfig);
    await expect(
      mutate(client, [{ campaignOperation: { create: {} } }])
    ).rejects.toThrow("Partial failure");
  });
});
