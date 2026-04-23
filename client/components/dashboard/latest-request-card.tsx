"use client";

import { useState } from "react";

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

interface LatestRequestCardProps {
  request: Request | null;
  loading: boolean;
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

export function LatestRequestCard({ request, loading }: LatestRequestCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Latest Request</h2>
        <LatestRequestSkeleton />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Latest Request</h2>
        <p className="text-muted-foreground text-sm">No recent request</p>
      </div>
    );
  }

  const urgencyStyle =
    URGENCY_STYLES[request.urgency?.toLowerCase()] ?? URGENCY_STYLES.medium;
  const statusClass =
    STATUS_STYLES[request.status?.toLowerCase()] ?? STATUS_STYLES.open;

  return (
    <div className="rounded-2xl border p-4 space-y-3 self-start">
      <h2 className="text-lg font-semibold">Latest Request</h2>

      <div className="p-4 rounded-xl border space-y-4">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold leading-snug break-all">
            <ExpandableText text={request.summary || request.message} />
          </p>
          {request.status && (
            <span
              className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusClass}`}
            >
              {request.status}
            </span>
          )}
        </div>

        {/* Full message if different from summary */}
        {request.message && request.message !== request.summary && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm text-foreground/80 break-all">
              <ExpandableText text={request.message} />
            </p>
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" value={request.category} />

          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Urgency</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyStyle.badge}`}
              >
                {request.urgency}
              </span>
            </div>
          </div>

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
            label="Updated"
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
  );
}

export function LatestRequestSkeleton() {
  return (
    <div className="p-4 rounded-xl border space-y-3 animate-pulse">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
      </div>
    </div>
  );
}