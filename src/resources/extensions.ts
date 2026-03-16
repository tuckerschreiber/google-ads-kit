import { GoogleAdsClient } from "../client.js";
import { mutate, MutateOptions } from "../mutate.js";

export interface SitelinkInput {
  linkText: string;
  description1: string;
  description2: string;
  finalUrl: string;
}

export interface CalloutInput {
  text: string;
}

export interface StructuredSnippetInput {
  header: string;
  values: string[];
}

export function extensions(client: GoogleAdsClient) {
  return {
    /**
     * Add sitelink extensions to a campaign.
     */
    async addSitelinks(
      campaignResourceName: string,
      sitelinks: SitelinkInput[],
      options?: MutateOptions
    ) {
      const operations: Record<string, unknown>[] = [];

      for (let i = 0; i < sitelinks.length; i++) {
        const s = sitelinks[i];
        const tempId = -(i + 1);
        const tempResourceName = `customers/${client.customerId}/assets/${tempId}`;

        operations.push({
          assetOperation: {
            create: {
              resourceName: tempResourceName,
              type: "SITELINK",
              sitelinkAsset: {
                linkText: s.linkText,
                description1: s.description1,
                description2: s.description2,
              },
              finalUrls: [s.finalUrl],
            },
          },
        });

        operations.push({
          campaignAssetOperation: {
            create: {
              campaign: campaignResourceName,
              asset: tempResourceName,
              fieldType: "SITELINK",
            },
          },
        });
      }

      return mutate(client, operations, options);
    },

    /**
     * Add callout extensions to a campaign.
     */
    async addCallouts(
      campaignResourceName: string,
      callouts: CalloutInput[],
      options?: MutateOptions
    ) {
      const operations: Record<string, unknown>[] = [];

      for (let i = 0; i < callouts.length; i++) {
        const c = callouts[i];
        const tempId = -(i + 100);
        const tempResourceName = `customers/${client.customerId}/assets/${tempId}`;

        operations.push({
          assetOperation: {
            create: {
              resourceName: tempResourceName,
              type: "CALLOUT",
              calloutAsset: { calloutText: c.text },
            },
          },
        });

        operations.push({
          campaignAssetOperation: {
            create: {
              campaign: campaignResourceName,
              asset: tempResourceName,
              fieldType: "CALLOUT",
            },
          },
        });
      }

      return mutate(client, operations, options);
    },

    /**
     * Add structured snippet extensions to a campaign.
     */
    async addSnippets(
      campaignResourceName: string,
      snippets: StructuredSnippetInput[],
      options?: MutateOptions
    ) {
      const operations: Record<string, unknown>[] = [];

      for (let i = 0; i < snippets.length; i++) {
        const s = snippets[i];
        const tempId = -(i + 200);
        const tempResourceName = `customers/${client.customerId}/assets/${tempId}`;

        operations.push({
          assetOperation: {
            create: {
              resourceName: tempResourceName,
              type: "STRUCTURED_SNIPPET",
              structuredSnippetAsset: {
                header: s.header,
                values: s.values,
              },
            },
          },
        });

        operations.push({
          campaignAssetOperation: {
            create: {
              campaign: campaignResourceName,
              asset: tempResourceName,
              fieldType: "STRUCTURED_SNIPPET",
            },
          },
        });
      }

      return mutate(client, operations, options);
    },
  };
}
