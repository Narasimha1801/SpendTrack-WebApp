import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useState } from "react";
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

import PasswordInput from "@/components/ui/password-input";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useSnackbar } from "@/contexts/snackbar-context";
import { resetPassword } from "@/services/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  const handleSubmit = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !newPassword) {
      showSnackbar({
        variant: "error",
        message: "Enter your email and new password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      showSnackbar({
        variant: "error",
        message: "Your new password must be at least 8 characters.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(normalizedEmail, newPassword);
      showSnackbar({
        variant: "success",
        message: result.message || "Your password was reset successfully.",
        actionLabel: "Go to login",
        onAction: () => router.replace("/"),
        durationMs: 0,
      });
    } catch (error) {
      showSnackbar({
        variant: "error",
        message:
          error instanceof Error
            ? `Password reset failed: ${error.message}`
            : "Unable to reset your password right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <View style={styles.form}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.description}>
            Enter your account email and choose a new password.
          </Text>

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
            <Text style={styles.label}>New password</Text>
            <PasswordInput
              style={styles.input}
              placeholder="Enter your new password"
              placeholderTextColor="#969696"
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? "Updating..." : "Reset password"}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 28,
  },
  form: {
    width: "100%",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 24,
  },
  backText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: SpendTrackColors.darkSurface,
  },
  title: {
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
    marginBottom: 24,
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
    elevation: 2,
    shadowColor: "#789187",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 4,
  },
  submitButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: SpendTrackColors.darkSurface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 8,
    shadowColor: "#456F67",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: SpendTrackColors.white,
    letterSpacing: 0.3,
  },
});
