import { User, Api, CreateUserRequest, CreateApiRequest } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function createUser(data: CreateUserRequest): Promise<User> {
  const res = await fetch(`${API_URL}/create_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to create user: ${res.statusText}`);
  }
  return res.json();
}

export async function getUser(userName: string): Promise<User | null> {
  const res = await fetch(`${API_URL}/${userName}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to get user: ${res.statusText}`);
  return res.json();
}

export async function getUserByPubkey(pubkey: string): Promise<User | null> {
  const res = await fetch(`${API_URL}/user/pubkey/${pubkey}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to get user: ${res.statusText}`);
  return res.json();
}

export async function browseApis(): Promise<Api[]> {
  const res = await fetch(`${API_URL}/browse`);
  if (!res.ok) return [];
  return res.json();
}

export async function createApi(userName: string, data: CreateApiRequest): Promise<Api> {
  const res = await fetch(`${API_URL}/${userName}/create_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error(`An API named "${data.name}" already exists. Choose a different name.`);
    }
    const text = await res.text();
    throw new Error(text || `Failed to create API: ${res.statusText}`);
  }
  return res.json();
}

export async function getApi(userName: string, apiName: string): Promise<Api | null> {
  const res = await fetch(`${API_URL}/${userName}/${apiName}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to get API: ${res.statusText}`);
  return res.json();
}

export async function updateApi(
  userName: string,
  apiName: string,
  data: CreateApiRequest,
): Promise<Api> {
  const res = await fetch(`${API_URL}/${userName}/${apiName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 404) {
    throw new Error(`API "${apiName}" was not found.`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update API: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteApi(userName: string, apiName: string): Promise<void> {
  const res = await fetch(`${API_URL}/${userName}/${apiName}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete API: ${res.statusText}`);
  }
}

// Local storage helpers for tracking API names (backend has no list endpoint)
export function getStoredApiNames(userName: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`enigma_apis_${userName}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addStoredApiName(userName: string, apiName: string): void {
  const names = getStoredApiNames(userName);
  if (!names.includes(apiName)) {
    localStorage.setItem(`enigma_apis_${userName}`, JSON.stringify([...names, apiName]));
  }
}

export function removeStoredApiName(userName: string, apiName: string): void {
  const names = getStoredApiNames(userName).filter((n) => n !== apiName);
  localStorage.setItem(`enigma_apis_${userName}`, JSON.stringify(names));
}

export async function sendOtp(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/send_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send verification code");
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/verify_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (res.ok) return { valid: true };
  if (res.status === 422) return { valid: false, error: "Invalid code. Try again." };
  return { valid: false, error: "Code expired. Request a new one." };
}

export async function listUserApis(userName: string): Promise<Api[] | null> {
  const res = await fetch(`${API_URL}/${userName}/apis`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load user APIs");
  return res.json();
}

export async function listApis(userName: string): Promise<Api[]> {
  const names = getStoredApiNames(userName);
  const results = await Promise.allSettled(names.map((name) => getApi(userName, name)));
  return results
    .filter((r): r is PromiseFulfilledResult<Api | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((a): a is Api => a !== null);
}
