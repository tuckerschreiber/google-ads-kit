import { GoogleAdsClient } from "./client.js";
import { query, QueryResult } from "./query.js";

export interface DateRange {
  start: string;
  end: string;
}

export function reports(client: GoogleAdsClient) {
  return {
    /**
     * Campaign performance report.
     */
    async campaignPerformance(dateRange: DateRange): Promise<QueryResult> {
      return query(
        client,
        `SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions_from_interactions_rate
        FROM campaign
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
          AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC`
      );
    },

    /**
     * Keyword performance report.
     */
    async keywordPerformance(
      dateRange: DateRange,
      options?: { campaignId?: string; limit?: number }
    ): Promise<QueryResult> {
      const campaignFilter = options?.campaignId
        ? `AND campaign.id = ${options.campaignId}`
        : "";
      const limit = options?.limit ?? 100;

      return query(
        client,
        `SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group.name,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.quality_score,
          metrics.search_impression_share
        FROM keyword_view
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
          AND campaign.status != 'REMOVED'
          AND ad_group_criterion.status != 'REMOVED'
          ${campaignFilter}
        ORDER BY metrics.cost_micros DESC
        LIMIT ${limit}`
      );
    },

    /**
     * Search terms report.
     */
    async searchTerms(
      dateRange: DateRange,
      options?: { limit?: number }
    ): Promise<QueryResult> {
      const limit = options?.limit ?? 200;

      return query(
        client,
        `SELECT
          search_term_view.search_term,
          search_term_view.status,
          campaign.name,
          ad_group.name,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr
        FROM search_term_view
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
          AND campaign.status != 'REMOVED'
        ORDER BY metrics.clicks DESC
        LIMIT ${limit}`
      );
    },

    /**
     * Ad performance report.
     */
    async adPerformance(
      dateRange: DateRange,
      options?: { limit?: number }
    ): Promise<QueryResult> {
      const limit = options?.limit ?? 50;

      return query(
        client,
        `SELECT
          ad_group_ad.ad.id,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          ad_group_ad.status,
          ad_group.name,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr
        FROM ad_group_ad
        WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
          AND campaign.status != 'REMOVED'
          AND ad_group_ad.status != 'REMOVED'
        ORDER BY metrics.impressions DESC
        LIMIT ${limit}`
      );
    },
  };
}
