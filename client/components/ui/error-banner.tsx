"use client"

import { XCircle } from "lucide-react"

type ErrorBannerProps = {
  message: string
  onClose?: () => void
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="w-full mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
      <XCircle className="h-5 w-5 mt-0.5" />
      <div className="flex-1 text-sm">{message}</div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          ✕
        </button>
      )}
    </div>
  )
}