import {
  getAuthToken,
  getAuthUserId,
  storeAuthToken,
  storeAuthUserId,
} from "@/services/auth-token";
import { Platform } from "react-native";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const API_BASE_URL = (configuredBaseUrl || "http://192.168.0.12:3000").replace(
  /\/+$/,
  "",
);

type RequestOptions = {
  authenticated?: boolean;
};

async function requestJson<T>(
  path: string,
  method: "GET" | "POST" | "PATCH",
  payload?: unknown,
  fallbackMessage = "Request failed",
  { authenticated = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  if (authenticated) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || `${fallbackMessage} (${response.status})`,
    );
  }

  return body as T;
}

async function getJson(path: string) {
  return requestJson(path, "GET", undefined, "Backend request failed", {
    authenticated: false,
  });
}

async function postJson<T>(
  path: string,
  payload: unknown,
  fallbackMessage = "Request failed",
  options?: RequestOptions,
) {
  return requestJson<T>(path, "POST", payload, fallbackMessage, options);
}

export async function patchJson<T>(
  path: string,
  payload: unknown,
  fallbackMessage = "Request failed",
) {
  return requestJson<T>(path, "PATCH", payload, fallbackMessage);
}

export async function checkBackend() {
  return getJson("/api/health");
}

export async function checkDatabase() {
  return getJson("/api/health/db");
}

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    jwt?: string;
  };
  user?: unknown;
  message?: string;
  [key: string]: unknown;
};

export async function login(email: string, password: string) {
  const result = await postJson<LoginResponse>(
    "/api/auth/login",
    { email, password },
    "Login failed",
    { authenticated: false },
  );
  const token =
    result.token ??
    result.accessToken ??
    result.access_token ??
    result.jwt ??
    result.data?.token ??
    result.data?.accessToken ??
    result.data?.access_token ??
    result.data?.jwt;

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Login response did not contain an authentication token.");
  }

  const userId = isRecord(result.user) ? result.user.id : undefined;
  if (
    (typeof userId !== "string" && typeof userId !== "number") ||
    !String(userId).trim()
  ) {
    throw new Error("Login response did not contain a user ID.");
  }

  const normalizedUserId = String(userId).trim();
  await storeAuthToken(token);
  await storeAuthUserId(normalizedUserId);
  return result;
}

export async function signup(
  firstName: string,
  lastName: string,
  email: string,
  mobileNumber: string,
  password: string,
) {
  return postJson<LoginResponse>(
    "/api/auth/signup",
    { firstName, lastName, email, mobileNumber, password },
    "Signup failed",
    { authenticated: false },
  );
}

export async function resetPassword(email: string, newPassword: string) {
  return postJson<LoginResponse>(
    "/api/auth/forgot-password",
    { email, newPassword },
    "Password reset failed",
    { authenticated: false },
  );
}

export type AuthenticatedProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobileNumber?: string;
  accountType?: string;
};

export type Transaction = {
  id?: string;
  transactionDate?: string | null;
  transactionTime?: string | null;
  counterparty?: string | null;
  description?: string | null;
  transactionId?: string | null;
  utrNumber?: string | null;
  referenceId?: string | null;
  transactionType?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  paymentApp?: string | null;
  paidBy?: string | null;
  creditedTo?: string | null;
  paymentAccount?: string | null;
  category?: string | null;
  reviewStatus?: string;
  isVerified?: boolean;
  requiresReview?: boolean;
  missingFields?: string[];
  [key: string]: unknown;
};

export type TransactionImportSummary = {
  totalExtracted: number;
  inserted: number;
  duplicates: number;
  requiresReview: number;
  failed: number;
};

export type TransactionImportResponse = {
  success: true;
  message: string;
  summary: TransactionImportSummary;
  importBatchId: string;
};

export type TransactionPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TransactionHistoryResponse = {
  success: true;
  transactions: Transaction[];
  pagination: TransactionPagination;
};

export type TransactionSpendingSummary = {
  totalDebitAmount: number;
  totalCreditAmount: number;
  totalTransactionCount: number;
  debitTransactionCount: number;
  creditTransactionCount: number;
  categoryWiseExpenditure: { category: string; amount: number }[];
  paymentAppWiseExpenditure: { paymentApp: string; amount: number }[];
};

export type TransactionSummaryResponse = {
  success: true;
  summary: TransactionSpendingSummary;
};

export type ExtractionSummary = {
  totalRecordsFound?: number;
  successfullyExtracted?: number;
  recordsWithMissingFields?: number;
  requiresReview?: boolean;
  [key: string]: unknown;
};

export type PdfExtractionResponse = {
  success: true;
  fileType?: string;
  totalTransactions: number;
  transactions: Transaction[];
  extractionSummary?: ExtractionSummary;
};

export type SelectedPdfFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  file?: Blob;
};

type NativePdfFormData = FormData & {
  append(
    name: string,
    value: { uri: string; name: string; type: string },
  ): void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePdfExtractionResponse(value: unknown): PdfExtractionResponse {
  if (!isRecord(value) || value.success !== true) {
    throw new Error("The PDF could not be processed. Check the file and retry.");
  }

  if (
    !Array.isArray(value.transactions) ||
    !value.transactions.every(isRecord)
  ) {
    throw new Error("The server returned an invalid transaction list.");
  }

  const transactions = value.transactions as Transaction[];
  const extractionSummary = isRecord(value.extractionSummary)
    ? (value.extractionSummary as ExtractionSummary)
    : undefined;
  const totalTransactions =
    typeof value.totalTransactions === "number" &&
    Number.isInteger(value.totalTransactions) &&
    value.totalTransactions >= 0
      ? value.totalTransactions
      : transactions.length;

  return {
    success: true,
    ...(typeof value.fileType === "string" ? { fileType: value.fileType } : {}),
    totalTransactions,
    transactions,
    ...(extractionSummary ? { extractionSummary } : {}),
  };
}

export async function extractPdfTransactions(
  file: SelectedPdfFile,
): Promise<PdfExtractionResponse> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const formData = new FormData();
  if (file.file) {
    formData.append("file", file.file);
  } else {
    if (Platform.OS === "web") {
      throw new Error("Unable to read the selected PDF. Please choose it again.");
    }
    const nativeFormData = formData as NativePdfFormData;
    nativeFormData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/pdf",
    });
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/pdf/extract`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
  } catch {
    throw new Error(
      "Couldn't reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("This PDF is larger than the server's upload limit.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (response.status >= 500) {
      throw new Error("The server is unavailable. Please try again later.");
    }
    throw new Error(`Could not extract transactions (HTTP ${response.status}).`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please retry.");
  }

  return parsePdfExtractionResponse(body);
}

export async function importTransactions(
  transactions: Transaction[],
  sourceFileName: string,
): Promise<TransactionImportResponse> {
  const fileLabel = sourceFileName.toLowerCase();
  const paymentApp = [
    { match: /phonepe|phone pe/, name: "PhonePe" },
    { match: /google ?pay|gpay/, name: "Google Pay" },
    { match: /paytm/, name: "Paytm" },
  ].find((candidate) => candidate.match.test(fileLabel))?.name;

  return postJson<TransactionImportResponse>(
    "/api/transactions/import",
    {
      transactions,
      sourceFileName,
      ...(paymentApp ? { paymentApp } : {}),
    },
    "Unable to save transactions",
  );
}

export async function getTransactions(
  page = 1,
  limit = 20,
): Promise<TransactionHistoryResponse> {
  return requestJson<TransactionHistoryResponse>(
    `/api/transactions?page=${page}&limit=${limit}`,
    "GET",
    undefined,
    "Unable to load transaction history",
  );
}

export async function getTransactionSummary(): Promise<TransactionSummaryResponse> {
  return requestJson<TransactionSummaryResponse>(
    "/api/transactions/summary",
    "GET",
    undefined,
    "Unable to load spending summary",
  );
}

function getProfileRecord(
  response: unknown,
  requestedUserId: string,
): AuthenticatedProfile {
  if (!isRecord(response)) {
    throw new Error("The profile response was not in the expected format.");
  }

  const data = isRecord(response.data) ? response.data : undefined;
  const responseData = data ?? response;
  const profile = isRecord(responseData.user)
    ? responseData.user
    : isRecord(responseData.profile)
      ? responseData.profile
      : responseData;
  const id = profile.id ?? responseData.userId ?? requestedUserId;

  const mobileNumber =
    profile.mobileNumber ?? profile.mobile ?? profile.phoneNumber;

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    !String(id).trim() ||
    typeof profile.email !== "string"
  ) {
    throw new Error(
      "The profile response is missing the user ID or email address.",
    );
  }

  return {
    id: String(id),
    ...(typeof profile.firstName === "string"
      ? { firstName: profile.firstName }
      : {}),
    ...(typeof profile.lastName === "string"
      ? { lastName: profile.lastName }
      : {}),
    email: profile.email,
    ...(typeof mobileNumber === "string" ? { mobileNumber } : {}),
    ...(typeof profile.accountType === "string"
      ? { accountType: profile.accountType }
      : {}),
  };
}

export async function getProfile(): Promise<AuthenticatedProfile> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Your session is missing a user ID. Please sign in again.");
  }

  const response = await requestJson<unknown>(
    `/api/auth/profile?userId=${encodeURIComponent(userId)}`,
    "GET",
    undefined,
    "Unable to load your profile",
  );
  return getProfileRecord(response, userId);
}

export { API_BASE_URL };
