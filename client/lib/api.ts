const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔐 Helper to get token safely
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// 🚨 Central fetch wrapper (IMPORTANT)
async function apiFetch(url, options = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 🔐 Unauthorized handling
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login?reason=unauthorized";
    return null;
  }

  // 🌐 network / server error
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }

  return res.json();
}

export async function getMyRequests(
  userId,
  page,
  limit,
  urgency,
  category
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