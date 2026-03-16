const API_VERSION = "v21";
const BASE_URL = "https://googleads.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface GoogleAdsClientConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  /** Customer ID — can include dashes (they're stripped automatically). */
  customerId: string;
  /** Optional login customer ID for MCC accounts. */
  loginCustomerId?: string;
}

export interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

export class GoogleAdsClient {
  readonly config: GoogleAdsClientConfig;
  readonly customerId: string;
  private tokenCache: TokenCache | null = null;

  constructor(config: GoogleAdsClientConfig) {
    this.config = config;
    this.customerId = config.customerId.replace(/-/g, "");
  }

  /** Get a valid access token, refreshing if needed. */
  async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      throw new GoogleAdsError(
        `Failed to get access token: ${JSON.stringify(data)}`,
        data
      );
    }

    this.tokenCache = {
      accessToken: data.access_token,
      // Refresh 60s before actual expiry
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  }

  /** Build standard headers for Google Ads API requests. */
  async headers(): Promise<Record<string, string>> {
    const accessToken = await this.getAccessToken();
    const h: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": this.config.developerToken,
      "Content-Type": "application/json",
    };
    if (this.config.loginCustomerId) {
      h["login-customer-id"] = this.config.loginCustomerId.replace(/-/g, "");
    }
    return h;
  }

  /** Build a full API URL for the customer. */
  url(path: string): string {
    return `${BASE_URL}/${API_VERSION}/customers/${this.customerId}${path}`;
  }

  /** Make an authenticated request to the Google Ads API. */
  async request<T = unknown>(
    path: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<T> {
    const h = await this.headers();
    const res = await fetch(this.url(path), {
      method: options.method ?? "POST",
      headers: h,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    const data = await res.json();

    if (data.error) {
      throw new GoogleAdsError(
        data.error.message || JSON.stringify(data.error),
        data.error
      );
    }

    return data as T;
  }
}

export class GoogleAdsError extends Error {
  details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "GoogleAdsError";
    this.details = details;
  }
}
