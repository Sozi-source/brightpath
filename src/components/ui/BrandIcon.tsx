import Image from "next/image";

export type BrandIconName =
  | "dashboard" | "projects" | "library" | "marketplace"
  | "students" | "supervisor" | "reports" | "settings"
  | "calendar" | "document" | "support" | "analytics";

const sizeMap = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40, "2xl": 56 } as const;

interface BrandIconProps {
  name: BrandIconName;
  size?: keyof typeof sizeMap | number;
  alt?: string;
  className?: string;
}

export function BrandIcon({ name, size = "md", alt, className = "" }: BrandIconProps) {
  const dimension = typeof size === "number" ? size : sizeMap[size];
  return (
    <Image
      src={`/brand/icons/${name}.svg`}
      width={dimension}
      height={dimension}
      alt={alt ?? `${name} icon`}
      className={`shrink-0 ${className}`}
      aria-hidden={alt ? undefined : true}
    />
  );
}
