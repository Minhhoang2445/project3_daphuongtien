"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#dde1e7] bg-white px-3 text-sm font-medium text-[#4c5666] hover:bg-[#f6f7f9]"
    >
      {copied ? <Check className="size-4 text-[#16803c]" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
