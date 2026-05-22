const API_BASE = import.meta.env.VITE_API_URL;

export async function getUsers() {
  const response = await fetch(`${API_BASE}/users}`);

  return response.json();
}
