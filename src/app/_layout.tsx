import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { SnackbarProvider } from "@/contexts/snackbar-context";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TransactionsProvider } from "@/contexts/transactions-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SnackbarProvider>
        <TransactionsProvider>
          <ThemeProvider value={DefaultTheme}>
            <AnimatedSplashOverlay />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: SpendTrackColors.background },
              }}
            />
          </ThemeProvider>
        </TransactionsProvider>
      </SnackbarProvider>
    </SafeAreaProvider>
  );
}
