import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { formatINR } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useTransactions } from "@/contexts/transactions-context";

export default function RecentTransactions() {
  const { transactions, isLoadingTransactions, transactionError } =
    useTransactions();
  const recentTransactions = transactions.slice(0, 4);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.title}>Recent Transactions</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all transactions"
          onPress={() => router.replace("/history")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {isLoadingTransactions && recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Loading transactions...</Text>
        ) : recentTransactions.length === 0 ? (
          <Text accessibilityRole={transactionError ? "alert" : undefined} style={styles.emptyText}>
            {transactionError || "No saved transactions yet."}
          </Text>
        ) : (
          recentTransactions.map((transaction, index) => {
            const isCredit =
              transaction.transactionType?.toUpperCase() === "CREDIT";
            const isDebit =
              transaction.transactionType?.toUpperCase() === "DEBIT";
            const label =
              transaction.counterparty?.trim() ||
              transaction.description?.trim() ||
              "Unknown transaction";
            const amount =
              typeof transaction.amount === "number"
                ? transaction.amount
                : Number(transaction.amount);

            return (
              <View
                key={
                  transaction.id ??
                  transaction.transactionId ??
                  String(index)
                }
                style={[styles.row, index > 0 && styles.rowWithBorder]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isCredit
                        ? SpendTrackColors.positiveSurface
                        : isDebit
                          ? SpendTrackColors.negativeSurface
                          : SpendTrackColors.secondarySurface,
                    },
                  ]}
                >
                  <AppIcon
                    name={{
                      ios: isCredit ? "arrow.down.left" : "arrow.up.right",
                      android: isCredit ? "south_west" : "north_east",
                      web: isCredit ? "south_west" : "north_east",
                    }}
                    size={19}
                    color={
                      isCredit
                        ? SpendTrackColors.positive
                        : isDebit
                          ? SpendTrackColors.negative
                          : SpendTrackColors.secondaryText
                    }
                  />
                </View>
                <View style={styles.description}>
                  <Text numberOfLines={1} style={styles.merchant}>
                    {label}
                  </Text>
                  <Text numberOfLines={1} style={styles.category}>
                    {transaction.category || "Uncategorized"}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.amount,
                    isCredit && styles.incomeAmount,
                    isDebit && styles.expenseAmount,
                  ]}
                >
                  {Number.isFinite(amount)
                    ? `${isCredit ? "+" : isDebit ? "-" : ""}${formatINR(Math.abs(amount))}`
                    : "—"}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 6,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  title: {
    color: SpendTrackColors.text,
    fontSize: 17,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.3,
  },
  seeAll: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    paddingVertical: 5,
  },
  card: {
    paddingHorizontal: 15,
    borderRadius: 21,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  row: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  rowWithBorder: {
    borderTopWidth: 1,
    borderTopColor: SpendTrackColors.border,
  },
  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  description: {
    flex: 1,
    minWidth: 0,
  },
  merchant: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  category: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 3,
  },
  emptyText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    paddingVertical: 18,
  },
  amount: {
    maxWidth: "38%",
    textAlign: "right",
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.2,
  },
  incomeAmount: {
    color: SpendTrackColors.positive,
  },
  expenseAmount: {
    color: SpendTrackColors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
