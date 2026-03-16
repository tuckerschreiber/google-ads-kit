import { GoogleAdsClient } from "../client.js";
import { mutate, MutateOptions } from "../mutate.js";

export interface CreateRSAParams {
  adGroupResourceName: string;
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  /** If true, validates the ad without creating it. */
  validateOnly?: boolean;
}

export function ads(client: GoogleAdsClient) {
  return {
    /**
     * Create a Responsive Search Ad. Returns the ad resource name.
     */
    async createRSA(params: CreateRSAParams): Promise<string> {
      const result = await mutate(
        client,
        [
          {
            adGroupAdOperation: {
              create: {
                adGroup: params.adGroupResourceName,
                status: "ENABLED",
                ad: {
                  responsiveSearchAd: {
                    headlines: params.headlines.map((text) => ({ text })),
                    descriptions: params.descriptions.map((text) => ({
                      text,
                    })),
                  },
                  finalUrls: [params.finalUrl],
                },
              },
            },
          },
        ],
        { validateOnly: params.validateOnly }
      );

      return (
        result.mutateOperationResponses?.[0] as any
      )?.adGroupAdResult?.resourceName;
    },

    /**
     * Update an ad's status.
     */
    async updateStatus(
      adGroupAdResourceName: string,
      status: "ENABLED" | "PAUSED" | "REMOVED",
      options?: MutateOptions
    ) {
      return mutate(
        client,
        [
          {
            adGroupAdOperation: {
              update: {
                resourceName: adGroupAdResourceName,
                status,
              },
              updateMask: "status",
            },
          },
        ],
        options
      );
    },
  };
}
