const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔐 Get latest 10 (or paginated) requests
export async function getMyRequests(
  userId: string,
  page: number,
  limit: number,
  urgency?: string,
  category?: string
) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    userId,
    page: String(page),
    limit: String(limit),
  });

  if (urgency) params.append("urgency", urgency);
  if (category) params.append("category", category);

  const res = await fetch(
    `http://localhost:3001/requests/my-requests?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ THIS WAS MISSING
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch requests");
  }

  return res.json();
}

// ➕ Create new request
export async function createRequest(token: string, data: any) {
  const res = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create request");
  }

  return res.json(); 
}