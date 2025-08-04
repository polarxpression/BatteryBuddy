import type { SVGProps } from "react";
import type { Battery } from "@/lib/types";

export function BatteryIcon({ type, ...props }: SVGProps<SVGSVGElement> & { type: Battery["type"] }) {
  switch (type) {
    case "AA":
    case "AAA":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 3V2C10 1.44772 10.4477 1 11 1H13C13.5523 1 14 1.44772 14 2V3H10Z" fill="currentColor"/>
        </svg>
      );
    case "C":
    case "D":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 6V5C9 4.44772 9.44771 4 10 4H14C14.5523 4 15 4.44772 15 5V6H9Z" fill="currentColor"/>
        </svg>
      );
    case "9V":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="8" y="2" width="3" height="2" rx="1" fill="currentColor"/>
          <rect x="13" y="2" width="3" height="2" rx="1" fill="currentColor"/>
        </svg>
      );
    case "A23":
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
              <rect x="8.5" y="4" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 4V3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V4H10Z" fill="currentColor"/>
            </svg>
        );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="16" height="10" x="2" y="7" rx="2" ry="2"/>
            <line x1="20" x2="20" y1="11" y2="13"/>
        </svg>
      )
  }
}
