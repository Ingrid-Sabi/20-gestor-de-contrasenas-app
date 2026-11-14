import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { lockVault } from "@/services/vaultSession";

export default function AjustesScreen() {
  const router = useRouter();

  function handleLock() {
    lockVault();
    router.replace("/bloqueo");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguridad y auto-bloqueo</Text>
      <Text style={styles.desc}>
        La bóveda se bloquea automáticamente al pasar la app a segundo plano.
      </Text>
      <Pressable
        style={styles.button}
        onPress={handleLock}
        accessibilityLabel="Bloquear bóveda ahora"
      >
        <Text style={styles.buttonText}>Bloquear ahora</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  desc: { color: "#4b5563" },
  button: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
