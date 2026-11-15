import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";

import { SpendTrackColors } from "@/constants/spend-track-colors";

export type AppIconName = ComponentProps<typeof SymbolView>["name"];

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export default function AppIcon({
  name,
  size = 20,
  color = SpendTrackColors.text,
}: AppIconProps) {
  return (
    <SymbolView
      name={name}
      tintColor={color}
      style={{ width: size, height: size }}
    />
  );
}
