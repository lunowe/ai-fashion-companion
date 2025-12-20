// lib/icons.tsx
import type { ComponentType, SVGProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

import TshirtIcon from "@/assets/icons/Tee_4_front.svg?react";
import JeansIcon from "@/assets/icons/Jeans 1_front.svg?react";
import DressShirtIcon from "@/assets/icons/DressShirt_front.svg?react";
// import ButtonUpIcon from "@/assets/icons/Button_Up_Shirt_front.svg?react";
// import LongsleeveIcon from "@/assets/icons/Long_Sleeve_Shirt_front.svg?react";
import PoloShirtIcon from "@/assets/icons/Polo_front.svg?react";
import HenlyIcon from "@/assets/icons/Henley_front.svg?react";
import CardiganIcon from "@/assets/icons/Cardigan_2_front.svg?react";
import TrousersIcon from "@/assets/icons/Sweats_46_front.svg?react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent | string> = {
  tshirt: TshirtIcon,
  polo: PoloShirtIcon,
  henley: HenlyIcon,
  jeans: JeansIcon,
  shirt: "👔",
  pants: "👖",
  jacket: "🧥",
  sneaker: "👟",
  sweater: "🧶",
  watch: "⌚",
  "dress-shirt": DressShirtIcon,
  cardigan: CardiganIcon,
  trousers: TrousersIcon,
};

const ASPECT_CLASSES: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  tall: "aspect-[1/2]",
};

const SIZE_CLASSES = {
  sm: "w-12",
  md: "w-16",
  lg: "w-24",
  xl: "w-32",
  "2xl": "w-64",
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
  aspectRatio?: string | null;
  color?: string | null;
  strokeColor?: string | null;
  strokeWidth?: number | string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  style?: CSSProperties;
}

export function ClothingIcon({
  iconId,
  aspectRatio = "square",
  color,
  strokeColor,
  strokeWidth,
  size = "md",
  className,
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

  const containerClasses = cn(
    "flex items-center justify-center",
    SIZE_CLASSES[size],
    ASPECT_CLASSES[aspectRatio ?? "square"],
    className
  );

  if (typeof Icon === "string") {
    return (
      <div className={containerClasses}>
        <span className="text-2xl">{Icon}</span>
      </div>
    );
  }

  if (Icon) {
    return (
      <div className={containerClasses}>
        <Icon
          className="w-full h-full"
          style={mergedStyle}
          preserveAspectRatio="xMidYMid meet"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <FallbackIcon className="w-full h-full" style={mergedStyle} {...props} />
    </div>
  );
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
