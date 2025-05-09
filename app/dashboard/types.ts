export interface RuleAnalysis {
  userAgent: string;
  isAllowedRoot: boolean | undefined;
  specificRules: string[];
}

export interface RobotsAnalysisResult {
  source: string;
  robotsContent: string;
  analysis: RuleAnalysis[];
  sitemap?: string | string[];
  detailedRecommendations: string[];
  optimizationScore: number;
}
