import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";

type DashboardHeaderProps = {
  firstName: string;
};

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.greeting}>Good morning, {firstName}</Text>
        <Text style={styles.subtitle}>Here&apos;s your financial overview.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications coming soon"
        disabled
        style={styles.notificationButton}
      >
        <AppIcon
          name={{
            ios: "bell",
            android: "notifications_none",
            web: "notifications_none",
          }}
          size={21}
          color={SpendTrackColors.text}
        />
        <View style={styles.notificationDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  copy: {
    flex: 1,
  },
  greeting: {
    color: SpendTrackColors.text,
    fontSize: 20,
    lineHeight: 27,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B76560",
    borderWidth: 1,
    borderColor: SpendTrackColors.card,
  },
});
