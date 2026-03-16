import { GoogleAdsClient } from "../client.js";
import { mutate, MutateOptions } from "../mutate.js";

export interface CreateCampaignParams {
  name: string;
  /** Daily budget in micros. Use `toMicros()` to convert from dollars. */
  dailyBudgetMicros: number;
  /** Defaults to SEARCH. */
  channelType?: string;
  /** Defaults to PAUSED. */
  status?: string;
  /** Manual CPC by default. Set to use a different strategy. */
  biddingStrategy?: Record<string, unknown>;
  /** Network targeting settings. */
  networkSettings?: {
    targetGoogleSearch?: boolean;
    targetSearchNetwork?: boolean;
    targetContentNetwork?: boolean;
  };
}

export interface UpdateCampaignParams {
  status?: "ENABLED" | "PAUSED" | "REMOVED";
  name?: string;
}

export interface SetLocationsParams {
  campaignResourceName: string;
  locationIds: number[];
  /** Defaults to PRESENCE. */
  geoTargetType?: "PRESENCE" | "PRESENCE_OR_INTEREST";
}

export function campaigns(client: GoogleAdsClient) {
  return {
    /**
     * Create a campaign with a budget.
     * Returns the campaign resource name.
     */
    async create(
      params: CreateCampaignParams,
      options?: MutateOptions
    ): Promise<string> {
      const tempBudgetId = -1;
      const tempBudgetResource = `customers/${client.customerId}/campaignBudgets/${tempBudgetId}`;

      const result = await mutate(
        client,
        [
          {
            campaignBudgetOperation: {
              create: {
                resourceName: tempBudgetResource,
                name: `Budget for ${params.name} ${Date.now()}`,
                amountMicros: String(params.dailyBudgetMicros),
              },
            },
          },
          {
            campaignOperation: {
              create: {
                name: params.name,
                advertisingChannelType: params.channelType ?? "SEARCH",
                status: params.status ?? "PAUSED",
                campaignBudget: tempBudgetResource,
                networkSettings: params.networkSettings ?? {
                  targetGoogleSearch: true,
                  targetSearchNetwork: false,
                  targetContentNetwork: false,
                },
                ...(params.biddingStrategy ?? { manualCpc: {} }),
                geoTargetTypeSetting: {
                  positiveGeoTargetType: "PRESENCE",
                },
              },
            },
          },
        ],
        options
      );

      return (
        result.mutateOperationResponses?.[1] as any
      )?.campaignResult?.resourceName;
    },

    /**
     * Update a campaign's status or name.
     */
    async update(
      campaignResourceName: string,
      params: UpdateCampaignParams,
      options?: MutateOptions
    ) {
      const updateFields: Record<string, unknown> = {
        resourceName: campaignResourceName,
      };
      const masks: string[] = [];

      if (params.status) {
        updateFields.status = params.status;
        masks.push("status");
      }
      if (params.name) {
        updateFields.name = params.name;
        masks.push("name");
      }

      return mutate(
        client,
        [
          {
            campaignOperation: {
              update: updateFields,
              updateMask: masks.join(","),
            },
          },
        ],
        options
      );
    },

    /**
     * Set geo-targeting locations for a campaign.
     */
    async setLocations(params: SetLocationsParams, options?: MutateOptions) {
      const ops: Record<string, unknown>[] = [
        {
          campaignOperation: {
            update: {
              resourceName: params.campaignResourceName,
              geoTargetTypeSetting: {
                positiveGeoTargetType:
                  params.geoTargetType ?? "PRESENCE",
              },
            },
            updateMask: "geoTargetTypeSetting.positiveGeoTargetType",
          },
        },
        ...params.locationIds.map((locationId) => ({
          campaignCriterionOperation: {
            create: {
              campaign: params.campaignResourceName,
              location: {
                geoTargetConstant: `geoTargetConstants/${locationId}`,
              },
            },
          },
        })),
      ];

      return mutate(client, ops, options);
    },

    /**
     * Update a campaign budget.
     */
    async updateBudget(
      budgetResourceName: string,
      amountMicros: number,
      options?: MutateOptions
    ) {
      return mutate(
        client,
        [
          {
            campaignBudgetOperation: {
              update: {
                resourceName: budgetResourceName,
                amountMicros: String(amountMicros),
              },
              updateMask: "amountMicros",
            },
          },
        ],
        options
      );
    },
  };
}
