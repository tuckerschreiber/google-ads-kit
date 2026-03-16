import { GoogleAdsClient, GoogleAdsError } from "./client.js";

export interface MutateOptions {
  /** If true, validates without executing. */
  validateOnly?: boolean;
  /** If true, returns partial results on failure. Defaults to true. */
  partialFailure?: boolean;
}

export interface MutateResult {
  mutateOperationResponses: Record<string, unknown>[];
  partialFailureError?: unknown;
}

/**
 * Execute one or more mutate operations against the Google Ads API.
 *
 * Operations use the same format as the REST API:
 * ```ts
 * await mutate(client, [
 *   { campaignOperation: { create: { name: "My Campaign", ... } } }
 * ]);
 * ```
 */
export async function mutate(
  client: GoogleAdsClient,
  operations: Record<string, unknown>[],
  options: MutateOptions = {}
): Promise<MutateResult> {
  const body: Record<string, unknown> = {
    mutateOperations: operations,
    partialFailure: options.partialFailure ?? true,
  };

  if (options.validateOnly) {
    body.validateOnly = true;
  }

  const data = await client.request<MutateResult>("/googleAds:mutate", {
    body,
  });

  if (data.partialFailureError) {
    const err = new GoogleAdsError(
      `Partial failure: ${JSON.stringify(data.partialFailureError)}`,
      data.partialFailureError
    );
    // Attach the full result so callers can inspect successful operations
    (err as any).result = data;
    throw err;
  }

  return data;
}
