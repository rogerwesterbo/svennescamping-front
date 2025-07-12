import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/unauthorized", "routes/unauthorized.tsx"),
  route("/auth/callback", "routes/auth.callback.tsx"),
  route("/transactions", "routes/transactions.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("*", "routes/$.tsx"), // Catch-all route for unmatched paths
] satisfies RouteConfig;
