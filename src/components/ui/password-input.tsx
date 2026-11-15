import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

import AppIcon from "@/components/ui/app-icon";
import { SpendTrackColors } from "@/constants/spend-track-colors";

export default function PasswordInput(props: TextInputProps) {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[props.style, styles.input]}
        secureTextEntry={isHidden}
      />
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setIsHidden((hidden) => !hidden)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isHidden ? "Show password" : "Hide password"}
        accessibilityState={{ selected: !isHidden }}
        hitSlop={8}
      >
        <AppIcon
          name={
            isHidden
              ? { ios: "eye", android: "visibility", web: "visibility" }
              : {
                  ios: "eye.slash",
                  android: "visibility_off",
                  web: "visibility_off",
                }
          }
          size={20}
          color={SpendTrackColors.secondaryText}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    paddingRight: 52,
  },
  toggle: {
    position: "absolute",
    top: 0,
    right: 12,
    bottom: 0,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
