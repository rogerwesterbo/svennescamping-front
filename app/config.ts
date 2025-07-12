export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
  },
} as const;

export type Config = typeof config;
