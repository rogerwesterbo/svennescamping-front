import { useState } from "react";
import {
  useAxiosAuthenticatedApi,
  type ApiUser,
} from "~/hooks/useAxiosAuthenticatedApi";

export function UserApiTest() {
  const api = useAxiosAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: ApiUser;
    message?: string;
  } | null>(null);

  const testUserApi = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await api.getUser();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        User API Test
      </h3>

      <button
        onClick={testUserApi}
        disabled={loading}
        className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Testing...
          </>
        ) : (
          "Test User API"
        )}
      </button>

      {result && (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={
                result.success
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {result.success ? "Success" : "Failed"}
            </span>
          </div>

          {!result.success && result.message && (
            <div className="text-sm">
              <span className="font-medium">Error:</span>{" "}
              <span className="text-red-600 dark:text-red-400">
                {result.message}
              </span>
            </div>
          )}

          {result.success && result.message && (
            <div className="text-sm">
              <span className="font-medium">Message:</span>{" "}
              <span className="text-gray-600 dark:text-gray-400">
                {result.message}
              </span>
            </div>
          )}

          {result.data && (
            <div className="text-sm">
              <span className="font-medium">Data:</span>
              <pre className="mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
