"use client";
// components/dashboard/Header.tsx

import Image from "next/image";
import { Upload, RefreshCw } from "lucide-react";

interface Props {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-8 border-b"
      style={{
        background: "#111318",
        borderColor: "rgba(255,255,255,0.07)",
        height: 68,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/pmm-logo.png"
          alt="Pixel Mint Media"
          className="h-11 w-auto object-contain"
        />
        <div>
          <div
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "#6b7280", letterSpacing: "0.5px" }}
          >
            Talent Acquisition Intelligence
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "#6b7280" }}>
          {today}
        </span>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: "rgba(200,241,53,0.12)",
            border: "1px solid rgba(200,241,53,0.3)",
            color: "#c8f135",
          }}
        >
          <Upload size={14} />
          Upload CV
        </button>
      </div>
    </header>
  );
}
