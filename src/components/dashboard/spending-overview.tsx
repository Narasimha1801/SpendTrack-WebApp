import { StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { formatINR } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useTransactions } from "@/contexts/transactions-context";

export default function SpendingOverview() {
  const { spendingSummary, isLoadingSummary, summaryError } = useTransactions();
  const categories = spendingSummary?.categoryWiseExpenditure ?? [];
  const paymentApps = spendingSummary?.paymentAppWiseExpenditure ?? [];
  const totalSpending = spendingSummary?.totalDebitAmount;
  const largestCategory = Math.max(
    0,
    ...categories.map((category) => category.amount),
  );
  const categoryColors = [
    SpendTrackColors.positive,
    SpendTrackColors.warning,
    SpendTrackColors.info,
    SpendTrackColors.darkSurface,
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.title}>Spending Overview</Text>
          <Text style={styles.subtitle}>A look at where your money goes</Text>
        </View>
        <View style={styles.periodSelector}>
          <Text style={styles.periodText}>All time</Text>
          <AppIcon
            name={{ ios: "chevron.down", android: "expand_more", web: "expand_more" }}
            size={14}
            color={SpendTrackColors.secondaryText}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total spent</Text>
            <Text style={styles.totalAmount}>
              {totalSpending === undefined ? "—" : formatINR(totalSpending, true)}
            </Text>
          </View>
          <View style={styles.categoryCount}>
            <Text style={styles.categoryCountText}>
              {categories.length} categories
            </Text>
          </View>
        </View>

        {isLoadingSummary ? (
          <Text style={styles.statusText}>Loading spending summary...</Text>
        ) : summaryError ? (
          <Text accessibilityRole="alert" style={styles.statusText}>
            {summaryError}
          </Text>
        ) : categories.length === 0 ? (
          <Text style={styles.statusText}>No saved debit transactions yet.</Text>
        ) : (
          <View style={styles.categories}>
            {categories.map((category, index) => {
              const color = categoryColors[index % categoryColors.length];
              return (
                <View key={category.category} style={styles.category}>
                  <View style={styles.categoryHeading}>
                    <View style={styles.categoryNameWrap}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: color },
                        ]}
                      />
                      <Text numberOfLines={1} style={styles.categoryName}>
                        {category.category}
                      </Text>
                    </View>
                    <Text style={styles.categoryAmount}>
                      {formatINR(category.amount, true)}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: color,
                          width: largestCategory
                            ? `${(category.amount / largestCategory) * 100}%`
                            : "0%",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.subsectionTitle}>By payment app</Text>
        {paymentApps.length ? (
          paymentApps.map((item) => (
            <View key={item.paymentApp} style={styles.paymentAppRow}>
              <Text numberOfLines={1} style={styles.categoryName}>
                {item.paymentApp}
              </Text>
              <Text style={styles.categoryAmount}>{formatINR(item.amount, true)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.statusText}>No payment-app details available.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 27,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 13,
  },
  title: {
    color: SpendTrackColors.text,
    fontSize: 17,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 3,
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  periodText: {
    color: SpendTrackColors.text,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  card: {
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderRadius: 21,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: SpendTrackColors.border,
  },
  totalLabel: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  totalAmount: {
    color: SpendTrackColors.text,
    fontSize: 21,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.5,
    marginTop: 3,
  },
  categoryCount: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  categoryCountText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  categories: {
    gap: 14,
    paddingTop: 16,
  },
  statusText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    paddingVertical: 16,
  },
  subsectionTitle: {
    color: SpendTrackColors.text,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
  },
  paymentAppRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  category: {
    gap: 7,
  },
  categoryHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  categoryName: {
    flexShrink: 1,
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  categoryAmount: {
    color: SpendTrackColors.text,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  track: {
    width: "100%",
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
});
