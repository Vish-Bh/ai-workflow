"use client";

import { useState } from "react";
import { createRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

const CATEGORIES = ["general", "support", "billing", "technical", "other"];
const URGENCIES = ["low", "medium", "high"];

const URGENCY_STYLES: Record<string, string> = {
  low: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 data-[active=true]:bg-green-100 data-[active=true]:border-green-400",
  medium: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 data-[active=true]:bg-amber-100 data-[active=true]:border-amber-400",
  high: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 data-[active=true]:bg-red-100 data-[active=true]:border-red-400",
};

const MAX_LENGTH = 500;

export default function NewRequestPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const remaining = MAX_LENGTH - message.length;
  const isOverLimit = message.length > MAX_LENGTH;
  const isEmpty = !message.trim();

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (isEmpty || isOverLimit) return;

    setLoading(true);
    try {
      await createRequest(token || "", {
        message,
        ...(category && { category }),
        ...(urgency && { urgency }),
      });

      setMessage("");
      setCategory(null);
      setUrgency(null);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">New Request</h1>
          <p className="text-sm text-muted-foreground">
            Describe your issue. Category and urgency are optional.
          </p>
        </div>

        {/* Message box */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Message
          </label>
          <div className="relative">
            <textarea
              rows={6}
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                isOverLimit
                  ? "border-red-300 focus:ring-red-200"
                  : "border-border focus:ring-ring/20"
              }`}
            />
            {/* Character counter */}
            <span
              className={`absolute bottom-3 right-3 text-xs tabular-nums transition-colors ${
                isOverLimit
                  ? "text-red-500 font-medium"
                  : remaining <= 50
                  ? "text-amber-500"
                  : "text-muted-foreground/50"
              }`}
            >
              {remaining}
            </span>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500">
              Message is {Math.abs(remaining)} character{Math.abs(remaining) !== 1 ? "s" : ""} too long.
            </p>
          )}
        </div>

        {/* Optional fields */}
        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Category
              </label>
              <span className="text-xs text-muted-foreground/60">optional</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? null : c)}
                  data-active={category === c}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                    category === c
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Urgency
              </label>
              <span className="text-xs text-muted-foreground/60">optional</span>
            </div>
            <div className="flex gap-2">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(urgency === u ? null : u)}
                  data-active={urgency === u}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${URGENCY_STYLES[u]} ${
                    urgency === u ? "ring-1 ring-offset-1" : ""
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || isEmpty || isOverLimit}
            className="ml-auto px-5 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Submitting…
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}