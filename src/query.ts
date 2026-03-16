import { GoogleAdsClient } from "./client.js";

export interface QueryOptions {
  /** Maximum number of rows to return. */
  pageSize?: number;
  /** Page token for pagination. */
  pageToken?: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  results: T[];
  nextPageToken?: string;
  totalResultsCount?: number;
  fieldMask?: string;
}

/**
 * Execute a GAQL query against the Google Ads API.
 *
 * ```ts
 * const { results } = await query(client, "SELECT campaign.name FROM campaign");
 * ```
 */
export async function query<T = Record<string, unknown>>(
  client: GoogleAdsClient,
  gaql: string,
  options: QueryOptions = {}
): Promise<QueryResult<T>> {
  const body: Record<string, unknown> = { query: gaql };

  if (options.pageSize) body.pageSize = options.pageSize;
  if (options.pageToken) body.pageToken = options.pageToken;

  const data = await client.request<QueryResult<T>>("/googleAds:search", {
    body,
  });

  return {
    results: data.results ?? [],
    nextPageToken: data.nextPageToken,
    totalResultsCount: data.totalResultsCount,
    fieldMask: data.fieldMask,
  };
}

/**
 * Execute a GAQL query and automatically paginate through all results.
 */
export async function queryAll<T = Record<string, unknown>>(
  client: GoogleAdsClient,
  gaql: string,
  pageSize = 10000
): Promise<T[]> {
  const all: T[] = [];
  let pageToken: string | undefined;

  do {
    const result = await query<T>(client, gaql, { pageSize, pageToken });
    all.push(...result.results);
    pageToken = result.nextPageToken;
  } while (pageToken);

  return all;
}
