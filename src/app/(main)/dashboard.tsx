import { StatusBar, ScrollView, StyleSheet, View } from "react-native";

import BalanceCard from "@/components/dashboard/balance-card";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import SpendingOverview from "@/components/dashboard/spending-overview";
import SummaryCards from "@/components/dashboard/summary-cards";
import { mockUserProfile } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import {
  useRefreshTransactionsOnFocus,
  useTransactions,
} from "@/contexts/transactions-context";

export default function DashboardScreen() {
  useRefreshTransactionsOnFocus();
  const { spendingSummary } = useTransactions();
  const totalCreditAmount = spendingSummary?.totalCreditAmount ?? null;
  const totalDebitAmount = spendingSummary?.totalDebitAmount ?? null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader firstName={mockUserProfile.firstName} />
        <BalanceCard
          netFlow={
            totalCreditAmount === null || totalDebitAmount === null
              ? null
              : totalCreditAmount - totalDebitAmount
          }
        />
        <SummaryCards
          income={totalCreditAmount}
          expenses={totalDebitAmount}
          incomeChange="Across all saved transactions"
        />
        <SpendingOverview />
        <RecentTransactions />
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
});
