"use client";

import {RequestCard} from '../dashboard/request-card'
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

interface RecentRequestsListProps {
  requests: Request[];
  loading: boolean;
  onRequestClick: (request: Request) => void;
}

const INITIAL_COUNT = 5;
const MAX_COUNT = 20;
const STEP = 5;

export function RecentRequestsList({
  requests,
  loading,
  onRequestClick,
}: RecentRequestsListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleRequests = requests.slice(0, visibleCount);
  const hasMore = requests.length > visibleCount && visibleCount < MAX_COUNT;
  const canCollapse = visibleCount > INITIAL_COUNT;

  function showMore() {
    setVisibleCount((prev) => Math.min(prev + STEP, MAX_COUNT, requests.length));
  }

  function showLess() {
    setVisibleCount(INITIAL_COUNT);
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Requests</h2>
        {requests.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {Math.min(visibleCount, requests.length)} of {requests.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: INITIAL_COUNT }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse bg-muted rounded-xl"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No requests yet</p>
      ) : (
        <>
          <div className="space-y-2">
            {visibleRequests.map((req) => (
              <RequestCard key={req._id} request={req} onClick={onRequestClick} />
            ))}
          </div>

          {/* Show more / show less controls */}
          <div className="flex items-center gap-2 pt-1">
            {hasMore && (
              <button
                onClick={showMore}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Show more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
            {canCollapse && (
              <button
                onClick={showLess}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ml-auto"
              >
                Show less
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}