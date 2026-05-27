import React from "react";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
} from "@tabler/icons-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  badgeText: string;
  badgeType?: "up" | "down" | "neutral";
  subtext: string;
  icon: React.ReactNode;
}

export const KpiCard = ({
  title,
  value,
  badgeText,
  badgeType = "neutral",
  subtext,
  icon,
}: KpiCardProps) => {
  const getBadgeStyles = () => {
    switch (badgeType) {
      case "up":
        return {
          bg: "bg-secondary-container",
          textClass: "text-on-secondary-container",
          icon: <IconArrowUpRight size={14} />,
        };
      case "down":
        return {
          bg: "bg-error-container",
          textClass: "text-error",
          icon: <IconArrowDownRight size={14} />,
        };
      default:
        return {
          bg: "bg-surface-container-high",
          textClass: "text-on-surface-variant",
          icon: <IconMinus size={14} />,
        };
    }
  };

  const badge = getBadgeStyles();

  return (
    <div className="bg-white p-6 rounded-xl border border-border-hairline shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-3xl font-bold text-on-surface">{value}</h3>
        <span
          className={`text-[12px] font-bold flex items-center gap-0.5 px-1.5 py-[2px] rounded ${badge.bg} ${badge.textClass}`}
        >
          {badge.icon}
          {badgeText}
        </span>
      </div>
      <p className="text-sm text-outline mt-1">{subtext}</p>
    </div>
  );
};
