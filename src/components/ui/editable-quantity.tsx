"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Mexp from 'math-expression-evaluator';

const mexp = new Mexp();

interface EditableQuantityProps {
  value: number;
  onChange: (newValue: number) => void;
  variant: "default" | "destructive" | "secondary";
}

export function EditableQuantity({ value, onChange, variant }: EditableQuantityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBadgeClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };

  const handleInputBlur = () => {
    try {
      const result = mexp.eval(textValue);
      onChange(result);
    } catch (error) {
      console.error("Invalid math expression", error);
      // Optionally revert or show an error
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextValue(String(value));
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={textValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        className="w-20 text-center h-8"
      />
    );
  }

  return (
    <Badge
      variant={variant}
      className="min-w-10 justify-center text-base cursor-pointer"
      onClick={handleBadgeClick}
    >
      {value}
    </Badge>
  );
}
