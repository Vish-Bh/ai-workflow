"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyRequests } from "@/lib/api";

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
}

// ─── constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ["general", "support", "billing", "technical", "other"];
const URGENCIES = ["low", "medium", "high"];
const LIMIT = 10;

const URGENCY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const URGENCY_DOT: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

const STATUS_BADGE: Record<string, string> = {
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  open: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-700 border-gray-200",
  resolved: "bg-teal-50 text-teal-700 border-teal-200",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function ExpandableText({ text, limit = 100 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  const displayed = expanded || !isLong ? text : text.slice(0, limit) + "…";

  return (
    <span className="break-all">
      {displayed}
      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((p) => !p);
          }}
          className="ml-1.5 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  colorClass,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs font-medium capitalize transition-all ${
        active
          ? colorClass || "bg-foreground text-background border-foreground"
          : "bg-background border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─── modal ───────────────────────────────────────────────────────────────────

function RequestDetailModal({
  request,
  onClose,
}: {
  request: Request | null;
  onClose: () => void;
}) {
  // hooks ALWAYS at top
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!request) return null;

  const urgencyBadge =
    URGENCY_BADGE[request.urgency?.toLowerCase()] ?? URGENCY_BADGE.medium;

  const urgencyDot =
    URGENCY_DOT[request.urgency?.toLowerCase()] ?? URGENCY_DOT.medium;

  const statusClass =
    STATUS_BADGE[request.status?.toLowerCase() ?? ""] ?? STATUS_BADGE.open;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold">
          <ExpandableText text={request.summary || request.message} />
        </h3>

        <div className="flex gap-2 flex-wrap">
          {request.status && (
            <span className={`px-2 py-1 rounded-full border text-xs ${statusClass}`}>
              {request.status}
            </span>
          )}

          <span className={`w-2 h-2 rounded-full ${urgencyDot}`} />
          <span className={`px-2 py-1 rounded-full border text-xs ${urgencyBadge}`}>
            {request.urgency}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Field label="Category" value={request.category} />
          <Field label="User ID" value={request.userId} />
          <Field
            label="Created"
            value={new Date(request.createdAt).toLocaleString()}
          />
          <Field
            label="Updated"
            value={new Date(request.updatedAt).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

// ─── row ─────────────────────────────────────────────────────────────────────

function RequestRow({
  request,
  onClick,
}: {
  request: Request;
  onClick: () => void;
}) {
  const urgencyBadge =
    URGENCY_BADGE[request.urgency?.toLowerCase()] ?? URGENCY_BADGE.medium;

  const urgencyDot =
    URGENCY_DOT[request.urgency?.toLowerCase()] ?? URGENCY_DOT.medium;

  const statusClass =
    STATUS_BADGE[request.status?.toLowerCase() ?? ""] ?? STATUS_BADGE.open;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-xl border hover:bg-muted/40"
    >
      <div className="flex justify-between">
        <p className="text-sm font-medium line-clamp-1">
          {request.summary || request.message}
        </p>
        {request.status && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClass}`}>
            {request.status}
          </span>
        )}
      </div>

      <div className="flex gap-2 items-center mt-2">
        <span className="text-xs">{request.category}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
        <span className={`text-xs px-2 py-0.5 rounded-full border ${urgencyBadge}`}>
          {request.urgency}
        </span>
        <span className="text-xs ml-auto text-muted-foreground">
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>
    </button>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Request | null>(null);

  const fetchRequests = useCallback(
    async (pg: number, urg: string | null, cat: string | null) => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId") || "";
        const data = await getMyRequests(
          userId,
          pg,
          LIMIT,
          urg ?? undefined,
          cat ?? undefined
        );

        const results: Request[] = data || [];

        setRequests((prev) =>
          pg === 1 ? results : [...prev, ...results]
        );

        setHasMore(results.length === LIMIT);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchRequests(1, urgencyFilter, categoryFilter);
  }, [urgencyFilter, categoryFilter, fetchRequests]);

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">All Requests</h1>

        <div className="space-y-2">
          {loading && page === 1 ? (
            <p>Loading...</p>
          ) : (
            requests.map((r) => (
              <RequestRow
                key={r._id}
                request={r}
                onClick={() => setSelected(r)}
              />
            ))
          )}

          {!loading && hasMore && (
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchRequests(next, urgencyFilter, categoryFilter);
              }}
              className="mt-4 px-4 py-2 border rounded"
            >
              Load more
            </button>
          )}
        </div>
      </div>

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}