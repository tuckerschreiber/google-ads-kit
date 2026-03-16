import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleAdsClient, GoogleAdsError } from "../src/client.js";

const mockConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  developerToken: "test-dev-token",
  refreshToken: "test-refresh-token",
  customerId: "123-456-7890",
};

describe("GoogleAdsClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("strips dashes from customer ID", () => {
    const client = new GoogleAdsClient(mockConfig);
    expect(client.customerId).toBe("1234567890");
  });

  it("builds correct API URL", () => {
    const client = new GoogleAdsClient(mockConfig);
    expect(client.url("/googleAds:mutate")).toBe(
      "https://googleads.googleapis.com/v21/customers/1234567890/googleAds:mutate"
    );
  });

  it("refreshes access token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            access_token: "fresh-token",
            expires_in: 3600,
          }),
      })
    );

    const client = new GoogleAdsClient(mockConfig);
    const token = await client.getAccessToken();
    expect(token).toBe("fresh-token");
  });

  it("caches access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          access_token: "fresh-token",
          expires_in: 3600,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new GoogleAdsClient(mockConfig);
    await client.getAccessToken();
    await client.getAccessToken();

    // Should only call fetch once due to caching
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws GoogleAdsError on token failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve({ error: "invalid_grant" }),
      })
    );

    const client = new GoogleAdsClient(mockConfig);
    await expect(client.getAccessToken()).rejects.toThrow(GoogleAdsError);
  });

  it("builds headers with login-customer-id for MCC", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ access_token: "token", expires_in: 3600 }),
      })
    );

    const client = new GoogleAdsClient({
      ...mockConfig,
      loginCustomerId: "999-888-7777",
    });
    const headers = await client.headers();
    expect(headers["login-customer-id"]).toBe("9998887777");
  });

  it("throws on API error response", async () => {
    const fetchMock = vi
      .fn()
      // Token request
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ access_token: "token", expires_in: 3600 }),
      })
      // API request
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            error: { message: "Something went wrong", code: 400 },
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const client = new GoogleAdsClient(mockConfig);
    await expect(client.request("/test")).rejects.toThrow(GoogleAdsError);
  });
});
