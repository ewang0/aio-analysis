"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import DashboardSkeleton from "@/components/ui/dashboard-skeleton";
import { XCircle, InfoIcon } from "lucide-react";
import { RobotsAnalysisResult } from "../types";
import AnalysisOverviewCard from "./AnalysisOverviewCard";
import OptimizationRecommendationsCard from "./OptimizationRecommendationsCard";

interface AnalysisResultsSectionProps {
  isLoading: boolean;
  apiError: string;
  analysisResult: RobotsAnalysisResult | null;
}

export default function AnalysisResultsSection({
  isLoading,
  apiError,
  analysisResult,
}: AnalysisResultsSectionProps) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (apiError) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{apiError}</AlertDescription>
      </Alert>
    );
  }

  if (analysisResult) {
    return (
      <div className="space-y-4 xl:flex xl:flex-row xl:space-y-0 xl:space-x-4">
        <AnalysisOverviewCard analysisResult={analysisResult} />
        <OptimizationRecommendationsCard analysisResult={analysisResult} />
      </div>
    );
  }

  return (
    <Card className="flex-1 border-dotted border-2 border-border flex flex-col">
      <CardContent className="pt-6 flex-1 flex items-center justify-center flex-col">
        <div className="bg-neutral-800 p-3 rounded-full mb-4 flex items-center justify-center">
          <InfoIcon className="h-10 w-10 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          No Results Yet
        </h2>
        <p className="text-center text-muted-foreground">
          Enter a URL above and click Analyze to see the results.
        </p>
      </CardContent>
    </Card>
  );
}
