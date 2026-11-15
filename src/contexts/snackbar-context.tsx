import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppIcon from "@/components/ui/app-icon";
import type { AppIconName } from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";

export type SnackbarVariant = "success" | "error" | "info" | "warning";

export type SnackbarOptions = {
  variant: SnackbarVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type SnackbarMessage = SnackbarOptions & {
  id: number;
  isDismissing: boolean;
  dismissAnimationMs: number;
};

type SnackbarContextValue = {
  showSnackbar: (options: SnackbarOptions) => void;
};

const snackbarDismissAnimationMs = 180;

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

function SnackbarHost({
  message,
  onDismiss,
  onAction,
}: {
  message: SnackbarMessage;
  onDismiss: (id: number) => void;
  onAction: () => void;
}) {
  const [progress] = useState(() => new Animated.Value(0));
  const notificationStyle = {
    success: {
      backgroundColor: "rgba(235, 246, 239, 0.97)",
      borderColor: "#D1E5D7",
      iconColor: SpendTrackColors.positive,
      iconBackgroundColor: "#DDEFE3",
      textColor: "#315F43",
    },
    error: {
      backgroundColor: "rgba(251, 239, 237, 0.98)",
      borderColor: "#ECD7D3",
      iconColor: SpendTrackColors.negative,
      iconBackgroundColor: "#F5E1DE",
      textColor: "#75423E",
    },
    info: {
      backgroundColor: "rgba(237, 244, 249, 0.98)",
      borderColor: "#D7E4ED",
      iconColor: SpendTrackColors.info,
      iconBackgroundColor: "#DFEBF4",
      textColor: "#3E5F79",
    },
    warning: {
      backgroundColor: "rgba(251, 245, 230, 0.98)",
      borderColor: "#EDE2C5",
      iconColor: SpendTrackColors.warning,
      iconBackgroundColor: "#F3E9CE",
      textColor: "#735A2F",
    },
  }[message.variant];
  const iconNames: Record<SnackbarVariant, AppIconName> = {
    success: {
      ios: "checkmark.circle.fill",
      android: "check_circle",
      web: "check_circle",
    },
    error: {
      ios: "exclamationmark.circle.fill",
      android: "error",
      web: "error",
    },
    info: {
      ios: "info.circle.fill",
      android: "info",
      web: "info",
    },
    warning: {
      ios: "exclamationmark.triangle.fill",
      android: "warning",
      web: "warning",
    },
  };
  const iconName = iconNames[message.variant];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: message.isDismissing ? 0 : 1,
      duration: message.isDismissing
        ? message.dismissAnimationMs
        : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [message.dismissAnimationMs, message.isDismissing, progress]);

  const animatedStyle = {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.overlay, animatedStyle]}
    >
      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={styles.safeArea}
      >
        <Animated.View
          accessibilityRole={message.variant === "error" ? "alert" : "summary"}
          accessibilityLiveRegion={
            message.variant === "error" ? "assertive" : "polite"
          }
          style={[
            styles.snackbar,
            {
              backgroundColor: notificationStyle.backgroundColor,
              borderColor: notificationStyle.borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: notificationStyle.iconBackgroundColor },
            ]}
          >
            <AppIcon
              name={iconName}
              size={17}
              color={notificationStyle.iconColor}
            />
          </View>
          <Text style={[styles.message, { color: notificationStyle.textColor }]}>
            {message.message}
          </Text>
          {message.actionLabel ? (
            <Pressable
              accessibilityRole="button"
              onPress={onAction}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.actionText, { color: notificationStyle.textColor }]}
              >
                {message.actionLabel}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            hitSlop={8}
            onPress={() => onDismiss(message.id)}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name={{ ios: "xmark", android: "close", web: "close" }}
              size={17}
              color={notificationStyle.textColor}
            />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMessageRef = useRef<SnackbarMessage | null>(null);
  const idRef = useRef(0);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      latestMessageRef.current = null;
    },
    [],
  );

  const dismissSnackbar = useCallback(
    (expectedId?: number, animationDurationMs = snackbarDismissAnimationMs) => {
      const current = latestMessageRef.current;
      if (!current || (expectedId !== undefined && current.id !== expectedId)) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }

      const dismissingMessage = {
        ...current,
        isDismissing: true,
        dismissAnimationMs: animationDurationMs,
      };
      latestMessageRef.current = dismissingMessage;
      setMessage(dismissingMessage);
      dismissTimeoutRef.current = setTimeout(() => {
        if (latestMessageRef.current?.id === current.id) {
          latestMessageRef.current = null;
          setMessage(null);
        }
        dismissTimeoutRef.current = null;
      }, animationDurationMs);
    },
    [],
  );

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }

    const id = idRef.current + 1;
    idRef.current = id;
    const nextMessage = {
      ...options,
      id,
      isDismissing: false,
      dismissAnimationMs: snackbarDismissAnimationMs,
    };
    latestMessageRef.current = nextMessage;
    setMessage(nextMessage);

    const durationMs = options.durationMs ?? 5000;
    if (durationMs > 0) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        dismissSnackbar(
          id,
          Math.min(snackbarDismissAnimationMs, durationMs),
        );
      }, Math.max(0, durationMs - snackbarDismissAnimationMs));
    }
  }, [dismissSnackbar]);

  const handleAction = useCallback(() => {
    const action = message?.onAction;
    dismissSnackbar(message?.id);
    action?.();
  }, [dismissSnackbar, message]);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {message ? (
          <SnackbarHost
            key={message.id}
            message={message}
            onDismiss={dismissSnackbar}
            onAction={handleAction}
          />
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider.");
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  snackbar: {
    width: "100%",
    maxWidth: 430,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#72887E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  actionButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
