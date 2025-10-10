// src/components/battery-image-or-icon.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BatteryIcon } from "./icons/battery-icon";

interface BatteryImageOrIconProps {
  imageUrl?: string;
  alt: string;
  batteryType: string; // Needed for BatteryIcon
  width: number;
  height: number;
  className?: string;
  useProxy?: boolean;
}

export function BatteryImageOrIcon({ imageUrl, alt, batteryType, width, height, className, useProxy = false }: BatteryImageOrIconProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state if imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const src = useProxy && imageUrl ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}` : imageUrl;

  if (imageUrl && !imageError) {
    return (
      <Image
        src={src || ''}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }

  return <BatteryIcon className={className} type={batteryType} />;
}