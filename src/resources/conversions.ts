import { GoogleAdsClient } from "../client.js";

export interface UploadClickConversionParams {
  gclid: string;
  conversionAction: string;
  /** Format: "2026-03-15 12:00:00+00:00" */
  conversionDateTime: string;
  conversionValue?: number;
  currencyCode?: string;
}

export function conversions(client: GoogleAdsClient) {
  return {
    /**
     * Upload an offline click conversion.
     */
    async uploadClick(params: UploadClickConversionParams) {
      const data = await client.request<{
        results?: unknown[];
        partialFailureError?: unknown;
      }>(":uploadClickConversions", {
        body: {
          conversions: [
            {
              gclid: params.gclid,
              conversionAction: params.conversionAction,
              conversionDateTime: params.conversionDateTime,
              conversionValue: params.conversionValue ?? 1.0,
              currencyCode: params.currencyCode ?? "USD",
            },
          ],
          partialFailure: true,
        },
      });

      if (data.partialFailureError) {
        throw new Error(
          `Conversion upload partial failure: ${JSON.stringify(data.partialFailureError)}`
        );
      }

      return data;
    },
  };
}
