import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFocusEffect } from "expo-router";

import type {
  ExtractionSummary,
  PdfExtractionResponse,
  SelectedPdfFile,
  Transaction,
  TransactionImportSummary,
  TransactionPagination,
  TransactionSpendingSummary,
} from "@/services/api";
import {
  getTransactionSummary,
  getTransactions,
} from "@/services/api";

export type ExtractionStatus =
  | "idle"
  | "uploading"
  | "saving"
  | "success"
  | "error";

type TransactionsContextValue = {
  selectedPdf: SelectedPdfFile | null;
  transactions: Transaction[];
  totalTransactionCount: number;
  importSummary: TransactionImportSummary | null;
  pagination: TransactionPagination;
  spendingSummary: TransactionSpendingSummary | null;
  isLoadingTransactions: boolean;
  isLoadingMore: boolean;
  isLoadingSummary: boolean;
  transactionError: string | null;
  summaryError: string | null;
  extractionStatus: ExtractionStatus;
  extractionSummary: ExtractionSummary | null;
  extractionError: string | null;
  selectPdf: (file: SelectedPdfFile) => void;
  clearSelectedPdf: () => void;
  startExtraction: () => void;
  startSaving: () => void;
  completeImport: (
    response: PdfExtractionResponse,
    summary: TransactionImportSummary,
  ) => void;
  failExtraction: (message: string) => void;
  clearTransactionState: () => void;
  refreshTransactions: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null,
);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [selectedPdf, setSelectedPdf] = useState<SelectedPdfFile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [importSummary, setImportSummary] =
    useState<TransactionImportSummary | null>(null);
  const [pagination, setPagination] = useState<TransactionPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [spendingSummary, setSpendingSummary] =
    useState<TransactionSpendingSummary | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] =
    useState<ExtractionStatus>("idle");
  const [extractionSummary, setExtractionSummary] =
    useState<ExtractionSummary | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const selectPdf = useCallback((file: SelectedPdfFile) => {
    setSelectedPdf(file);
    setExtractionStatus("idle");
    setExtractionError(null);
  }, []);

  const clearSelectedPdf = useCallback(() => {
    setSelectedPdf(null);
    setExtractionStatus("idle");
    setExtractionError(null);
  }, []);

  const startExtraction = useCallback(() => {
    setExtractionStatus("uploading");
    setExtractionError(null);
    setImportSummary(null);
  }, []);

  const startSaving = useCallback(() => {
    setExtractionStatus("saving");
    setExtractionError(null);
  }, []);

  const completeImport = useCallback(
    (
      response: PdfExtractionResponse,
      summary: TransactionImportSummary,
    ) => {
      setTotalTransactionCount(response.totalTransactions);
      setImportSummary(summary);
      setExtractionSummary(response.extractionSummary ?? null);
      setExtractionStatus("success");
      setExtractionError(null);
    },
    [],
  );

  const failExtraction = useCallback((message: string) => {
    setExtractionStatus("error");
    setExtractionError(message);
  }, []);

  const clearTransactionState = useCallback(() => {
    setSelectedPdf(null);
    setTransactions([]);
    setTotalTransactionCount(0);
    setImportSummary(null);
    setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
    setSpendingSummary(null);
    setIsLoadingTransactions(true);
    setIsLoadingMore(false);
    setIsLoadingSummary(true);
    setTransactionError(null);
    setSummaryError(null);
    setExtractionStatus("idle");
    setExtractionSummary(null);
    setExtractionError(null);
  }, []);

  const loadTransactionData = useCallback(
    (limit: number) =>
      Promise.allSettled([
        getTransactions(1, limit),
        getTransactionSummary(),
      ]),
    [],
  );

  const applyTransactionData = useCallback(
    ([historyResult, summaryResult]: Awaited<
      ReturnType<typeof loadTransactionData>
    >) => {
      setTransactionError(null);
      setSummaryError(null);

      if (historyResult.status === "fulfilled") {
        setTransactions(historyResult.value.transactions);
        setPagination(historyResult.value.pagination);
      } else {
        setTransactionError(
          historyResult.reason instanceof Error
            ? historyResult.reason.message
            : "Unable to load transaction history.",
        );
      }

      if (summaryResult.status === "fulfilled") {
        setSpendingSummary(summaryResult.value.summary);
      } else {
        setSummaryError(
          summaryResult.reason instanceof Error
            ? summaryResult.reason.message
            : "Unable to load spending summary.",
        );
      }
    },
    [],
  );

  const refreshTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    setIsLoadingSummary(true);
    applyTransactionData(
      await loadTransactionData(pagination.limit),
    );
    setIsLoadingTransactions(false);
    setIsLoadingSummary(false);
  }, [applyTransactionData, loadTransactionData, pagination.limit]);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;
    setIsLoadingMore(true);
    setTransactionError(null);
    try {
      const nextPage = await getTransactions(pagination.page + 1, pagination.limit);
      setTransactions((current) => [...current, ...nextPage.transactions]);
      setPagination(nextPage.pagination);
    } catch (error) {
      setTransactionError(
        error instanceof Error
          ? error.message
          : "Unable to load more transactions.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination]);

  const value = useMemo(
    () => ({
      selectedPdf,
      transactions,
      totalTransactionCount,
      importSummary,
      pagination,
      spendingSummary,
      isLoadingTransactions,
      isLoadingMore,
      isLoadingSummary,
      transactionError,
      summaryError,
      extractionStatus,
      extractionSummary,
      extractionError,
      selectPdf,
      clearSelectedPdf,
      startExtraction,
      startSaving,
      completeImport,
      failExtraction,
      clearTransactionState,
      refreshTransactions,
      loadMoreTransactions,
    }),
    [
      selectedPdf,
      transactions,
      totalTransactionCount,
      importSummary,
      pagination,
      spendingSummary,
      isLoadingTransactions,
      isLoadingMore,
      isLoadingSummary,
      transactionError,
      summaryError,
      extractionStatus,
      extractionSummary,
      extractionError,
      selectPdf,
      clearSelectedPdf,
      startExtraction,
      startSaving,
      completeImport,
      failExtraction,
      clearTransactionState,
      refreshTransactions,
      loadMoreTransactions,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider.",
    );
  }
  return context;
}

export function useRefreshTransactionsOnFocus() {
  const { refreshTransactions } = useTransactions();
  useFocusEffect(
    useCallback(() => {
      void refreshTransactions();
    }, [refreshTransactions]),
  );
}
