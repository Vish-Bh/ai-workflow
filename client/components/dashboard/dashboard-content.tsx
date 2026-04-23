"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NewRequestButton } from "../new-request-button";
import { getMyRequests } from "@/lib/api";
import { RecentRequestsList } from "./recent-requests-list";
import { LatestRequestCard } from "./latest-request-card";
import { RequestDetailModal } from "./request-detail-modal";

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

export function DashboardContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [username, setUsername] = useState("User");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        // 🚨 IMPORTANT: no token = go login
        if (!token) {
          router.replace("/login");
          return;
        }

        const storedName = localStorage.getItem("username");
        if (storedName) setUsername(storedName);

        // 📦 fetch requests
        const data = await getMyRequests(token);
        setRequests(data || []);

        // 👤 fetch profile
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🚨 token expired / invalid
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (res.ok) {
          const userData = await res.json();
          if (userData?.name) {
            setUsername(userData.name);
            localStorage.setItem("username", userData.name);
          }
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [requests]);

  const latestRequest = sortedRequests[0] ?? null;

  function handleRequestClick(request: Request) {
    setSelectedRequest(request);
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s a quick overview of your activity
            </p>
          </div>
          <NewRequestButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentRequestsList
            requests={sortedRequests}
            loading={loading}
            onRequestClick={handleRequestClick}
          />

          <LatestRequestCard
            request={selectedRequest ?? latestRequest}
            loading={loading}
          />
        </div>
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}