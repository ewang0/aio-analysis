"use client";

// A base component for individual pulsing blocks
export const PulsingBlock = ({ className }: { className?: string }) => (
  <div
    className={`
      bg-gray-200 dark:bg-neutral-800
      animate-pulse
      rounded-md
      ${className}
    `}
  />
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-4 xl:flex xl:flex-row xl:space-y-0 xl:space-x-4">
      {/* Left Card Skeleton (Analysis Overview) */}
      <div className="shadow-md xl:w-1/2 p-6 bg-card rounded-lg border border-border">
        {/* Header */}
        <PulsingBlock className="h-4 w-3/4 mb-2" />
        <PulsingBlock className="h-16 w-full mb-6" />
        {/* Score Section */}
        <PulsingBlock className="h-6 w-1/2 mb-4" />
        <div className="flex justify-start items-center mb-6 space-x-4">
          <PulsingBlock className="h-61 rounded-full w-full" />
        </div>
        <div className="h-px w-full bg-muted my-6" />{" "}
        {/* Separator, use muted for less emphasis during loading */}
        {/* Crawler Access Details */}
        <PulsingBlock className="h-6 w-3/5 mb-3" />
        <div className="rounded-md border border-border p-1 mb-6">
          <PulsingBlock className="h-10 w-full mb-1" />
          <PulsingBlock className="h-10 w-full mb-1" />
          <PulsingBlock className="h-10 w-full mb-1" />
          <PulsingBlock className="h-10 w-full mb-1" />
          <PulsingBlock className="h-10 w-full" />
        </div>
        <div className="h-px w-full bg-muted my-6" /> {/* Separator */}
        {/* Raw robots.txt */}
        <PulsingBlock className="h-5 w-2/5 mb-2" />
        <PulsingBlock className="h-4 w-3/4 mb-1" /> {/* Source link line */}
        <PulsingBlock className="h-64 w-full" />
      </div>

      {/* Right Card Skeleton (Optimization Recommendations) */}
      <div className="shadow-md xl:w-1/2 p-6 bg-card rounded-lg border border-border">
        {/* Header */}
        <PulsingBlock className="h-4 w-3/4 mb-2" />
        <PulsingBlock className="h-4 w-full mb-6" />

        {/* Recommendations List */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border border-border rounded-md mb-3">
            <div className="flex items-start space-x-3">
              <PulsingBlock className="h-5 w-5 rounded-sm mt-0.5" />{" "}
              {/* Icon */}
              <div className="flex-1 space-y-1.5">
                <PulsingBlock className="h-3 w-1/3" /> {/* Title */}
                <PulsingBlock className="h-3 w-full" />
                <PulsingBlock className="h-3 w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
