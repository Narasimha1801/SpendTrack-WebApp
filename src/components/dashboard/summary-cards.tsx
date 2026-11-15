import { StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { formatINR } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";

type SummaryCardProps = {
  title: string;
  amount: number | null;
  supportingText: string;
  kind: "income" | "expense";
};

function SummaryCard({
  title,
  amount,
  supportingText,
  kind,
}: SummaryCardProps) {
  const isIncome = kind === "income";
  const accentColor = isIncome
    ? SpendTrackColors.positive
    : SpendTrackColors.negative;

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View
          style={[
            styles.iconWrap,
            isIncome ? styles.incomeIconWrap : styles.expenseIconWrap,
          ]}
        >
          <AppIcon
            name={
              isIncome
                ? {
                    ios: "arrow.up.right",
                    android: "north_east",
                    web: "north_east",
                  }
                : {
                    ios: "arrow.down.left",
                    android: "south_west",
                    web: "south_west",
                  }
            }
            size={16}
            color={accentColor}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.amount}>
        {amount === null ? "—" : formatINR(amount, true)}
      </Text>
      <Text style={[styles.supportingText, { color: accentColor }]}>
        {isIncome && <Text style={styles.indicator}>● </Text>}
        {supportingText}
      </Text>
    </View>
  );
}

type SummaryCardsProps = {
  income: number | null;
  expenses: number | null;
  incomeChange: string;
};

export default function SummaryCards({
  income,
  expenses,
  incomeChange,
}: SummaryCardsProps) {
  return (
    <View style={styles.row}>
      <SummaryCard
        title="Total credits"
        amount={income}
        supportingText={incomeChange}
        kind="income"
      />
      <SummaryCard
        title="Total debits"
        amount={expenses}
        supportingText={incomeChange}
        kind="expense"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 27,
  },
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 129,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  incomeIconWrap: {
    backgroundColor: SpendTrackColors.positiveSurface,
  },
  expenseIconWrap: {
    backgroundColor: SpendTrackColors.negativeSurface,
  },
  title: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  amount: {
    color: SpendTrackColors.text,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.5,
    marginTop: 11,
  },
  supportingText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
    marginTop: 4,
  },
  indicator: {
    fontSize: 8,
  },
});
