"use client";

import { useState } from "react";
import { useRobotsAnalysis } from "../hooks/useRobotsAnalysis";
import AnalysisInputSection from "./AnalysisInputSection";
import AnalysisResultsSection from "./AnalysisResultsSection";

export default function RobotsAnalysisClient() {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  const {
    isLoading,
    analysisResult,
    apiError,
    performAnalysis,
    setApiError,
    setAnalysisResult,
  } = useRobotsAnalysis();

  const handleAnalyzeClick = async () => {
    setValidationError("");
    setApiError("");
    setAnalysisResult(null);

    if (!url.trim()) {
      setValidationError("URL cannot be empty.");
      return;
    }
    try {
      const prefixedUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `http://${url}`;
      new URL(prefixedUrl);
    } catch {
      setValidationError(
        "Please enter a valid URL (e.g., http://example.com or example.com)."
      );
      return;
    }
    performAnalysis(url); // Pass original URL to the hook
  };

  const handleInputChange = () => {
    if (validationError) setValidationError("");
    if (apiError) setApiError("");
  };

  return (
    <div className="w-full h-full space-y-4 flex flex-col">
      <AnalysisInputSection
        url={url}
        setUrl={setUrl}
        validationError={validationError}
        isLoading={isLoading}
        handleAnalyze={handleAnalyzeClick}
        onInputChange={handleInputChange}
      />
      <AnalysisResultsSection
        isLoading={isLoading}
        apiError={apiError}
        analysisResult={analysisResult}
      />
    </div>
  );
}
