import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { useLanguageContext } from "~/components/LanguageProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Svennes Camping" },
    { name: "description", content: "Welcome to Svennes Camping!" },
  ];
}

export default function Home() {
  const { t } = useLanguageContext();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent">
        {/* <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.welcome")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t("home.description")}
            </p>
          </div>
        </div> */}
        <div className="mt-8 text-center bg-transparent">
          <Link
            to="/transactions"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            {t("navigation.transactions")}
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
