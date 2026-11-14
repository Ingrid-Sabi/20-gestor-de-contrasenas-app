import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { lockVault } from "@/services/vaultSession";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        lockVault();
        router.replace("/bloqueo");
      }
    });
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="bloqueo"
          options={{ title: "Desbloquear bóveda" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="cuenta/[id]"
          options={{ title: "Detalle de cuenta" }}
        />
        <Stack.Screen name="ajustes" options={{ title: "Ajustes" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
