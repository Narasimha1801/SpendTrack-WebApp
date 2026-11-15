const TOKEN_KEY = "spendtrack-auth-token";
const USER_ID_KEY = "spendtrack-auth-user-id";

export async function getAuthToken() {
  return typeof window === "undefined"
    ? null
    : window.sessionStorage.getItem(TOKEN_KEY);
}

export async function storeAuthToken(token: string) {
  if (typeof window === "undefined") {
    throw new Error("Cannot store an authentication token outside the browser.");
  }

  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export async function getAuthUserId() {
  return typeof window === "undefined"
    ? null
    : window.sessionStorage.getItem(USER_ID_KEY);
}

export async function storeAuthUserId(userId: string) {
  if (typeof window === "undefined") {
    throw new Error("Cannot store a user ID outside the browser.");
  }

  window.sessionStorage.setItem(USER_ID_KEY, userId);
}

export async function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(TOKEN_KEY);
  }
}

export async function clearAuthUserId() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(USER_ID_KEY);
  }
}
