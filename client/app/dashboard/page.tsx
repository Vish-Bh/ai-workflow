import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  return<>
   <DashboardContent />

  </>
}
