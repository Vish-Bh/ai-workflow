const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔐 Helper to get token safely
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// 🚨 Central fetch wrapper
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login?reason=unauthorized";
    return null;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }

  return res.json();
}

// 📥 GET requests
export async function getMyRequests(
  userId: string,
  page: number,
  limit: number,
  urgency?: string,
  category?: string
) {
  const params = new URLSearchParams({
    userId,
    page: String(page),
    limit: String(limit),
  });

  if (urgency) params.append("urgency", urgency);
  if (category) params.append("category", category);

  return apiFetch(
    `${API_URL}/requests/my-requests?${params.toString()}`,
    {
      method: "GET",
    }
  );
}

// 📤 CREATE request
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