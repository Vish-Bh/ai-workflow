"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useEffect, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"

export default function LoginPage() {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validate`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (res.ok) {
          router.push("/dashboard")
        } else {
          localStorage.removeItem("token")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)

    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        return
      }

      localStorage.setItem("token", data.access_token)
      router.push("/dashboard")
    } catch (err) {
      setError("Network error. Please try again later.")
      console.error(err)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthCard
        title="Welcome back"
        description="Enter your credentials to access your account"
        footerText="Don&apos;t have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
      >
        {error && (
          <ErrorBanner message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                name="password"
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </Field>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </FieldGroup>
        </form>
      </AuthCard>
    </main>
  )
}
