"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          // Token is valid → skip login
          router.push("/dashboard");
        } else {
          // Invalid token → remove it
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, [router]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const formData = new FormData(e.currentTarget)

  const email = formData.get("email")
  const password = formData.get("password")

  try {
    const res = await  fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

    const data = await res.json()
    console.log("RESPONSE:", res.status)
    console.log("DATA:", data)

    if (!res.ok) {
      alert(data.message || "Login failed")
      return
    }
    localStorage.setItem("token", data.access_token)

    router.push("/dashboard")
  } catch (err) {
    console.error(err)
    alert("Something went wrong")
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
                name='password'
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
