import { GoogleAdsClient } from "../client.js";
import { mutate, MutateOptions } from "../mutate.js";

export interface CreateAdGroupParams {
  campaignResourceName: string;
  name: string;
  /** Optional CPC bid in micros. */
  cpcBidMicros?: number;
  /** Defaults to ENABLED. */
  status?: string;
  /** Defaults to SEARCH_STANDARD. */
  type?: string;
}

export function adGroups(client: GoogleAdsClient) {
  return {
    /**
     * Create an ad group. Returns the ad group resource name.
     */
    async create(
      params: CreateAdGroupParams,
      options?: MutateOptions
    ): Promise<string> {
      const result = await mutate(
        client,
        [
          {
            adGroupOperation: {
              create: {
                name: params.name,
                campaign: params.campaignResourceName,
                status: params.status ?? "ENABLED",
                type: params.type ?? "SEARCH_STANDARD",
                ...(params.cpcBidMicros
                  ? { cpcBidMicros: String(params.cpcBidMicros) }
                  : {}),
              },
            },
          },
        ],
        options
      );

      return (
        result.mutateOperationResponses?.[0] as any
      )?.adGroupResult?.resourceName;
    },

    /**
     * Update an ad group's status or bid.
     */
    async update(
      adGroupResourceName: string,
      params: { status?: string; cpcBidMicros?: number; name?: string },
      options?: MutateOptions
    ) {
      const updateFields: Record<string, unknown> = {
        resourceName: adGroupResourceName,
      };
      const masks: string[] = [];

      if (params.status) {
        updateFields.status = params.status;
        masks.push("status");
      }
      if (params.cpcBidMicros !== undefined) {
        updateFields.cpcBidMicros = String(params.cpcBidMicros);
        masks.push("cpcBidMicros");
      }
      if (params.name) {
        updateFields.name = params.name;
        masks.push("name");
      }

      return mutate(
        client,
        [
          {
            adGroupOperation: {
              update: updateFields,
              updateMask: masks.join(","),
            },
          },
        ],
        options
      );
    },
  };
}
