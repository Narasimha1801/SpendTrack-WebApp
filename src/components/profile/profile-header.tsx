import { StyleSheet, Text, View } from "react-native";

import { SpendTrackColors } from "@/constants/spend-track-colors";
import type { AuthenticatedProfile } from "@/services/api";

type ProfileHeaderProps = {
  user: AuthenticatedProfile;
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials = displayName
    ? displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
    : user.email.charAt(0);

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{displayName || user.email}</Text>
      <Text numberOfLines={1} style={styles.email}>
        {user.email}
      </Text>
      <View style={styles.accountBadge}>
        <View style={styles.badgeDot} />
        <Text style={styles.accountType}>{user.accountType}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    backgroundColor: SpendTrackColors.darkSurface,
  },
  initials: {
    color: SpendTrackColors.white,
    fontSize: 24,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
  },
  name: {
    color: SpendTrackColors.text,
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.3,
    marginTop: 12,
  },
  email: {
    maxWidth: "100%",
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 3,
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SpendTrackColors.positive,
  },
  accountType: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
