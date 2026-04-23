"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export function DashboardNavbar() {
  return (
    <nav className="flex flex-1 items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          M
        </div>
        <span className="text-lg font-semibold">MyApp</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </nav>
  )
}
