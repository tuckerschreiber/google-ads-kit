// Core
export { GoogleAdsClient, GoogleAdsError } from "./client.js";
export type { GoogleAdsClientConfig, TokenCache } from "./client.js";

// Operations
export { mutate } from "./mutate.js";
export type { MutateOptions, MutateResult } from "./mutate.js";
export { query, queryAll } from "./query.js";
export type { QueryOptions, QueryResult } from "./query.js";

// Resources
export { campaigns } from "./resources/campaigns.js";
export type {
  CreateCampaignParams,
  UpdateCampaignParams,
  SetLocationsParams,
} from "./resources/campaigns.js";

export { adGroups } from "./resources/ad-groups.js";
export type { CreateAdGroupParams } from "./resources/ad-groups.js";

export { keywords } from "./resources/keywords.js";
export type {
  CreateKeywordsParams,
  AddNegativeKeywordsParams,
} from "./resources/keywords.js";

export { ads } from "./resources/ads.js";
export type { CreateRSAParams } from "./resources/ads.js";

export { extensions } from "./resources/extensions.js";
export type {
  SitelinkInput,
  CalloutInput,
  StructuredSnippetInput,
} from "./resources/extensions.js";

export { conversions } from "./resources/conversions.js";
export type { UploadClickConversionParams } from "./resources/conversions.js";

// Reports
export { reports } from "./reports.js";
export type { DateRange } from "./reports.js";

// Utils
export {
  campaignResourceName,
  adGroupResourceName,
  adGroupAdResourceName,
  geoTargetConstant,
  conversionActionResourceName,
  toMicros,
  fromMicros,
  formatDate,
  dateRange,
} from "./utils.js";
