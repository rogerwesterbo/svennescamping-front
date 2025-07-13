import type { LoaderFunctionArgs } from "react-router";

export function loader({}: LoaderFunctionArgs) {
  // Simple health check - return 200 OK with a basic status
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "svennescamping-front",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
