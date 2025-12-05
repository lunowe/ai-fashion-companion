// lib/icons.tsx
import type { ComponentType, SVGProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

import TshirtIcon from "@/assets/icons/Tee_4_front.svg?react";
import JeansIcon from "@/assets/icons/Jeans 1_front.svg?react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent | string> = {
  tshirt: TshirtIcon,
  jeans: JeansIcon,
  shirt: "👔",
  pants: "👖",
  jacket: "🧥",
  sneaker: "👟",
  sweater: "🧶",
  watch: "⌚",
  "dress-shirt": "👔",
};

const FallbackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
    <path d="M12 8v8M8 12h8" strokeWidth="2" />
  </svg>
);

interface ClothingIconProps
  extends Omit<SVGProps<SVGSVGElement>, "color" | "strokeWidth"> {
  iconId: string | null | undefined;
  color?: string | null;
  strokeColor?: string | null;
  strokeWidth?: number | string | null;
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
}

export function ClothingIcon({
  iconId,
  color,
  strokeColor,
  strokeWidth,
  className = "w-full h-full",
  containerClassName = "w-16 h-16",
  style,
  ...props
}: ClothingIconProps) {
  const Icon = iconId ? ICON_MAP[iconId] : null;

  const mergedStyle = {
    ...style,
    "--icon-fill": color ?? undefined,
    "--icon-stroke": strokeColor ?? undefined,
    "--icon-stroke-width":
      strokeWidth != null
        ? typeof strokeWidth === "number"
          ? `${strokeWidth}px`
          : strokeWidth
        : undefined,
  } as CSSProperties;

  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      {typeof Icon === "string" ? (
        <span className={className}>{Icon}</span>
      ) : Icon ? (
        <Icon
          className={cn("max-w-full max-h-full", className)}
          style={mergedStyle}
          preserveAspectRatio="xMidYMid meet"
          {...props}
        />
      ) : (
        <FallbackIcon className={className} style={mergedStyle} {...props} />
      )}
    </div>
  );
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
