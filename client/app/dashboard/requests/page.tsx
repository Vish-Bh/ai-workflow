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
          onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
          className="ml-1.5 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
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
          ? colorClass
            ? colorClass
            : "bg-foreground text-background border-foreground"
          : "bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─── detail modal ─────────────────────────────────────────────────────────────

function RequestDetailModal({
  request,
  onClose,
}: {
  request: Request | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!request) return null;

  const urgencyBadge = URGENCY_BADGE[request.urgency?.toLowerCase()] ?? URGENCY_BADGE.medium;
  const urgencyDot = URGENCY_DOT[request.urgency?.toLowerCase()] ?? URGENCY_DOT.medium;
  const statusClass = STATUS_BADGE[request.status?.toLowerCase() ?? ""] ?? STATUS_BADGE.open;
const [requests, setRequests] = useState<any[]>([]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug">
            <ExpandableText text={request.summary || request.message} />
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {request.status && (
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
              {request.status}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${urgencyDot}`} />
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${urgencyBadge}`}>
              {request.urgency} urgency
            </span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          {request.message && request.message !== request.summary && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Full message</p>
              <p className="text-sm text-foreground/90 leading-relaxed">
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
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
            <Field
              label="Last updated"
              value={new Date(request.updatedAt).toLocaleString(undefined, {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── request row ─────────────────────────────────────────────────────────────

function RequestRow({
  request,
  onClick,
}: {
  request: Request;
  onClick: () => void;
}) {
  const urgencyBadge = URGENCY_BADGE[request.urgency?.toLowerCase()] ?? URGENCY_BADGE.medium;
  const urgencyDot = URGENCY_DOT[request.urgency?.toLowerCase()] ?? URGENCY_DOT.medium;
  const statusClass = STATUS_BADGE[request.status?.toLowerCase() ?? ""] ?? STATUS_BADGE.open;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-xl border hover:bg-muted/40 hover:border-muted-foreground/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring space-y-2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug line-clamp-1">
          {request.summary || request.message}
        </p>
        {request.status && (
          <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
            {request.status}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${
          "bg-background border-border text-muted-foreground"
        }`}>
          {request.category}
        </span>

        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyBadge}`}>
            {request.urgency}
          </span>
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(request.createdAt).toLocaleDateString(undefined, {
            month: "short", day: "numeric", year: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="px-4 py-3.5 rounded-xl border space-y-2 animate-pulse">
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-3 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-12" />
        <div className="h-3 bg-muted rounded w-20 ml-auto" />
      </div>
    </div>
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
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId") || "";
        const data = await getMyRequests(
          userId,
          pg,
          LIMIT,
          urg ?? undefined,
          cat ?? undefined,
        );
        const results: Request[] = data || [];
        setRequests((prev) => (pg === 1 ? results : [...prev, ...results]));
        setHasMore(results.length === LIMIT);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchRequests(1, urgencyFilter, categoryFilter);
  }, [urgencyFilter, categoryFilter, fetchRequests]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchRequests(next, urgencyFilter, categoryFilter);
  }

  function toggleUrgency(u: string) {
    setUrgencyFilter((prev) => (prev === u ? null : u));
  }

  function toggleCategory(c: string) {
    setCategoryFilter((prev) => (prev === c ? null : c));
  }

  const hasActiveFilters = urgencyFilter || categoryFilter;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">All Requests</h1>
            <p className="text-sm text-muted-foreground">Browse and filter your submitted requests</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setUrgencyFilter(null); setCategoryFilter(null); }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* filters */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <FilterPill
                  key={c}
                  label={c}
                  active={categoryFilter === c}
                  onClick={() => toggleCategory(c)}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Urgency</p>
            <div className="flex flex-wrap gap-2">
              {URGENCIES.map((u) => (
                <FilterPill
                  key={u}
                  label={u}
                  active={urgencyFilter === u}
                  onClick={() => toggleUrgency(u)}
                  colorClass={
                    u === "low"
                      ? "bg-green-100 text-green-700 border-green-400"
                      : u === "medium"
                      ? "bg-amber-100 text-amber-700 border-amber-400"
                      : "bg-red-100 text-red-700 border-red-400"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* list */}
        <div className="space-y-2">
          {loading && page === 1 ? (
            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
          ) : requests.length === 0 ? (
            <div className="py-16 text-center space-y-1">
              <p className="text-sm font-medium">No requests found</p>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? "Try removing some filters." : "You haven't submitted any requests yet."}
              </p>
            </div>
          ) : (
            <>
              {requests.map((req) => (
                <RequestRow key={req._id} request={req} onClick={() => setSelected(req)} />
              ))}

              {/* load more / loading more skeleton */}
              {loading && page > 1 && (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              )}

              {!loading && hasMore && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="px-5 py-2 rounded-xl border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                  >
                    Load more
                  </button>
                </div>
              )}

              {!loading && !hasMore && requests.length > 0 && (
                <p className="text-center text-xs text-muted-foreground pt-4">
                  All {requests.length} requests loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <RequestDetailModal request={selected} onClose={() => setSelected(null)} />
    </>
  );
}