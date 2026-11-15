import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import PersonalInformation from "@/components/profile/personal-information";
import ProfileHeader from "@/components/profile/profile-header";
import ProfilePreferences from "@/components/profile/profile-preferences";
import { SpendTrackColors } from "@/constants/spend-track-colors";
import { getProfile, type AuthenticatedProfile } from "@/services/api";

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthenticatedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const profile = await getProfile();
    return {
      ...profile,
      accountType: profile.accountType ?? "Personal Account",
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadProfile()
      .then((profile) => {
        if (active) {
          setUser(profile);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your profile.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loadProfile]);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setUser(await loadProfile());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profile</Text>
        {isLoading ? (
          <View style={styles.messageCard}>
            <ActivityIndicator color={SpendTrackColors.darkSurface} />
            <Text style={styles.messageText}>Loading your profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorTitle}>Profile unavailable</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleRetry()}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : user ? (
          <>
            <ProfileHeader user={user} />
            <PersonalInformation user={user} />
            <ProfilePreferences />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SpendTrackColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  pageTitle: {
    color: SpendTrackColors.text,
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  messageCard: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    borderRadius: 22,
    backgroundColor: SpendTrackColors.card,
    borderWidth: 1,
    borderColor: SpendTrackColors.border,
  },
  messageText: {
    color: SpendTrackColors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: 10,
  },
  errorTitle: {
    color: SpendTrackColors.text,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  retryButton: {
    minHeight: 42,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: SpendTrackColors.darkSurface,
  },
  retryText: {
    color: SpendTrackColors.white,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  pressed: {
    opacity: 0.75,
  },
});
