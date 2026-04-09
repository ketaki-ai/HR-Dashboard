"use client";
// components/dashboard/UploadModal.tsx

import { useState, useRef } from "react";
import { X, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadModal({ onClose, onSuccess }: Props) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;

    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "text/plain"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, DOCX, DOC, or TXT files are supported.");
      setState("error");
      return;
    }

    setState("uploading");
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult(data);
      setState("success");
      setTimeout(onSuccess, 2000);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 z-10"
        style={{ background: "#111318", borderColor: "rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne text-lg font-bold">Upload CV</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* Drop Zone */}
        {state === "idle" && (
          <div
            className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragOver ? "#c8f135" : "rgba(255,255,255,0.12)",
              background: dragOver ? "rgba(200,241,53,0.04)" : "#181b23",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload
              size={36}
              className="mx-auto mb-3"
              style={{ color: dragOver ? "#c8f135" : "#6b7280" }}
            />
            <p className="text-sm font-medium mb-1">
              Drop CV here or{" "}
              <span style={{ color: "#c8f135" }}>click to browse</span>
            </p>
            <p className="text-xs text-[#6b7280]">PDF, DOCX, DOC, TXT supported</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        {/* Uploading */}
        {state === "uploading" && (
          <div className="text-center py-10">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin"
              style={{ borderColor: "#c8f135", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-medium">Parsing CV...</p>
            <p className="text-xs text-[#6b7280] mt-1">Extracting candidate data</p>
          </div>
        )}

        {/* Success */}
        {state === "success" && result && (
          <div className="text-center py-6">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: "#c8f135" }} />
            <p className="text-sm font-semibold mb-4">CV Parsed Successfully!</p>
            <div
              className="text-left rounded-xl p-4 border text-sm"
              style={{ background: "#181b23", borderColor: "rgba(200,241,53,0.2)" }}
            >
              {[
                ["Name", result.parsed?.name],
                ["Email", result.parsed?.email || "—"],
                ["Phone", result.parsed?.phone || "—"],
                ["Skills", result.parsed?.skills?.slice(0, 4).join(", ") || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 mb-1.5">
                  <span className="text-[#6b7280] w-14 shrink-0">{label}:</span>
                  <span className="font-medium truncate">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Dashboard refreshing...</p>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="text-center py-8">
            <AlertCircle size={40} className="mx-auto mb-3" style={{ color: "#ff4d6d" }} />
            <p className="text-sm font-semibold mb-2">Upload Failed</p>
            <p className="text-xs text-[#6b7280] mb-4">{error}</p>
            <button
              onClick={() => setState("idle")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "rgba(200,241,53,0.1)",
                border: "1px solid rgba(200,241,53,0.3)",
                color: "#c8f135",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
