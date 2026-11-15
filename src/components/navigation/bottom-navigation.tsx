import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon from "@/components/ui/app-icon";
import type { AppIconName } from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";

type NavigationItem = {
  label: string;
  path: "/dashboard" | "/spending" | "/history" | "/profile";
  icon: AppIconName;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: { ios: "square.grid.2x2.fill", android: "dashboard", web: "dashboard" },
  },
  {
    label: "Spending",
    path: "/spending",
    icon: { ios: "chart.pie.fill", android: "pie_chart", web: "pie_chart" },
  },
  {
    label: "History",
    path: "/history",
    icon: { ios: "clock.arrow.circlepath", android: "history", web: "history" },
  },
  {
    label: "Profile",
    path: "/profile",
    icon: { ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" },
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {navigationItems.map((item) => {
          const isActive = item.path === pathname;

          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                router.replace(item.path);
              }}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  isActive && styles.activeIconWrap,
                ]}
              >
                <AppIcon
                  name={item.icon}
                  size={20}
                  color={isActive ? SpendTrackColors.darkSurface : SpendTrackColors.secondaryText}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                ]}
              >
                {item.label}
              </Text>
              <View
                style={[
                  styles.activeIndicator,
                  isActive && styles.activeIndicatorVisible,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  bar: {
    width: "100%",
    maxWidth: 460,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 28,
    backgroundColor: SpendTrackColors.glass,
    borderWidth: 1,
    borderColor: SpendTrackColors.glassBorder,
    shadowColor: "#789187",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 22,
  },
  iconWrap: {
    width: 34,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  activeIconWrap: {
    backgroundColor: SpendTrackColors.secondarySurface,
  },
  label: {
    color: SpendTrackColors.secondaryText,
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
    letterSpacing: 0.05,
  },
  activeLabel: {
    color: SpendTrackColors.darkSurface,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 1,
  },
  activeIndicatorVisible: {
    backgroundColor: SpendTrackColors.darkSurface,
  },
  pressed: {
    opacity: 0.74,
  },
});
