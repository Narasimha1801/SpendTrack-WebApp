import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { formatINR } from "@/constants/mock-data";
import { SpendTrackColors } from "@/constants/spend-track-colors";

type BalanceCardProps = {
  netFlow: number | null;
};

export default function BalanceCard({ netFlow }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.glow} />
      <View pointerEvents="none" style={styles.orbit} />
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Net transaction flow</Text>
          <Text style={styles.supportingLabel}>Credits minus debits</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Hide balance" : "Show balance"}
          accessibilityState={{ selected: isVisible }}
          hitSlop={8}
          onPress={() => setIsVisible((visible) => !visible)}
          style={({ pressed }) => [
            styles.visibilityButton,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            name={
              isVisible
                ? { ios: "eye", android: "visibility", web: "visibility" }
                : {
                    ios: "eye.slash",
                    android: "visibility_off",
                    web: "visibility_off",
                  }
            }
            size={20}
            color={SpendTrackColors.darkSurface}
          />
        </Pressable>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.amount}>
        {netFlow === null
          ? "—"
          : isVisible
            ? formatINR(netFlow, true)
            : "₹ ••••••"}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.balanceStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Saved transactions</Text>
        </View>
        <AppIcon
          name={{
            ios: "arrow.up.right",
            android: "north_east",
            web: "north_east",
          }}
          size={18}
          color={SpendTrackColors.darkSurface}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    minHeight: 176,
    padding: 22,
    borderRadius: 25,
    backgroundColor: "#E8F0EC",
    borderWidth: 1,
    borderColor: "#DCE8E1",
    marginBottom: 14,
    shadowColor: "#789187",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  glow: {
    position: "absolute",
    width: 190,
    height: 190,
    right: -54,
    top: -105,
    borderRadius: 95,
    backgroundColor: "#FFFFFF",
    opacity: 0.52,
  },
  orbit: {
    position: "absolute",
    width: 135,
    height: 135,
    right: -42,
    bottom: -96,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "#BFD2C8",
    opacity: 0.72,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    color: SpendTrackColors.text,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  supportingLabel: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 4,
  },
  visibilityButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  amount: {
    color: SpendTrackColors.text,
    fontSize: 31,
    lineHeight: 42,
    letterSpacing: -1,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 18,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
  },
  balanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SpendTrackColors.positive,
  },
  statusText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  pressed: {
    opacity: 0.72,
  },
});
