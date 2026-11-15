import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
const subscribeToNothing = () => () => {};

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  return useSyncExternalStore(
    subscribeToNothing,
    () => colorScheme,
    () => 'light',
  );
}
