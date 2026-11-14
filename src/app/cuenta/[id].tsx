import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCuentaById, type CuentaRow } from "@/repositories/cuentaRepository";
import { decryptSecret } from "@/services/crypto";
import { getMasterKey } from "@/services/vaultSession";
import { copyWithAutoClear } from "@/services/clipboard";

export default function CuentaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cuenta, setCuenta] = useState<CuentaRow | null>(null);
  const [plainPassword, setPlainPassword] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function load() {
      const key = getMasterKey();
      if (!key) {
        router.replace("/bloqueo");
        return;
      }
      const row = await getCuentaById(Number(id));
      if (!row) return;
      setCuenta(row);
      const dec = await decryptSecret(row.clave_cifrada, row.iv, key);
      setPlainPassword(dec);
    }
    void load();
  }, [id, router]);

  if (!cuenta) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cuenta.sitio}</Text>
      <Text style={styles.subtitle}>{cuenta.usuario}</Text>
      <Text style={styles.secret}>
        {revealed ? plainPassword : "••••••••••••"}
      </Text>
      <Pressable
        style={styles.button}
        onPressIn={() => setRevealed(true)}
        onPressOut={() => setRevealed(false)}
        accessibilityLabel="Mantener presionado para ver clave"
      >
        <Text style={styles.buttonText}>Mantener para ver</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => setRevealed((v) => !v)}
        accessibilityLabel="Alternar visibilidad de clave"
      >
        <Text style={styles.buttonText}>
          {revealed ? "Ocultar" : "Mostrar"}
        </Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => void copyWithAutoClear(plainPassword, 30000)}
        accessibilityLabel="Copiar clave"
      >
        <Text style={styles.buttonText}>Copiar (30 s)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#4b5563" },
  secret: {
    fontSize: 18,
    padding: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
