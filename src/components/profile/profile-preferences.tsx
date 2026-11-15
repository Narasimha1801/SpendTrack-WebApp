import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useSnackbar } from "@/contexts/snackbar-context";
import {
  clearAuthToken,
  clearAuthUserId,
} from "@/services/auth-token";
import { useTransactions } from "@/contexts/transactions-context";

const preferenceItems = [
  {
    title: "Notifications",
    description: "Manage reminders and account updates",
    icon: { ios: "bell", android: "notifications_none", web: "notifications_none" },
  },
  {
    title: "Security",
    description: "Password and sign-in options",
    icon: { ios: "lock.shield", android: "shield", web: "shield" },
  },
  {
    title: "Privacy",
    description: "Your data and privacy controls",
    icon: { ios: "hand.raised", android: "privacy_tip", web: "privacy_tip" },
  },
  {
    title: "Help & Support",
    description: "Get help with your account",
    icon: { ios: "questionmark.circle", android: "help_outline", web: "help_outline" },
  },
  {
    title: "About SpendTrack",
    description: "Version 1.0.0",
    icon: { ios: "info.circle", android: "info", web: "info" },
  },
] as const;

export default function ProfilePreferences() {
  const { showSnackbar } = useSnackbar();
  const { clearTransactionState } = useTransactions();

  const handleLogout = async () => {
    try {
      await Promise.all([clearAuthToken(), clearAuthUserId()]);
      clearTransactionState();
      showSnackbar({ variant: "success", message: "Signed out successfully." });
      router.replace("/");
    } catch (error) {
      showSnackbar({
        variant: "error",
        message:
          error instanceof Error
            ? `Logout failed: ${error.message}`
            : "Unable to sign out right now.",
      });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.card}>
        {preferenceItems.map((item, index) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, coming soon`}
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.row, index > 0 && styles.rowWithBorder]}
          >
            <View style={styles.iconWrap}>
              <AppIcon
                name={item.icon}
                size={17}
                color={SpendTrackColors.secondaryText}
              />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.description}>
                {item.description}
              </Text>
            </View>
            <AppIcon
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              size={17}
              color={SpendTrackColors.muted}
            />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log out"
        onPress={() => void handleLogout()}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
      >
        <AppIcon
          name={{
            ios: "rectangle.portrait.and.arrow.right",
            android: "logout",
            web: "logout",
          }}
          size={18}
          color={SpendTrackColors.negative}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    color: SpendTrackColors.text,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.2,
    marginBottom: 11,
  },
  card: {
    paddingHorizontal: 15,
    borderRadius: 21,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  row: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  rowWithBorder: {
    borderTopWidth: 1,
    borderTopColor: SpendTrackColors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  description: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 3,
  },
  logoutButton: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 17,
    borderRadius: 16,
    backgroundColor: SpendTrackColors.negativeSurface,
  },
  logoutText: {
    color: SpendTrackColors.negative,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  pressed: {
    opacity: 0.72,
  },
});
