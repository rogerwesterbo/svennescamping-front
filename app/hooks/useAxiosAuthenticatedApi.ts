import { useAuth } from "../lib/auth";
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "../config";
import { useMemo, useCallback } from "react";

// Extend the AxiosRequestConfig to include our custom skipAuth property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

export interface Transaction {
  id: string;
  external_id?: string;
  source: string;
  amount: number;
  currency: string;
  status:
    | "succeeded"
    | "pending"
    | "failed"
    | "cancelled"
    | "refunded"
    | "processing"
    | "expired"
    | "unknown";
  created_at: Date;
  customer_id: string;
  description: string;
  payment_method?: string;
  receipt_url?: string;
  metadata?: Record<string, string>;
  transaction_type: string; // e.g., "card", "bank_transfer"
  data: any;
  transfer_data: any;
  cached_at: Date;
  product: string; // e.g., "camping", "cabin"
  product_price: number; // Price of the product
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  groups: string[] | null;
  verified: boolean;
  role: "admin" | "user" | "noaccess";
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export function useAxiosAuthenticatedApi() {
  const { getAccessToken, signOut } = useAuth();

  // Create axios client with interceptors
  const createAxiosClient = (
    getToken: () => Promise<string | null>,
    onSignOut: () => Promise<void>
  ): AxiosInstance => {
    const client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    client.interceptors.request.use(
      async (config: CustomAxiosRequestConfig) => {
        // Skip auth for certain endpoints
        if (config.skipAuth) {
          return config;
        }

        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await onSignOut();
        }
        return Promise.reject(error);
      }
    );

    return client;
  };

  const client = useMemo(
    () => createAxiosClient(getAccessToken, signOut),
    [getAccessToken, signOut]
  );

  const handleAxiosResponse = useCallback(
    async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
      try {
        console.log("Making authenticated API call...");
        const response = await apiCall();

        return {
          data: response.data,
          success: true,
        };
      } catch (error: any) {
        console.error("Axios API call failed:", error.message);

        // Return error response with detailed message
        let errorMessage = "API call failed";

        if (error.response) {
          // Server responded with error status
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          // Network error - no response received
          errorMessage =
            "Network error: Unable to reach the server. Please check your connection.";
        } else {
          // Something else happened
          errorMessage = error.message || "Unknown error occurred";
        }

        return {
          data: null as any,
          success: false,
          message: errorMessage,
        };
      }
    },
    []
  );

  return useMemo(
    () => ({
      // Transaction methods
      async getTransactions(): Promise<ApiResponse<Transaction[]>> {
        return handleAxiosResponse<Transaction[]>(() =>
          client.get("/v1/transactions")
        );
      },

      async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
        return handleAxiosResponse<Transaction>(() =>
          client.get(`/v1/transactions/${id}`)
        );
      },

      async createTransaction(
        transaction: Omit<Transaction, "id">
      ): Promise<ApiResponse<Transaction>> {
        return handleAxiosResponse<Transaction>(() =>
          client.post("/v1/transactions", transaction)
        );
      },

      async updateTransaction(
        id: string,
        transaction: Partial<Transaction>
      ): Promise<ApiResponse<Transaction>> {
        return handleAxiosResponse<Transaction>(() =>
          client.put(`/v1/transactions/${id}`, transaction)
        );
      },

      async deleteTransaction(id: string): Promise<ApiResponse<void>> {
        return handleAxiosResponse<void>(() =>
          client.delete(`/v1/transactions/${id}`)
        );
      },

      // User methods
      async getUser(): Promise<ApiResponse<ApiUser>> {
        return handleAxiosResponse<ApiUser>(() => client.get("/v1/user"));
      },

      // Health check (no auth required)
      async healthCheck(): Promise<
        ApiResponse<{ status: string; timestamp: string }>
      > {
        return handleAxiosResponse<{ status: string; timestamp: string }>(() =>
          client.get("/health", { skipAuth: true } as CustomAxiosRequestConfig)
        );
      },

      // Raw axios client for custom requests
      client,
    }),
    [client, handleAxiosResponse]
  );
}

// Utility functions for user role checking
export function isUserAdmin(user: ApiUser | null | undefined): boolean {
  return user?.role === "admin";
}

export function userHasAccess(user: ApiUser | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "user";
}
