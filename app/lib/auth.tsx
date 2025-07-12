import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { config } from "../config";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface TokenInfo {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp
  token_type: string;
}

export interface Session {
  user: User;
  tokens: TokenInfo;
  expires: string;
}

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // For now, we'll use a simple session check
      const storedSession = localStorage.getItem("auth_session");
      const storedTokens = localStorage.getItem("auth_tokens");

      if (storedSession && storedTokens) {
        const sessionData = JSON.parse(storedSession);
        const tokenData = JSON.parse(storedTokens);

        // Check if session is still valid
        if (sessionData && new Date(sessionData.expires) > new Date()) {
          // Check if access token is still valid
          if (tokenData.expires_at > Date.now()) {
            setSession({ ...sessionData, tokens: tokenData });
            setStatus("authenticated");
          } else if (tokenData.refresh_token) {
            // Try to refresh the token
            const refreshed = await refreshTokenInternal(
              tokenData.refresh_token
            );
            if (refreshed) {
              const newTokens = JSON.parse(
                localStorage.getItem("auth_tokens") || "{}"
              );
              setSession({ ...sessionData, tokens: newTokens });
              setStatus("authenticated");
            } else {
              localStorage.removeItem("auth_session");
              localStorage.removeItem("auth_tokens");
              setStatus("unauthenticated");
            }
          } else {
            localStorage.removeItem("auth_session");
            localStorage.removeItem("auth_tokens");
            setStatus("unauthenticated");
          }
        } else {
          localStorage.removeItem("auth_session");
          localStorage.removeItem("auth_tokens");
          setStatus("unauthenticated");
        }
      } else {
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setStatus("unauthenticated");
    }
  };

  const signIn = async () => {
    // Redirect to Google OAuth
    const clientId = config.google.clientId;
    if (!clientId) {
      console.error("Google Client ID not configured");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "openid email profile";

    const authUrl =
      `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline`;

    window.location.href = authUrl;
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("auth_session");
      localStorage.removeItem("auth_tokens");
      setSession(null);
      setStatus("unauthenticated");

      // Redirect to front page after sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshTokenInternal = async (
    refresh_token: string
  ): Promise<boolean> => {
    try {
      const { clientId, clientSecret } = config.google;
      if (!clientId || !clientSecret) {
        console.error("Google OAuth credentials not configured");
        return false;
      }

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (response.ok) {
        const tokens = await response.json();
        const tokenInfo: TokenInfo = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || refresh_token, // Use new refresh token if provided
          expires_at: Date.now() + tokens.expires_in * 1000,
          token_type: tokens.token_type || "Bearer",
        };

        localStorage.setItem("auth_tokens", JSON.stringify(tokenInfo));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const storedTokens = localStorage.getItem("auth_tokens");
      if (!storedTokens) return null;

      const tokenData: TokenInfo = JSON.parse(storedTokens);

      // Check if token is still valid (with 5 minute buffer)
      if (tokenData.expires_at > Date.now() + 5 * 60 * 1000) {
        return tokenData.access_token;
      }

      // Try to refresh if we have a refresh token
      if (tokenData.refresh_token) {
        const refreshed = await refreshTokenInternal(tokenData.refresh_token);
        if (refreshed) {
          const newTokens = JSON.parse(
            localStorage.getItem("auth_tokens") || "{}"
          );
          return newTokens.access_token;
        }
      }

      // Token expired and couldn't refresh
      await signOut();
      return null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedTokens = localStorage.getItem("auth_tokens");
      if (!storedTokens) return false;

      const tokenData: TokenInfo = JSON.parse(storedTokens);
      if (!tokenData.refresh_token) return false;

      return await refreshTokenInternal(tokenData.refresh_token);
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  const handleAuthCallback = async (code: string) => {
    try {
      const { clientId, clientSecret } = config.google;
      if (!clientId || !clientSecret) {
        console.error("Google OAuth credentials not configured");
        throw new Error("OAuth configuration missing");
      }

      // Exchange code for tokens
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${window.location.origin}/auth/callback`,
        }),
      });

      if (response.ok) {
        const tokens = await response.json();

        // Get user info
        const userResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        if (userResponse.ok) {
          const userInfo = await userResponse.json();

          // Create token info
          const tokenInfo: TokenInfo = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
            token_type: tokens.token_type || "Bearer",
          };

          const session: Session = {
            user: {
              id: userInfo.id,
              name: userInfo.name,
              email: userInfo.email,
              image: userInfo.picture,
            },
            tokens: tokenInfo,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          };

          localStorage.setItem(
            "auth_session",
            JSON.stringify({
              user: session.user,
              expires: session.expires,
            })
          );
          localStorage.setItem("auth_tokens", JSON.stringify(tokenInfo));
          setSession(session);
          setStatus("authenticated");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error handling auth callback:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={
        {
          session,
          status,
          signIn,
          signOut,
          getAccessToken,
          refreshToken,
          handleAuthCallback,
        } as any
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useSession() {
  const { session, status } = useAuth();
  return { data: session, status };
}
