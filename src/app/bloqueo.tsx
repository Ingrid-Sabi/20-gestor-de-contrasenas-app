import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { deriveMasterKey } from "@/services/crypto";
import { setMasterKey } from "@/services/vaultSession";

export default function BloqueoScreen() {
  const router = useRouter();
  const [masterPassword, setMasterPassword] = useState("");

  async function handleUnlock() {
    if (masterPassword.length < 10) {
      Alert.alert(
        "Clave inválida",
        "La clave maestra debe tener al menos 10 caracteres."
      );
      return;
    }
    const key = await deriveMasterKey(masterPassword);
    setMasterKey(key);
    setMasterPassword("");
    router.replace("/(tabs)");
  }

  async function handleBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        "Biometría no disponible",
        "Usa tu clave maestra para desbloquear."
      );
      return;
    }
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquear bóveda",
    });
    if (res.success) {
      const key = await deriveMasterKey("biometric-session-key");
      setMasterKey(key);
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bóveda de contraseñas</Text>
      <TextInput
        style={styles.input}
        placeholder="Clave maestra (mín. 10 caracteres)"
        secureTextEntry
        value={masterPassword}
        onChangeText={setMasterPassword}
        accessibilityLabel="Clave maestra"
      />
      <Pressable
        style={styles.button}
        onPress={() => void handleUnlock()}
        accessibilityLabel="Desbloquear con clave maestra"
      >
        <Text style={styles.buttonText}>Desbloquear</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => void handleBiometric()}
        accessibilityLabel="Desbloquear con biometría"
      >
        <Text style={styles.buttonText}>Usar biometría</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  button: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: { backgroundColor: "#374151" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
