import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Battery } from "./types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAggregatedBatteryQuantities(batteries: Battery[]): Map<string, number> {
  const aggregatedQuantities = new Map<string, number>();

  batteries.forEach(battery => {
    const key = `${battery.brand}-${battery.model}-${battery.type}-${battery.packSize}`;
    const currentQuantity = aggregatedQuantities.get(key) || 0;
    aggregatedQuantities.set(key, currentQuantity + battery.quantity);
  });

  return aggregatedQuantities;
}

export function getAggregatedQuantitiesByLocation(batteries: Battery[]): Map<string, Map<string, number>> {
  const aggregatedQuantities = new Map<string, Map<string, number>>();

  batteries.forEach(battery => {
    const key = `${battery.brand}-${battery.model}-${battery.type}-${battery.packSize}`;
    const location = battery.location || "unknown"; // Default to 'unknown' if location is not set

    if (!aggregatedQuantities.has(key)) {
      aggregatedQuantities.set(key, new Map<string, number>());
    }

    const locationMap = aggregatedQuantities.get(key)!;
    const currentQuantity = locationMap.get(location) || 0;
    locationMap.set(location, currentQuantity + battery.quantity);
  });

  return aggregatedQuantities;
}