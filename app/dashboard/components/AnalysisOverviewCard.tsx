"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import CircularProgressScore from "@/components/ui/circular-progress-score";
import { Separator } from "@/components/ui/separator";
import { RobotsAnalysisResult, RuleAnalysis } from "../types";

interface AnalysisOverviewCardProps {
  analysisResult: RobotsAnalysisResult;
}

export default function AnalysisOverviewCard({
  analysisResult,
}: AnalysisOverviewCardProps) {
  return (
    <Card className="shadow-md xl:w-1/2">
      <CardHeader>
        <CardTitle>Analysis Overview</CardTitle>
        <CardDescription>
          Summary of your robots.txt configuration for AI crawlers, including
          access permissions, optimization score, and recommendations for
          improving crawler management.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">AEO Score</h3>
            <div className="relative group">
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-md text-sm w-64 z-50">
                This score represents how well your robots.txt is optimized for
                AI crawlers. Higher scores indicate better configuration for
                controlling AI bot access.
              </div>
            </div>
          </div>
          <div className="pt-4">
            <CircularProgressScore score={analysisResult.optimizationScore} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Crawler Access Details
          </h3>
          <div className="rounded-md border max-h-84 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User-Agent</TableHead>
                  <TableHead>Root Access (/)?</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Specific Rules
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.analysis.map((rule: RuleAnalysis) => (
                  <TableRow key={rule.userAgent}>
                    <TableCell className="font-medium align-top">
                      {rule.userAgent}
                    </TableCell>
                    <TableCell
                      className={`${
                        rule.isAllowedRoot === false
                          ? "text-red-600 dark:text-red-400"
                          : rule.isAllowedRoot === true
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      } align-top`}
                    >
                      {rule.isAllowedRoot === undefined
                        ? "Implicitly Allowed"
                        : rule.isAllowedRoot
                        ? "Allowed"
                        : "Disallowed"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell align-top">
                      {rule.specificRules.length > 0 ? (
                        <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all font-mono">
                          {rule.specificRules.join("\n")}
                        </pre>
                      ) : (
                        <em className="text-muted-foreground">
                          No specific rules.
                        </em>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {analysisResult.sitemap && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sitemap(s) Found
              </h3>
              <div className="p-3 bg-muted rounded-md text-sm">
                {Array.isArray(analysisResult.sitemap) ? (
                  analysisResult.sitemap.map((s: string, i: number) => (
                    <a
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={i}
                      className="block text-primary hover:underline break-words"
                    >
                      {s}
                    </a>
                  ))
                ) : (
                  <a
                    href={analysisResult.sitemap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    {analysisResult.sitemap}
                  </a>
                )}
              </div>
            </div>
          </>
        )}
        <Separator />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Raw robots.txt Content
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Fetched from:{" "}
            <a
              href={analysisResult.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {analysisResult.source}
            </a>
          </p>
          {analysisResult.robotsContent ? (
            <pre className="whitespace-pre-wrap break-all bg-muted p-3 rounded-md text-sm font-mono max-h-96 overflow-auto">
              {analysisResult.robotsContent}
            </pre>
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-muted-foreground">
                robots.txt is empty or was not found (default allow assumed).
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
