const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ---- List Missions ----
export async function listMissions() {
  const res = await fetch(`${BASE}/api/missions`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data ?? [];
}

// ---- Create Mission ----
export async function createMission(mission: any) {
  const res = await fetch(`${BASE}/api/missions`, {
    method: 'POST',
    headers: authHeaders(),         // ✅
    body: JSON.stringify({ data: mission }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json())?.data;
}

// ---- Update Mission ----
export async function updateMission(id: number | string, mission: any) {
  const res = await fetch(`${BASE}/api/missions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),         // ✅
    body: JSON.stringify({ data: mission }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json())?.data;
}

// ---- Delete Mission ----
export async function deleteMission(id: number | string) {
  const res = await fetch(`${BASE}/api/missions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),         // ✅
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json())?.data;
}
