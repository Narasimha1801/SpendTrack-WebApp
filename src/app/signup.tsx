import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import PasswordInput from "@/components/ui/password-input";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { useSnackbar } from "@/contexts/snackbar-context";
import { signup } from "@/services/api";

export default function SignupScreen() {
  const { showSnackbar } = useSnackbar();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password
    ) {
      showSnackbar({
        variant: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const mobileValid = /^\d{10}$/.test(mobile);

    if (!emailValid) {
      showSnackbar({
        variant: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!mobileValid) {
      showSnackbar({
        variant: "error",
        message: "Enter a valid 10-digit mobile number.",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const result = await signup(
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        mobile.trim(),
        password,
      );
      showSnackbar({
        variant: "success",
        message: result.message || "Your account has been created.",
      });
    } catch (error) {
      showSnackbar({
        variant: "error",
        message:
          error instanceof Error
            ? `Signup failed: ${error.message}`
            : "Unable to create your account right now.",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: "default" | "email-address" | "phone-pad" = "default",
    secureTextEntry = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {secureTextEntry ? (
        <PasswordInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8A8A8A"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8A8A8A"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          autoCorrect={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Brand */}
            <View style={styles.header}>
              <Text style={styles.logo}>SpendTrack.</Text>
              <Text style={styles.tagline}>
                Track. Analyze. Stay in Control.
              </Text>
            </View>

            {/* Heading */}
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subtitle}>
                Let&apos;s get to know you. Enter your details below.
              </Text>
            </View>

            {/* Signup Form */}
            <View style={styles.form}>
              {renderInput(
                "First Name",
                "Enter your first name",
                firstName,
                setFirstName,
              )}

              {renderInput(
                "Last Name",
                "Enter your last name",
                lastName,
                setLastName,
              )}

              {renderInput(
                "Email Address",
                "Enter your email address",
                email,
                setEmail,
                "email-address",
              )}

              {renderInput(
                "Password",
                "Create a password",
                password,
                setPassword,
                "default",
                true,
              )}

              {renderInput(
                "Mobile Number",
                "Enter your 10-digit mobile number",
                mobile,
                setMobile,
                "phone-pad",
              )}

              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isSigningUp && styles.disabledButton,
                ]}
                activeOpacity={0.85}
                onPress={handleSignup}
                disabled={isSigningUp}
              >
                <Text style={styles.signupButtonText}>
                  {isSigningUp ? "Creating account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Navigation */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bottomText}>
              Your finances, all in one place.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingVertical: 35,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 38,
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: SpendTrackColors.text,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 13,
    color: SpendTrackColors.secondaryText,
    marginTop: 7,
    letterSpacing: 0.3,
  },
  headingContainer: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    color: SpendTrackColors.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14,
    color: SpendTrackColors.secondaryText,
    marginTop: 8,
    lineHeight: 21,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 17,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: SpendTrackColors.text,
    marginBottom: 9,
  },
  input: {
    height: 55,
    backgroundColor: SpendTrackColors.glass,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
    borderRadius: 15,
    paddingHorizontal: 17,
    fontSize: 15,
    color: SpendTrackColors.text,
    shadowColor: "#789187",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.025,
    shadowRadius: 5,
    elevation: 1,
  },
  signupButton: {
    height: 56,
    backgroundColor: SpendTrackColors.darkSurface,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#456F67",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
    elevation: 5,
  },
  signupButtonText: {
    color: SpendTrackColors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: SpendTrackColors.secondaryText,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "700",
    color: SpendTrackColors.darkSurface,
  },
  bottomText: {
    textAlign: "center",
    fontSize: 12,
    color: SpendTrackColors.muted,
    marginTop: 35,
  },
});
