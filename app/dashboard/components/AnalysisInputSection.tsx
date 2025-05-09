"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AnalysisInputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  validationError: string;
  isLoading: boolean;
  handleAnalyze: () => void;
  onInputChange: () => void; // To clear errors on input change
}

export default function AnalysisInputSection({
  url,
  setUrl,
  validationError,
  isLoading,
  handleAnalyze,
  onInputChange,
}: AnalysisInputSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">AIO Analysis Tool</CardTitle>
        <CardDescription>
          Enter a domain or URL to analyze its robots.txt for AI crawler
          optimization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-grow w-full sm:w-auto">
            <Input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                onInputChange(); // Clear errors
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="Enter domain or URL (e.g., example.com)"
              className={`${
                validationError
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              aria-label="Domain or URL input"
              aria-invalid={!!validationError}
              aria-describedby={
                validationError ? "url-error-message" : undefined
              }
              disabled={isLoading}
            />
            {validationError && (
              <p id="url-error-message" className="text-sm text-red-500 mt-1.5">
                {validationError}
              </p>
            )}
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
