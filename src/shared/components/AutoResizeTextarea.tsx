"use client";

import { useRef, useEffect } from "react";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function AutoResizeTextarea({
  value,
  onChange,
  className = "",
  ...props
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      className={`min-h-[2.5rem] resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
}
