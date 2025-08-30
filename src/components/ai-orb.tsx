"use client";

import { Button } from "./ui/button";
import { Zap } from "lucide-react";

interface AiOrbProps {
  onClick: () => void;
}

export function AiOrb({ onClick }: AiOrbProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
    >
      <Zap className="h-8 w-8" />
    </Button>
  );
}
