import { GoogleAdsClient } from "../client.js";
import { mutate, MutateOptions } from "../mutate.js";

export interface CreateKeywordsParams {
  adGroupResourceName: string;
  keywords: { text: string; matchType: "BROAD" | "PHRASE" | "EXACT" }[];
}

export interface AddNegativeKeywordsParams {
  campaignResourceName: string;
  keywords: string[];
  /** Defaults to PHRASE. */
  matchType?: "BROAD" | "PHRASE" | "EXACT";
}

export function keywords(client: GoogleAdsClient) {
  return {
    /**
     * Add keywords to an ad group.
     */
    async create(params: CreateKeywordsParams, options?: MutateOptions) {
      const ops = params.keywords.map((kw) => ({
        adGroupCriterionOperation: {
          create: {
            adGroup: params.adGroupResourceName,
            status: "ENABLED",
            keyword: {
              text: kw.text,
              matchType: kw.matchType,
            },
          },
        },
      }));

      return mutate(client, ops, options);
    },

    /**
     * Add negative keywords to a campaign.
     */
    async addNegative(
      params: AddNegativeKeywordsParams,
      options?: MutateOptions
    ) {
      const matchType = params.matchType ?? "PHRASE";
      const ops = params.keywords.map((text) => ({
        campaignCriterionOperation: {
          create: {
            campaign: params.campaignResourceName,
            negative: true,
            keyword: { text, matchType },
          },
        },
      }));

      return mutate(client, ops, options);
    },
  };
}
