"use client";
import { generateCurve, CardWithRetention } from "@/lib/srs";
import { useMemo } from "react";

interface ForgettingCurveProps {
  card: CardWithRetention;
  width?: number;
  height?: number;
}

export function ForgettingCurveMini({ card, width = 120, height = 40 }: ForgettingCurveProps) {
  const points = useMemo(() => generateCurve(card, 20), [card]);
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const toX = (i: number) => pad + (i / (points.length - 1)) * w;
  const toY = (ret: number) => pad + h - (ret / 100) * h;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.retention).toFixed(1)}`).join(" ");
  const fillD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${pad + h} L ${pad} ${pad + h} Z`;
  const ret = card.retention;
  const strokeColor = ret >= 80 ? "#7c6aff" : ret >= 60 ? "#34d399" : ret >= 35 ? "#fbbf24" : "#f87171";
  const fillColor = ret >= 80 ? "rgba(124,106,255,0.1)" : ret >= 60 ? "rgba(52,211,153,0.1)" : ret >= 35 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)";
  const reviewIdx = points.findIndex((p) => p.isReviewDay);
  const reviewPoint = reviewIdx > 0 ? points[reviewIdx] : null;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={fillD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      {reviewPoint && (
        <>
          <line x1={toX(reviewIdx)} y1={pad} x2={toX(reviewIdx)} y2={pad + h} stroke={strokeColor} strokeWidth={1} strokeDasharray="2,2" opacity={0.5} />
          <circle cx={toX(reviewIdx)} cy={toY(reviewPoint.retention)} r={3} fill={strokeColor} />
        </>
      )}
      <circle cx={toX(0)} cy={toY(Math.min(100, ret))} r={2.5} fill={strokeColor} />
    </svg>
  );
}
