import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import {
  useAxiosAuthenticatedApi,
  type Transaction,
} from "../hooks/useAxiosAuthenticatedApi";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { useLanguageContext } from "~/components/LanguageProvider";
import { useProductTranslation } from "~/utils/productTranslations";
import type { MetaFunction, ClientLoaderFunctionArgs } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Transactions - Svennes Camping" },
    { name: "description", content: "View and manage your transactions" },
  ];
};

// Prevent React Router from automatically fetching data
export async function clientLoader({
  request: _request,
}: ClientLoaderFunctionArgs) {
  // Return null to prevent automatic data fetching
  return null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const isLoadingRef = useRef(false);
  const api = useAxiosAuthenticatedApi();
  const { t, currentLanguage } = useLanguageContext();
  const { translateProduct } = useProductTranslation();

  useEffect(() => {
    const initialFetch = async () => {
      if (isLoadingRef.current) {
        return; // Prevent duplicate calls
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);
        const response = await api.getTransactions();

        if (response.success) {
          setTransactions(response.data);
        } else {
          setError(response.message || "Failed to load transactions");
        }
      } catch (err) {
        setError("An error occurred while fetching transactions");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we only want this to run once on mount

  // Refetch data when language changes
  useEffect(() => {
    // Only refetch if we have already loaded data initially (not on first mount)
    if (transactions.length > 0 || error) {
      refetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]); // Refetch when language changes

  const refetchTransactions = async () => {
    if (isLoadingRef.current) {
      return; // Prevent duplicate calls
    }

    try {
      isLoadingRef.current = true;
      setRefreshing(true);
      setError(null);
      const response = await api.getTransactions();

      if (response.success) {
        setTransactions(response.data);
      } else {
        setError(response.message || "Failed to load transactions");
      }
    } catch (err) {
      setError("An error occurred while fetching transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  };

  const formatCurrency = useCallback(
    (value: number, currency: string = "USD") => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(value);
    },
    []
  );

  const formatDate = useCallback((value: Date | string) => {
    const date = typeof value === "string" ? new Date(value) : value;
    return date.toLocaleString("no-NB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, []);

  const amountBodyTemplate = (rowData: Transaction) => {
    const amount = formatCurrency(rowData.amount, rowData.currency);
    const isPositive = rowData.amount >= 0;
    return (
      <span
        className={`font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
      >
        {amount}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: Transaction) => {
    return formatDate(rowData.created_at);
  };

  const statusBodyTemplate = (rowData: Transaction) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case "succeeded":
          return "success"; // Green - successful completion
        case "pending":
          return "warning"; // Orange/Yellow - waiting/in progress
        case "processing":
          return "warning"; // Orange/Yellow - being processed
        case "failed":
          return "danger"; // Red - error/failure
        case "cancelled":
          return "secondary"; // Gray - user cancelled
        case "refunded":
          return "info"; // Blue - money returned
        case "expired":
          return "secondary"; // Gray - time expired
        case "unknown":
          return "secondary"; // Gray - unknown state
        default:
          return "secondary"; // Gray - fallback
      }
    };

    return (
      <Tag
        value={rowData.status}
        severity={getSeverity(rowData.status)}
        className="capitalize"
      />
    );
  };

  const typeBodyTemplate = (rowData: Transaction) => {
    return (
      <Tag
        value={rowData.transaction_type}
        severity={rowData.transaction_type === "income" ? "success" : "danger"}
        className="capitalize"
      />
    );
  };

  const productBodyTemplate = (rowData: Transaction) => {
    const productName = rowData.product || "Unknown Product";
    const translatedProduct = translateProduct(productName);
    return translatedProduct;
  };

  const mobileRowTemplate = (rowData: Transaction) => {
    const productName = rowData.product || "Unknown Product";
    const translatedProduct = translateProduct(productName);

    return (
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {translatedProduct}
            </div>
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {rowData.source}
            </div>
            {/* <div className="text-sm text-gray-500 dark:text-gray-400">
              {rowData.payment_method || "N/A"}
            </div>
            {rowData.external_id && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                ID: {rowData.external_id}
              </div>
            )} */}
          </div>
          <div
            className={`font-semibold text-lg ${rowData.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {formatCurrency(rowData.amount, rowData.currency)}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <Tag
              value={rowData.transaction_type}
              severity={
                rowData.transaction_type === "income" ? "success" : "danger"
              }
              className="capitalize text-xs"
            />
            <Tag
              value={rowData.status}
              severity={(() => {
                switch (rowData.status) {
                  case "succeeded":
                    return "success";
                  case "pending":
                  case "processing":
                    return "warning";
                  case "failed":
                    return "danger";
                  case "refunded":
                    return "info";
                  case "cancelled":
                  case "expired":
                  case "unknown":
                  default:
                    return "secondary";
                }
              })()}
              className="capitalize text-xs"
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {formatDate(rowData.created_at)}
          </span>
        </div>
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">
        {t("transactions.title")}
      </h2>
      <div className="flex flex-col md:flex-row gap-2">
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("common.search")}
          className="w-full md:w-auto"
        />
        <Button
          icon="pi pi-refresh"
          label={t("common.refresh")}
          onClick={refetchTransactions}
          loading={refreshing}
          className="w-full md:w-auto"
          outlined
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} />
        <Button
          label={t("common.tryAgain")}
          icon="pi pi-refresh"
          onClick={refetchTransactions}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg md:border md:border-gray-200 dark:md:border-gray-700 md:shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 md:border-b-0">
            {header}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <DataTable
              value={transactions}
              paginator
              rows={25}
              rowsPerPageOptions={[10, 25, 50, 100]}
              globalFilter={globalFilter}
              emptyMessage={t("transactions.noTransactions")}
              className="p-datatable-striped"
            >
              <Column
                field="amount"
                header={t("transactions.amount")}
                body={amountBodyTemplate}
                sortable
                className="w-1/6"
              />
              <Column
                field="product"
                header={t("transactions.product")}
                body={productBodyTemplate}
                sortable
                className="w-1/4"
              />
              <Column
                field="source"
                header={t("transactions.source")}
                sortable
                className="w-1/4"
              />
              <Column
                field="created_at"
                header={t("transactions.date")}
                body={dateBodyTemplate}
                sortable
                className="w-1/6"
              />
              <Column
                field="transaction_type"
                header={t("transactions.type")}
                body={typeBodyTemplate}
                sortable
                className="w-1/12"
              />
              <Column
                field="status"
                header={t("transactions.status")}
                body={statusBodyTemplate}
                sortable
                className="w-1/12"
              />
            </DataTable>
          </div>

          {/* Mobile Stacked View */}
          <div className="md:hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {t("transactions.noTransactions")}
              </div>
            ) : (
              <div>
                {transactions.map((transaction, index) => (
                  <React.Fragment
                    key={
                      transaction.id ||
                      transaction.external_id ||
                      `transaction-${index}`
                    }
                  >
                    {mobileRowTemplate(transaction)}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
