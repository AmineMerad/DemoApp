import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Montserrat_400Regular, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from "@expo-google-fonts/montserrat";
import "../global.css";

const stackScreenOptions = {
  headerShown: false,
} as const;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deposit" />
        <Stack.Screen name="rebalance" />
      </Stack>
    </>
  );
}