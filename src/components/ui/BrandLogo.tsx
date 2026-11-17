import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-9 sm:h-10 w-auto",
  md: "h-12 sm:h-14 w-auto",
  lg: "h-14 sm:h-16 w-auto",
};

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const src =
    size === "sm"
      ? "/logo/TVETHub_320px.svg"
      : "/logo/TVETHub_Master_Scalable.svg";

  return (
    <Image
      src={src}
      alt="TVETHub — Your Digital Learning Library"
      width={1082}
      height={514}
      unoptimized
      priority
      className={`block object-contain select-none ${SIZE_CLASSES[size]} ${className}`.trim()}
    />
  );
}
