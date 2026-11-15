import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { formatINR } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import {
  useRefreshTransactionsOnFocus,
  useTransactions,
} from "@/contexts/transactions-context";
import type { Transaction } from "@/services/api";

function formatTransactionDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTransactionTime(value?: string | null) {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(2000, 0, 1, hour, minute));
}

function transactionLabel(transaction: Transaction) {
  if (typeof transaction.counterparty === "string" && transaction.counterparty.trim()) {
    return transaction.counterparty.trim();
  }
  if (typeof transaction.description === "string" && transaction.description.trim()) {
    return transaction.description.trim();
  }
  return "Unknown transaction";
}

function transactionAmount(transaction: Transaction) {
  const amount =
    typeof transaction.amount === "number"
      ? transaction.amount
      : typeof transaction.amount === "string"
        ? Number(transaction.amount)
        : Number.NaN;
  return Number.isFinite(amount) ? Math.abs(amount) : null;
}

export default function HistoryScreen() {
  useRefreshTransactionsOnFocus();
  const {
    transactions,
    pagination,
    spendingSummary,
    isLoadingTransactions,
    isLoadingMore,
    transactionError,
    refreshTransactions,
    loadMoreTransactions,
  } = useTransactions();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingTransactions}
            onRefresh={() => void refreshTransactions()}
          />
        }
      >
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>Your saved transactions.</Text>

        {transactionError ? (
          <View style={styles.errorCard}>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {transactionError}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void refreshTransactions()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoadingTransactions && transactions.length === 0 ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={SpendTrackColors.darkSurface} />
            <Text style={styles.emptyDescription}>Loading transactions...</Text>
          </View>
        ) : null}

        {!isLoadingTransactions &&
        !transactionError &&
        transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <AppIcon
                name={{
                  ios: "doc.text",
                  android: "receipt_long",
                  web: "receipt_long",
                }}
                size={26}
                color={SpendTrackColors.secondaryText}
              />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDescription}>
              Upload a PDF statement from the Spending tab to save and view
              your transactions.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/spending")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Go to Spending</Text>
            </Pressable>
          </View>
        ) : transactions.length > 0 ? (
          <>
            <View style={styles.summaryCard}>
              <SummaryItem
                label="Transactions"
                value={String(spendingSummary?.totalTransactionCount ?? pagination.total)}
              />
              <SummaryItem
                label="Debit"
                value={
                  spendingSummary
                    ? formatINR(spendingSummary.totalDebitAmount, true)
                    : "—"
                }
              />
              <SummaryItem
                label="Credit"
                value={
                  spendingSummary
                    ? formatINR(spendingSummary.totalCreditAmount, true)
                    : "—"
                }
                isCredit
              />
            </View>

            <Text style={styles.listTitle}>Saved transactions</Text>
            <View style={styles.listCard}>
              {transactions.map((transaction, index) => {
                const isDebit =
                  transaction.transactionType?.toUpperCase() === "DEBIT";
                const isCredit =
                  transaction.transactionType?.toUpperCase() === "CREDIT";
                const amount = transactionAmount(transaction);
                const time = formatTransactionTime(transaction.transactionTime);
                const details = [
                  transaction.description,
                  transaction.category || "Uncategorized",
                  transaction.requiresReview ? "Needs review" : null,
                ]
                  .filter((value) => typeof value === "string" && value.trim())
                  .join(" · ");

                return (
                  <View
                    key={
                      transaction.id ??
                      transaction.transactionId ??
                      `${transaction.transactionDate ?? "date"}-${transaction.transactionTime ?? index}-${index}`
                    }
                    style={[
                      styles.transactionRow,
                      index > 0 && styles.rowWithBorder,
                    ]}
                  >
                    <View style={styles.transactionCopy}>
                      <Text numberOfLines={1} style={styles.counterparty}>
                        {transactionLabel(transaction)}
                      </Text>
                      <Text numberOfLines={1} style={styles.dateTime}>
                        {formatTransactionDate(transaction.transactionDate)}
                        {time ? ` · ${time}` : ""}
                      </Text>
                      <Text numberOfLines={1} style={styles.transactionDetails}>
                        {details}
                      </Text>
                    </View>
                    <View style={styles.amountColumn}>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={[
                          styles.amount,
                          isCredit && styles.creditAmount,
                          isDebit && styles.debitAmount,
                        ]}
                      >
                        {amount === null ? "—" : formatINR(amount, true)}
                      </Text>
                      <Text
                        style={[
                          styles.transactionType,
                          isCredit && styles.creditType,
                          isDebit && styles.debitType,
                        ]}
                      >
                        {isCredit ? "CREDIT" : isDebit ? "DEBIT" : "TRANSACTION"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {pagination.page < pagination.totalPages ? (
              <Pressable
                accessibilityRole="button"
                disabled={isLoadingMore}
                onPress={() => void loadMoreTransactions()}
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  pressed && styles.pressed,
                ]}
              >
                {isLoadingMore ? (
                  <ActivityIndicator color={SpendTrackColors.darkSurface} />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryItem({
  label,
  value,
  isCredit = false,
}: {
  label: string;
  value: string;
  isCredit?: boolean;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.summaryValue, isCredit && styles.creditAmount]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    color: SpendTrackColors.text,
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 5,
    marginBottom: 18,
  },
  emptyCard: {
    alignItems: "center",
    padding: 22,
    borderRadius: 22,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  loadingCard: {
    alignItems: "center",
    padding: 22,
    borderRadius: 22,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  errorCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: SpendTrackColors.negativeSurface,
  },
  errorText: {
    color: SpendTrackColors.negative,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_500Medium",
    marginBottom: 12,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  emptyTitle: {
    color: SpendTrackColors.text,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 15,
  },
  emptyDescription: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: 7,
    marginBottom: 19,
  },
  primaryButton: {
    minHeight: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: SpendTrackColors.darkSurface,
  },
  primaryButtonText: {
    color: SpendTrackColors.white,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  summaryCard: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
    marginBottom: 6,
  },
  summaryValue: {
    color: SpendTrackColors.text,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  listTitle: {
    color: SpendTrackColors.text,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 23,
    marginBottom: 11,
  },
  listCard: {
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  transactionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowWithBorder: {
    borderTopWidth: 1,
    borderTopColor: SpendTrackColors.border,
  },
  transactionCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  counterparty: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  dateTime: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 5,
  },
  transactionDetails: {
    color: SpendTrackColors.secondaryText,
    fontSize: 9,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 4,
  },
  loadMoreButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  loadMoreText: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  amountColumn: {
    minWidth: 92,
    alignItems: "flex-end",
  },
  amount: {
    maxWidth: "100%",
    color: SpendTrackColors.text,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  debitAmount: {
    color: SpendTrackColors.negative,
  },
  creditAmount: {
    color: SpendTrackColors.positive,
  },
  transactionType: {
    color: SpendTrackColors.secondaryText,
    fontSize: 9,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  debitType: {
    color: SpendTrackColors.negative,
  },
  creditType: {
    color: SpendTrackColors.positive,
  },
  pressed: {
    opacity: 0.75,
  },
});
