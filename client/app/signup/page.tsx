"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useEffect, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"

export default function SignUpPage() {
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
        console.error(err)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)

    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Signup failed")
        return
      }

      localStorage.setItem("token", data.access_token)
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      setError("Network error. Please try again later.")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthCard
        title="Create an account"
        description="Enter your details to get started"
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLinkHref="/login"
      >
        {error && (
          <ErrorBanner message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
              />
            </Field>

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
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
              />
            </Field>

            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </FieldGroup>
        </form>
      </AuthCard>
    </main>
  )
}