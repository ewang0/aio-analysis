"use client";

import { useState } from "react";
import { RobotsAnalysisResult } from "../types";

export function useRobotsAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<RobotsAnalysisResult | null>(null);
  const [apiError, setApiError] = useState("");

  const performAnalysis = async (url: string) => {
    setApiError("");
    setAnalysisResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(
          data.error ||
            `Failed to analyze. Server responded with ${response.status}`
        );
      } else {
        setAnalysisResult(data as RobotsAnalysisResult);
      }
    } catch (err) {
      const error = err as Error;
      setApiError(
        error.message ||
          "An unexpected error occurred while trying to analyze the URL."
      );
      console.error(err);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    analysisResult,
    apiError,
    performAnalysis,
    setApiError,
    setAnalysisResult,
  };
}
