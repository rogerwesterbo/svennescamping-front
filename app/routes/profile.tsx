import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import {
  useAxiosAuthenticatedApi,
  type ApiUser,
  isUserAdmin,
} from "~/hooks/useAxiosAuthenticatedApi";
import { UserApiTest } from "~/components/UserApiTest";
import { useLanguageContext } from "~/components/LanguageProvider";

interface UserClaims {
  [key: string]: any;
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { session, getAccessToken } = useAuth();
  const api = useAxiosAuthenticatedApi();
  const { t } = useLanguageContext();
  const [userInfo, setUserInfo] = useState<UserClaims | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check if user is admin from API data (fallback to email-based check)
  const isAdmin = apiUser
    ? isUserAdmin(apiUser)
    : session?.user.email?.endsWith("@admin.com") ||
      session?.user.email === "admin@example.com" ||
      session?.user.email === "rogerwesterbo@gmail.com";

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiError(null);

        const token = await getAccessToken();
        if (!token) {
          setError(t("profile.noAccessToken"));
          return;
        }

        setAccessToken(token);

        // Fetch user info from Google API
        const googleResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          setUserInfo(googleData);
        } else {
          setError(t("profile.fetchError"));
        }

        // Fetch user info from your API
        try {
          const apiResponse = await api.getUser();
          if (apiResponse.success && apiResponse.data) {
            setApiUser(apiResponse.data);
          } else {
            setApiError(
              apiResponse.message || "Failed to fetch user data from API"
            );
            console.warn("API user fetch failed:", apiResponse.message);
          }
        } catch (err) {
          setApiError("Failed to connect to user API");
          console.error("User API error:", err);
        }
      } catch (err) {
        setError("Error fetching user information");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [getAccessToken]); // Removed userApi from dependencies to prevent infinite loop

  const copyAccessToken = async () => {
    if (accessToken) {
      try {
        await navigator.clipboard.writeText(accessToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy token:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = accessToken;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t("common.error")}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {t("profile.title")}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {t("profile.userInfo")}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              {/* Profile Picture */}
              {session?.user.image && (
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("profile.image")}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-16 w-16 rounded-full"
                    />
                  </dd>
                </div>
              )}

              {/* Basic Info from Session */}
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("profile.userId")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.user.id}
                </dd>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("profile.name")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.user.name || "N/A"}
                </dd>
              </div>

              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("profile.email")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.user.email}
                </dd>
              </div>

              {/* Extended Info from Google API */}
              {userInfo &&
                Object.entries(userInfo).map(([key, value], index) => {
                  // Skip basic fields already shown
                  if (["id", "name", "email", "picture"].includes(key))
                    return null;

                  return (
                    <div
                      key={key}
                      className={`${
                        index % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-700"
                          : "bg-white dark:bg-gray-800"
                      } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                    >
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        Google {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </dd>
                    </div>
                  );
                })}

              {/* API User Info Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-5 sm:px-6">
                <h4 className="text-md font-medium text-blue-800 dark:text-blue-200">
                  {t("profile.apiUserInfo")}
                </h4>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  User data from the application API
                </p>
              </div>

              {apiError ? (
                <div className="bg-red-50 dark:bg-red-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-red-600 dark:text-red-400">
                    API Error
                  </dt>
                  <dd className="mt-1 text-sm text-red-800 dark:text-red-300 sm:mt-0 sm:col-span-2">
                    {apiError}
                    {apiError.includes("noaccess") ||
                    apiError.includes("Access denied") ? (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Your account does not have access to this application.
                        Please contact an administrator.
                      </div>
                    ) : null}
                  </dd>
                </div>
              ) : apiUser ? (
                <>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("profile.role")}
                    </dt>
                    <dd className="mt-1 sm:mt-0 sm:col-span-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apiUser.role === "admin"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : apiUser.role === "user"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {apiUser.role}
                      </span>
                    </dd>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("profile.verified")}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apiUser.verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {apiUser.verified
                          ? t("profile.verified")
                          : `Not ${t("profile.verified")}`}
                      </span>
                    </dd>
                  </div>

                  {apiUser.groups && apiUser.groups.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.groups")}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {apiUser.groups.map((group, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    API Status
                  </dt>
                  <dd className="mt-1 text-sm text-yellow-800 dark:text-yellow-300 sm:mt-0 sm:col-span-2">
                    No user data available from API
                  </dd>
                </div>
              )}

              {/* Token Info */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("profile.sessionExpires")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.expires
                    ? new Date(session.expires).toLocaleString()
                    : "N/A"}
                </dd>
              </div>

              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("profile.tokenExpires")}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.tokens?.expires_at
                    ? new Date(session.tokens.expires_at).toLocaleString()
                    : "N/A"}
                </dd>
              </div>

              {/* Admin Section */}
              {isAdmin && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {t("profile.adminAccess")}
                    </dt>
                    <dd className="mt-1 text-sm text-blue-800 dark:text-blue-300 sm:mt-0 sm:col-span-2">
                      You have administrative privileges
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {apiUser && apiUser.role === "admin"
                          ? "(Verified via API)"
                          : "(Based on email - API verification unavailable)"}
                      </div>
                    </dd>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {t("profile.accessToken")}
                    </dt>
                    <dd className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={copyAccessToken}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          {copied ? (
                            <>
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {t("profile.copied")}
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              {t("profile.copyAccessToken")}
                            </>
                          )}
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t("profile.apiTestingUse")}
                        </span>
                      </div>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* API Test Component for Development */}
        {isAdmin && (
          <div className="mt-8">
            <UserApiTest />
          </div>
        )}
      </div>
    </div>
  );
}
