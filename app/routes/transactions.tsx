import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import {
  useAxiosAuthenticatedApi,
  type Transaction,
} from "../hooks/useAxiosAuthenticatedApi";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { useLanguageContext } from "~/components/LanguageProvider";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Transactions - Svennes Camping" },
    { name: "description", content: "View and manage your transactions" },
  ];
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const api = useAxiosAuthenticatedApi();
  const { t } = useLanguageContext();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTransactions();

      if (response.success) {
        setTransactions(response.data);
      } else {
        setError(response.message || t("transactions.loadError"));
      }
    } catch (err) {
      setError(t("common.error"));
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
    return formatDate(rowData.date);
  };

  const statusBodyTemplate = (rowData: Transaction) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case "completed":
          return "success";
        case "pending":
          return "warning";
        case "failed":
          return "danger";
        default:
          return "info";
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
        value={rowData.type}
        severity={rowData.type === "income" ? "success" : "danger"}
        className="capitalize"
      />
    );
  };

  const descriptionBodyTemplate = (rowData: Transaction) => {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white">
          {rowData.description}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {rowData.category}
        </span>
      </div>
    );
  };

  const mobileRowTemplate = (rowData: Transaction) => {
    return (
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              {rowData.description}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {rowData.category}
            </div>
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
              value={rowData.type}
              severity={rowData.type === "income" ? "success" : "danger"}
              className="capitalize text-xs"
            />
            <Tag
              value={rowData.status}
              severity={
                rowData.status === "completed"
                  ? "success"
                  : rowData.status === "pending"
                    ? "warning"
                    : "danger"
              }
              className="capitalize text-xs"
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {formatDate(rowData.date)}
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
          onClick={fetchTransactions}
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
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              globalFilter={globalFilter}
              emptyMessage={t("transactions.noTransactions")}
              className="p-datatable-striped"
            >
              <Column
                field="amount"
                header={t("transactions.amount")}
                body={amountBodyTemplate}
                sortable
                className="w-32"
              />
              <Column
                field="description"
                header={t("transactions.description")}
                body={descriptionBodyTemplate}
                sortable
                className="min-w-48"
              />
              <Column
                field="date"
                header={t("transactions.date")}
                body={dateBodyTemplate}
                sortable
                className="w-32"
              />
              <Column
                field="type"
                header={t("transactions.type")}
                body={typeBodyTemplate}
                sortable
                className="w-24"
              />
              <Column
                field="status"
                header={t("transactions.status")}
                body={statusBodyTemplate}
                sortable
                className="w-32"
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
                {transactions.map((transaction) =>
                  mobileRowTemplate(transaction)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
