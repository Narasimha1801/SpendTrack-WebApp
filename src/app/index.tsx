import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useEffect, useState, useSyncExternalStore } from "react";

import PasswordInput from "@/components/ui/password-input";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useSnackbar } from "@/contexts/snackbar-context";
import { checkBackend, checkDatabase, login } from "@/services/api";

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z"
      />
      <Path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.83-.87 6.44-2.35l-3.14-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.73 9.73 0 0 0 12 21.75Z"
      />
      <Path
        fill="#FBBC05"
        d="M6.53 13.84a5.84 5.84 0 0 1 0-3.68V7.63H3.28a9.75 9.75 0 0 0 0 8.74l3.25-2.53Z"
      />
      <Path
        fill="#EA4335"
        d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.27 14.63 2.25 12 2.25a9.73 9.73 0 0 0-8.72 5.38l3.25 2.53C7.3 7.85 9.46 6.13 12 6.13Z"
      />
    </Svg>
  );
}

function PhoneLogo({ selected }: { selected: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={selected ? SpendTrackColors.white : SpendTrackColors.text}
        d="M6.62 2.5h2.1c.54 0 1.02.35 1.18.87l1.02 3.34c.14.46 0 .97-.36 1.3L9.2 9.33a14.8 14.8 0 0 0 5.47 5.47l1.32-1.36c.33-.36.84-.5 1.3-.36l3.34 1.02c.52.16.87.64.87 1.18v2.1c0 .66-.54 1.2-1.2 1.2C10.75 18.58 5.42 13.25 5.42 6.7c0-.66.54-1.2 1.2-1.2Z"
      />
    </Svg>
  );
}

const subscribeToNothing = () => () => {};

export default function LoginScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const isMounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [pressedProvider, setPressedProvider] = useState<
    "Google" | "Phone" | null
  >(null);
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking");
  const [databaseStatus, setDatabaseStatus] = useState<"checking" | "connected" | "failed">("checking");

  useEffect(() => {
    let active = true;

    checkBackend()
      .then(() => {
        if (active) {
          setConnectionStatus("connected");
        }
      })
      .catch(() => {
        if (active) {
          setConnectionStatus("failed");
        }
      });

    checkDatabase()
      .then(() => {
        if (active) {
          setDatabaseStatus("connected");
        }
      })
      .catch(() => {
        if (active) {
          setDatabaseStatus("failed");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (fontError) {
    throw fontError;
  }

  if (!isMounted || !fontsLoaded) {
    return null;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showSnackbar({
        variant: "error",
        message: "Please enter your email address and password.",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      await login(email.trim(), password);
      showSnackbar({ variant: "success", message: "Signed in successfully." });
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in right now.";
      showSnackbar({
        variant: "error",
        message: /invalid email or password/i.test(message)
          ? "Incorrect email or password. Please try again."
          : `Login failed: ${message}`,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/reset-password");
  };

  const handleSocialLogin = (provider: "Google" | "Phone") => {
    showSnackbar({
      variant: "info",
      message: `${provider} sign-in is not connected yet.`,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Login form */}
        <View style={styles.form}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>

          <Text style={styles.description}>
            Sign in to manage your finances in one place.
          </Text>

          <View style={styles.connectionCard}>
            <Text style={styles.connectionTitle}>Backend connection</Text>
            <Text style={styles.connectionText}>
              API: {connectionStatus === "connected" ? "Connected" : connectionStatus === "failed" ? "Unavailable" : "Checking..."}
            </Text>
            <Text style={styles.connectionText}>
              Database: {databaseStatus === "connected" ? "Connected" : databaseStatus === "failed" ? "Unavailable" : "Checking..."}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#969696"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>

            <PasswordInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#969696"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="off"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Glossy black button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoggingIn && styles.disabledButton]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoggingIn}
          >
            <View style={styles.buttonHighlight} />
            <Text style={styles.loginText}>{isLoggingIn ? "Signing in..." : "Login"}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                pressedProvider === "Google" && styles.selectedSocialButton,
              ]}
              onPress={() => handleSocialLogin("Google")}
              onPressIn={() => setPressedProvider("Google")}
              onPressOut={() => setPressedProvider(null)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.socialIconColumn}>
                  <GoogleLogo />
                </View>
                <Text
                  style={[
                    styles.socialButtonText,
                    pressedProvider === "Google" &&
                      styles.selectedSocialButtonText,
                  ]}
                >
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                pressedProvider === "Phone" && styles.selectedSocialButton,
              ]}
              onPress={() => handleSocialLogin("Phone")}
              onPressIn={() => setPressedProvider("Phone")}
              onPressOut={() => setPressedProvider(null)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Continue with phone"
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.socialIconColumn}>
                  <PhoneLogo selected={pressedProvider === "Phone"} />
                </View>
                <Text
                  style={[
                    styles.socialButtonText,
                    pressedProvider === "Phone" &&
                      styles.selectedSocialButtonText,
                  ]}
                >
                  Continue with phone
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Need an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your finances, all in one place.
            </Text>
          </View>
        </View>

        <Text style={styles.demoNote}>
          Secure sign-in powered by SpendTrack API
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 18,
  },

  form: {
    width: "100%",
  },

  welcomeTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 25,
    color: SpendTrackColors.text,
    letterSpacing: -0.5,
  },

  description: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 13,
    lineHeight: 21,
    color: SpendTrackColors.secondaryText,
    marginTop: 7,
    marginBottom: 20,
  },

  connectionCard: {
    backgroundColor: SpendTrackColors.positiveSurface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D1E4D7",
  },

  connectionTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 12,
    color: "#315F43",
    marginBottom: 3,
  },

  connectionText: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 11,
    color: "#477456",
    lineHeight: 17,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  label: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: SpendTrackColors.text,
    marginBottom: 9,
    marginLeft: 3,
  },

  input: {
    height: 54,
    backgroundColor: SpendTrackColors.glass,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    color: SpendTrackColors.text,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
    elevation: 1,
    shadowColor: "#789187",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -5,
    marginBottom: 18,
    paddingVertical: 4,
  },

  forgotText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 12,
    color: SpendTrackColors.darkSurface,
  },

  loginButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: SpendTrackColors.darkSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#456F67",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
  },

  disabledButton: {
    opacity: 0.65,
  },

  buttonHighlight: {
    position: "absolute",
    top: 1,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.35,
  },

  loginText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: SpendTrackColors.border,
    flex: 1,
  },

  dividerText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 9,
    letterSpacing: 1.2,
    color: SpendTrackColors.secondaryText,
    marginHorizontal: 13,
  },

  socialButtons: {
    gap: 12,
  },

  socialButton: {
    height: 54,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: SpendTrackColors.glass,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
    borderRadius: 15,
  },

  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },

  socialIconColumn: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  selectedSocialButton: {
    backgroundColor: SpendTrackColors.darkSurface,
    borderColor: SpendTrackColors.darkSurface,
  },

  selectedSocialButtonText: {
    color: "#FFFFFF",
  },

  guestIcon: {
    width: 21,
    height: 21,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  guestHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },

  guestBody: {
    width: 17,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  signupPrompt: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 13,
    color: SpendTrackColors.secondaryText,
  },

  signupLink: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: SpendTrackColors.darkSurface,
  },

  socialButtonText: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 13,
    color: SpendTrackColors.text,
    textAlign: "center",
  },

  footer: {
    alignItems: "center",
    paddingVertical: 6,
  },

  footerText: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 12,
    color: SpendTrackColors.secondaryText,
  },

  demoNote: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 10,
    color: SpendTrackColors.muted,
    textAlign: "center",
    marginTop: 14,
  },
});
