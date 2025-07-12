// Catch-all route for unmatched paths
export default function CatchAll() {
  // Return a 404 response for paths that don't match any routes
  // This will handle Chrome DevTools requests and other unmatched paths
  throw new Response("Not Found", { status: 404 });
}
