import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

import BottomNavigation from "@/components/navigation/bottom-navigation";
import { SpendTrackColors } from "@/constants/spend-track-colors";

export default function MainLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView
      edges={["top", "right", "bottom", "left"]}
      style={styles.safeArea}
    >
      <View style={styles.content}>
        <Slot />
        <BottomNavigation />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },
  content: {
    flex: 1,
  },
});
