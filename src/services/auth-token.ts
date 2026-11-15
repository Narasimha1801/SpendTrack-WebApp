import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "spendtrack-auth-token";
const USER_ID_KEY = "spendtrack-auth-user-id";

export async function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeAuthToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function storeAuthUserId(userId: string) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function clearAuthUserId() {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
