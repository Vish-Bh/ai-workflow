"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyRequests } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type UserType = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

function getInitial(name: string) {
  return name?.charAt(0).toUpperCase() ?? "?";
}

function getAccountAge(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatJoined(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function getDaysActive(createdAt: string) {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(1, days);
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  // ─── FETCH USER ─────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  // ─── FETCH REQUESTS ────────────────────────────────────────
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!user) return;

        const data = await getMyRequests(user._id, 1, 100);
        setRequests(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, [user]);

  // ─── ANALYTICS DATA ────────────────────────────────────────
  const categories = [
    "general",
    "support",
    "billing",
    "technical",
    "other",
  ];

  const urgencies = ["low", "medium", "high"];

  const categoryStats = categories.map((cat) => ({
    name: cat,
    value: requests.filter((r) => r.category === cat).length,
  }));

  const urgencyStats = urgencies.map((u) => ({
    name: u,
    value: requests.filter((r) => r.urgency === u).length,
  }));

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="space-y-6 max-w-3xl">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Your account information.
        </p>
      </div>

      {/* USER HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-medium text-blue-700 dark:text-blue-300 border border-border">
          {user ? getInitial(user.name) : "..."}
        </div>

        <div>
          <p className="text-xl font-medium">
            {user?.name ?? "Loading..."}
          </p>

          <Badge className="mt-1 text-xs bg-green-50 text-green-700 border-green-300">
            Active
          </Badge>
        </div>
      </div>

      {/* DETAILS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
            Account details
          </CardTitle>
        </CardHeader>

        <CardContent className="divide-y">
          {[
            { label: "Name", value: user?.name },
            { label: "Email", value: user?.email },
            {
              label: "User ID",
              value: user?._id,
              mono: true,
            },
            {
              label: "Member since",
              value: user?.createdAt
                ? formatDate(user.createdAt)
                : undefined,
            },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              className="flex justify-between py-2.5"
            >
              <span className="text-sm text-muted-foreground">
                {label}
              </span>
              <span
                className={`text-sm font-medium ${
                  mono
                    ? "font-mono text-xs text-muted-foreground"
                    : ""
                }`}
              >
                {value ?? "—"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* STATS */}
      {user && (
        <>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Stats
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Days active",
                value: getDaysActive(user.createdAt),
              },
              {
                label: "Joined",
                value: formatJoined(user.createdAt),
              },
              {
                label: "Account age",
                value: getAccountAge(user.createdAt),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-muted/50 rounded-lg p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {s.label}
                </p>
                <p className="text-xl font-medium">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ANALYTICS */}
      {user && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Request Analytics
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">

            {/* CATEGORY CHART */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                By Category
              </p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {categoryStats.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* URGENCY CHART */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                By Urgency
              </p>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyStats}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={60}
                      label
                    >
                      {urgencyStats.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}