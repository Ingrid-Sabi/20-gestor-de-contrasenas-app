import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  insertCuenta,
  listCuentas,
  softDeleteCuenta,
  type CuentaRow,
} from "@/repositories/cuentaRepository";
import { decryptSecret, encryptSecret } from "@/services/crypto";
import { getMasterKey } from "@/services/vaultSession";
import { copyWithAutoClear } from "@/services/clipboard";

export default function CuentasScreen() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<CuentaRow[]>([]);
  const [sitio, setSitio] = useState("");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

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

  async function handleAdd() {
    const key = getMasterKey();
    if (!key) {
      router.replace("/bloqueo");
      return;
    }
    if (!sitio.trim() || !usuario.trim() || !clave) {
      Alert.alert("Campos requeridos", "Completa sitio, usuario y clave.");
      return;
    }
    const enc = await encryptSecret(clave, key);
    await insertCuenta({
      sitio: sitio.trim(),
      usuario: usuario.trim(),
      clave_cifrada: enc.cipherText,
      iv: enc.iv,
      notas: null,
    });
    setSitio("");
    setUsuario("");
    setClave("");
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Sitio (ej. Gmail)"
          value={sitio}
          onChangeText={setSitio}
        />
        <TextInput
          style={styles.input}
          placeholder="Usuario / Correo"
          value={usuario}
          onChangeText={setUsuario}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={clave}
          onChangeText={setClave}
        />
        <Pressable
          style={styles.addBtn}
          onPress={() => void handleAdd()}
          accessibilityLabel="Guardar nueva cuenta"
        >
          <Text style={styles.addBtnText}>+ Guardar cuenta</Text>
        </Pressable>
      </View>
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
  form: { gap: 8, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
  },
  addBtn: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
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
