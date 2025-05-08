"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface CircularProgressScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressScore: React.FC<CircularProgressScoreProps> = ({
  score,
  size = 180, // Increased default size for better visibility
  strokeWidth = 12, // Adjusted stroke width
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the score value itself for the text
  const animatedScore = useSpring(0, { damping: 50, stiffness: 400 });
  const roundedScore = useTransform(animatedScore, (latest) =>
    Math.round(latest)
  );

  useEffect(() => {
    animatedScore.set(score);
  }, [animatedScore, score]);

  // For the circle progress
  const progress = score / 100;
  const offset = circumference * (1 - progress);

  const getStrokeAndTextColor = (s: number) => {
    if (s >= 80) return "stroke-teal-500 text-teal-500";
    if (s >= 50) return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };

  const getScoreDependentBgColor = (s: number) => {
    if (s >= 80) return "bg-teal-50 dark:bg-teal-900/40";
    if (s >= 50) return "bg-amber-50 dark:bg-amber-900/40";
    return "bg-rose-50 dark:bg-rose-900/40";
  };

  const strokeAndTextColorClasses = getStrokeAndTextColor(score);
  const scoreBgColorClass = getScoreDependentBgColor(score);

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 rounded-lg w-full ${scoreBgColorClass}`}
      style={{ minHeight: size + 32 }} // p-4 adds 16px padding top and bottom, so 32px total vertical padding
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted/30" // Use a more subtle background color
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className={strokeAndTextColorClasses.split(" ")[0]} // Only stroke color class
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className={`text-5xl font-bold ${
            strokeAndTextColorClasses.split(" ")[1]
          }`} // Only text color class
        >
          {roundedScore}
        </motion.span>
        <span className={`text-lg ${strokeAndTextColorClasses.split(" ")[1]}`}>
          / 100
        </span>
      </div>
    </div>
  );
};

export default CircularProgressScore;
