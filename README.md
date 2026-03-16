# google-ads-kit

REST-first TypeScript SDK for the Google Ads API. No gRPC, no native bindings — works in Node.js, Deno, Bun, and edge runtimes.

## Why?

Google has no official Node.js SDK for the Google Ads API. The community alternatives rely on gRPC, which breaks in serverless/edge environments and adds heavy native dependencies. `google-ads-kit` uses the REST API directly with built-in `fetch` — zero native deps, works everywhere.

## Install

```bash
npm install google-ads-kit
```

## Quick Start

```typescript
import { GoogleAdsClient, campaigns, query, toMicros } from "google-ads-kit";

const client = new GoogleAdsClient({
  clientId: process.env.GOOGLE_ADS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  customerId: "123-456-7890",
});

// Run a GAQL query
const { results } = await query(client, `
  SELECT campaign.name, metrics.clicks
  FROM campaign
  WHERE segments.date DURING LAST_7_DAYS
`);

// Create a campaign with budget
const c = campaigns(client);
const resourceName = await c.create({
  name: "My Campaign",
  dailyBudgetMicros: toMicros(50), // $50/day
});
```

## API

### Client

```typescript
const client = new GoogleAdsClient({
  clientId: "...",
  clientSecret: "...",
  developerToken: "...",
  refreshToken: "...",
  customerId: "123-456-7890",
  loginCustomerId: "...", // Optional, for MCC accounts
});
```

The client handles OAuth token refresh automatically and caches tokens until they expire.

### Queries (GAQL)

```typescript
import { query, queryAll } from "google-ads-kit";

// Single page
const { results } = await query(client, "SELECT campaign.name FROM campaign");

// Auto-paginate through all results
const allRows = await queryAll(client, "SELECT campaign.name FROM campaign");
```

### Mutations

```typescript
import { mutate } from "google-ads-kit";

// Raw mutate — same format as the REST API
await mutate(client, [
  {
    campaignOperation: {
      create: { name: "New Campaign", ... }
    }
  }
], { validateOnly: true });
```

### Campaigns

```typescript
import { campaigns } from "google-ads-kit";

const c = campaigns(client);

// Create (includes budget)
const resourceName = await c.create({
  name: "Spring Sale",
  dailyBudgetMicros: toMicros(25),
  status: "PAUSED", // default
});

// Update
await c.update(resourceName, { status: "ENABLED" });

// Set geo-targeting
await c.setLocations({
  campaignResourceName: resourceName,
  locationIds: [2840, 2124], // US, Canada
});

// Update budget
await c.updateBudget(budgetResourceName, toMicros(50));
```

### Ad Groups

```typescript
import { adGroups } from "google-ads-kit";

const ag = adGroups(client);

const adGroupResource = await ag.create({
  campaignResourceName: "customers/123/campaigns/456",
  name: "Brand Keywords",
  cpcBidMicros: toMicros(2.5),
});
```

### Keywords

```typescript
import { keywords } from "google-ads-kit";

const kw = keywords(client);

// Add keywords to an ad group
await kw.create({
  adGroupResourceName: "customers/123/adGroups/789",
  keywords: [
    { text: "running shoes", matchType: "PHRASE" },
    { text: "nike sneakers", matchType: "EXACT" },
  ],
});

// Add negative keywords to a campaign
await kw.addNegative({
  campaignResourceName: "customers/123/campaigns/456",
  keywords: ["free", "cheap", "used"],
});
```

### Ads (RSA)

```typescript
import { ads } from "google-ads-kit";

const a = ads(client);

// Create a Responsive Search Ad
await a.createRSA({
  adGroupResourceName: "customers/123/adGroups/789",
  headlines: [
    "Buy Running Shoes",
    "Free Shipping Today",
    "Top Rated Sneakers",
  ],
  descriptions: [
    "Shop our collection of premium running shoes.",
    "Free returns within 30 days. Order now!",
  ],
  finalUrl: "https://example.com/shoes",
});

// Validate without creating
await a.createRSA({ ...params, validateOnly: true });
```

### Extensions

```typescript
import { extensions } from "google-ads-kit";

const ext = extensions(client);

// Sitelinks
await ext.addSitelinks("customers/123/campaigns/456", [
  {
    linkText: "Shop Now",
    description1: "Browse our catalog",
    description2: "Free shipping available",
    finalUrl: "https://example.com/shop",
  },
]);

// Callouts
await ext.addCallouts("customers/123/campaigns/456", [
  { text: "Free Shipping" },
  { text: "24/7 Support" },
]);

// Structured Snippets
await ext.addSnippets("customers/123/campaigns/456", [
  { header: "Brands", values: ["Nike", "Adidas", "Puma"] },
]);
```

### Reports

```typescript
import { reports } from "google-ads-kit";

const r = reports(client);

const { results } = await r.campaignPerformance({
  start: "2026-03-01",
  end: "2026-03-15",
});

await r.keywordPerformance({ start: "2026-03-01", end: "2026-03-15" });
await r.searchTerms({ start: "2026-03-01", end: "2026-03-15" });
await r.adPerformance({ start: "2026-03-01", end: "2026-03-15" });
```

### Conversions

```typescript
import { conversions, conversionActionResourceName } from "google-ads-kit";

const conv = conversions(client);

await conv.uploadClick({
  gclid: "abc123",
  conversionAction: conversionActionResourceName("1234567890", "987"),
  conversionDateTime: "2026-03-15 12:00:00+00:00",
  conversionValue: 49.99,
  currencyCode: "USD",
});
```

### Utilities

```typescript
import {
  toMicros,
  fromMicros,
  campaignResourceName,
  adGroupResourceName,
  formatDate,
  dateRange,
} from "google-ads-kit";

toMicros(5.50);        // 5_500_000
fromMicros(5_500_000); // 5.50

campaignResourceName("123-456-7890", "111");
// "customers/1234567890/campaigns/111"

dateRange(30);
// { start: "2026-02-13", end: "2026-03-15" }
```

## Features

- **REST-only** — uses Google Ads REST API v21. No gRPC, no protobuf, no native bindings.
- **Works everywhere** — Node.js 18+, Deno, Bun, Cloudflare Workers, Vercel Edge.
- **Zero heavy deps** — uses built-in `fetch`. No `google-gax`, no `grpc-js`.
- **TypeScript-first** — full type definitions, autocomplete-friendly API.
- **Token caching** — OAuth tokens are cached and refreshed automatically.
- **Battle-tested** — extracted from production code managing real Google Ads accounts.

## Requirements

- Node.js 18+ (or any runtime with global `fetch`)
- Google Ads API credentials ([setup guide](https://developers.google.com/google-ads/api/docs/get-started/introduction))

## License

MIT
