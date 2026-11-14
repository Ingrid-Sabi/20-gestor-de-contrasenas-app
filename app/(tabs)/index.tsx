import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  listCuentas,
  softDeleteCuenta,
  type CuentaRow,
} from "@/repositories/cuentaRepository";
import { decryptSecret } from "@/services/crypto";
import { getMasterKey } from "@/services/vaultSession";
import { copyWithAutoClear } from "@/services/clipboard";

export default function CuentasScreen() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<CuentaRow[]>([]);

  const load = useCallback(async () => {
    const rows = await listCuentas();
    setCuentas(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function handleCopy(item: CuentaRow) {
    const key = getMasterKey();
    if (!key) {
      router.replace("/bloqueo");
      return;
    }
    const plain = await decryptSecret(item.clave_cifrada, item.iv, key);
    await copyWithAutoClear(plain, 30000);
    Alert.alert("Copiada", "La clave se borrará del portapapeles en 30 s.");
  }

  async function handleDelete(id: number) {
    await softDeleteCuenta(id);
    await load();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cuentas}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay cuentas guardadas.</Text>
        }
        renderItem={({ item }) => {
          const longPress = Gesture.LongPress().onStart(() => {
            void handleCopy(item);
          });
          return (
            <GestureDetector gesture={longPress}>
              <View style={styles.card}>
                <Pressable onPress={() => router.push(`/cuenta/${item.id}`)}>
                  <Text style={styles.site}>{item.sitio}</Text>
                  <Text style={styles.user}>{item.usuario}</Text>
                </Pressable>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => void handleCopy(item)}
                    accessibilityLabel={`Copiar clave de ${item.sitio}`}
                  >
                    <Text style={styles.link}>Copiar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleDelete(item.id)}
                    accessibilityLabel={`Eliminar cuenta ${item.sitio}`}
                  >
                    <Text style={styles.danger}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </GestureDetector>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: "center", marginTop: 32, color: "#6b7280" },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  site: { fontSize: 16, fontWeight: "700" },
  user: { color: "#4b5563", marginTop: 2 },
  actions: { flexDirection: "row", gap: 16, marginTop: 10 },
  link: { color: "#2563eb", fontWeight: "600" },
  danger: { color: "#dc2626", fontWeight: "600" },
});
