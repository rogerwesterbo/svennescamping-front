// app/routes/api.config.tsx
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request: _request }: LoaderFunctionArgs) {
  // These are server-side environment variables that work at runtime
  return Response.json({
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "", // Note: no VITE_ prefix
    },
  });
}
