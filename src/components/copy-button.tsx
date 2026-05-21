"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Sao chép" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button type="button" onClick={handleCopy} className="btn btn-secondary min-h-9 px-3">
      {copied ? (
        <Check className="size-4 text-emerald-700" />
      ) : (
        <Copy className="size-4" />
      )}
      {copied ? "Đã sao chép" : label}
    </button>
  );
}
