import { StyleSheet, Text, View } from "react-native";

import AppIcon, { type AppIconName } from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import type { AuthenticatedProfile } from "@/services/api";

type PersonalInformationProps = {
  user: AuthenticatedProfile;
};

type InformationRow = { label: string; value: string; icon: AppIconName };

export default function PersonalInformation({
  user,
}: PersonalInformationProps) {
  const informationRows: InformationRow[] = [
    ...(user.firstName
      ? [
          {
            label: "First Name",
            value: user.firstName,
            icon: { ios: "person", android: "person", web: "person" } as const,
          },
        ]
      : []),
    ...(user.lastName
      ? [
          {
            label: "Last Name",
            value: user.lastName,
            icon: { ios: "person", android: "person", web: "person" } as const,
          },
        ]
      : []),
    {
      label: "Email Address",
      value: user.email,
      icon: { ios: "envelope", android: "mail", web: "mail" } as const,
    },
    ...(user.mobileNumber
      ? [
          {
            label: "Mobile Number",
            value: user.mobileNumber,
            icon: { ios: "phone", android: "call", web: "call" } as const,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.card}>
        {informationRows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index > 0 && styles.rowWithBorder]}
          >
            <View style={styles.iconWrap}>
              <AppIcon
                name={row.icon}
                size={17}
                color={SpendTrackColors.secondaryText}
              />
            </View>
            <View style={styles.valueWrap}>
              <Text style={styles.label}>{row.label}</Text>
              <Text numberOfLines={1} style={styles.value}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
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
  valueWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  value: {
    color: SpendTrackColors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
