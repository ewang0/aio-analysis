"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RobotsAnalysisResult } from "../types";

interface RecommendationsCardProps {
  analysisResult: RobotsAnalysisResult;
}

export default function RecommendationsCard({
  analysisResult,
}: RecommendationsCardProps) {
  return (
    <Card className="shadow-md xl:w-1/2">
      <CardHeader>
        <CardTitle>Optimization Recommendations</CardTitle>
        <CardDescription>
          Based on the robots.txt analysis for AI crawlers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysisResult.detailedRecommendations &&
        analysisResult.detailedRecommendations.length > 0 ? (
          (() => {
            const getPriority = (rec: string) => {
              if (
                rec.toLowerCase().includes("disallowed") ||
                rec.toLowerCase().includes("prevent")
              ) {
                return 1; // Action Required
              } else if (
                rec.toLowerCase().includes("consider") ||
                rec.toLowerCase().includes("warning")
              ) {
                return 2; // Consideration
              } else if (
                rec.toLowerCase().includes("good") ||
                rec.toLowerCase().includes("excellent") ||
                rec.toLowerCase().includes("allowed")
              ) {
                return 3; // Good Practice
              }
              return 4; // Others
            };

            const sortedRecs = analysisResult.detailedRecommendations
              .slice()
              .sort((a, b) => getPriority(a) - getPriority(b));

            const goodPracticeRecs = sortedRecs.filter(
              (rec) => getPriority(rec) === 3
            );
            const otherRecs = sortedRecs.filter(
              (rec) => getPriority(rec) !== 3
            );

            return (
              <ul className="space-y-3">
                {otherRecs.map((rec, index) => {
                  let iconColorClass = "#3b82f6"; // blue-500
                  let IconComponent = InfoIcon;
                  let alertTitle = "Additional Notes";
                  let effectiveAlertVariant:
                    | "default"
                    | "destructive"
                    | undefined = undefined;

                  if (getPriority(rec) === 1) {
                    // Action Required
                    iconColorClass = "#f43f5e"; // rose-500
                    IconComponent = XCircle;
                    alertTitle = "Action Required";
                    effectiveAlertVariant = "destructive";
                  } else if (getPriority(rec) === 2) {
                    // Consideration
                    iconColorClass = "#f59e0b"; // amber-500
                    IconComponent = AlertTriangle;
                    alertTitle = "Consideration";
                  }
                  // Default for priority 4 or any other cases

                  return (
                    <li key={`other-${index}`}>
                      <Alert
                        variant={effectiveAlertVariant}
                        className="items-start p-4 border"
                      >
                        <IconComponent
                          className="mt-0.5 h-5 w-5"
                          style={{ color: iconColorClass }}
                        />
                        <div className="ml-3 flex-1">
                          <AlertTitle
                            className="font-semibold"
                            style={{ color: iconColorClass }}
                          >
                            {alertTitle}
                          </AlertTitle>
                          <AlertDescription className="mt-1 text-sm text-muted-foreground">
                            {rec}
                          </AlertDescription>
                        </div>
                      </Alert>
                    </li>
                  );
                })}

                {goodPracticeRecs.length > 0 && (
                  <li key="good-practices">
                    <Alert className="items-start p-4 border">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5"
                        style={{ color: "#14b8a6" }} // teal-500
                      />
                      <div className="ml-3 flex-1">
                        <AlertTitle
                          className="font-semibold"
                          style={{ color: "#14b8a6" }}
                        >
                          Good Practices
                        </AlertTitle>
                        <AlertDescription className="mt-1 text-sm text-muted-foreground">
                          <ScrollArea className="h-full w-full">
                            <ul className="list-disc pl-5 space-y-1 pr-4">
                              {goodPracticeRecs.map((rec, i) => (
                                <li key={`gp-${i}`}>{rec}</li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </AlertDescription>
                      </div>
                    </Alert>
                  </li>
                )}
              </ul>
            );
          })()
        ) : (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-muted-foreground">
              No specific recommendations at this time. Your robots.txt seems
              well-configured for the checked AI crawlers or no analysis was
              performed.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
