"use client";

import { useEffect, useState } from "react";

export interface Request {
  _id: string;
  userId: string;
  message: string;
  summary?: string;
  category: string;
  urgency: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface RequestDetailModalProps {
  request: Request | null;
  onClose: () => void;
}

const URGENCY_STYLES: Record<string, { badge: string; dot: string }> = {
  low: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  high: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  open: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-700 border-gray-200",
  resolved: "bg-teal-50 text-teal-700 border-teal-200",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ExpandableText({ text, limit = 100 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  const displayed = expanded || !isLong ? text : text.slice(0, limit) + "…";

  return (
    <span>
      {displayed}
      {isLong && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="ml-1.5 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </span>
  );
}

export function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!request) return null;

  const urgencyStyle =
    URGENCY_STYLES[request.urgency?.toLowerCase()] ?? URGENCY_STYLES.medium;
  const statusClass =
    STATUS_STYLES[request.status?.toLowerCase()] ?? STATUS_STYLES.open;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug break-all">
            <ExpandableText text={request.summary || request.message} />
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status + Urgency badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {request.status && (
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusClass}`}
            >
              {request.status}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">•</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${urgencyStyle.badge}`}
            >
              {request.urgency} urgency
            </span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          {/* Full message if different from summary */}
          {request.message && request.message !== request.summary && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Full message</p>
              <p className="text-sm text-foreground/90 leading-relaxed break-all">
                <ExpandableText text={request.message} />
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={request.category} />
            <Field label="User ID" value={request.userId} />
            <Field
              label="Created"
              value={new Date(request.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <Field
              label="Last updated"
              value={new Date(request.updatedAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}