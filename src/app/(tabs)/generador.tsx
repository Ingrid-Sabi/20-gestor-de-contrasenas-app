import { useState } from "react";
import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { evaluatePasswordStrength, generatePassword } from "@/services/crypto";
import { copyWithAutoClear } from "@/services/clipboard";

export default function GeneradorScreen() {
  const [length, setLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generated, setGenerated] = useState(() =>
    generatePassword({
      length: 16,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
    })
  );

  const strength = evaluatePasswordStrength(generated);

  const pan = Gesture.Pan().onUpdate((e) => {
    const next = Math.max(
      8,
      Math.min(32, Math.round(16 + e.translationX / 12))
    );
    setLength(next);
  });

  function regenerate() {
    setGenerated(
      generatePassword({
        length,
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols,
      })
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.password}>{generated}</Text>
      <Text style={styles.strength}>Fortaleza: {strength.label}</Text>
      <GestureDetector gesture={pan}>
        <View style={styles.sliderBox}>
          <Text>Longitud: {length} (arrastra o usa los botones)</Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => setLength((l) => Math.max(8, l - 1))}
              accessibilityLabel="Disminuir longitud"
              style={styles.smallBtn}
            >
              <Text>-</Text>
            </Pressable>
            <Pressable
              onPress={() => setLength((l) => Math.min(32, l + 1))}
              accessibilityLabel="Aumentar longitud"
              style={styles.smallBtn}
            >
              <Text>+</Text>
            </Pressable>
          </View>
        </View>
      </GestureDetector>
      <View style={styles.row}>
        <Text>Incluir símbolos</Text>
        <Switch value={includeSymbols} onValueChange={setIncludeSymbols} />
      </View>
      <Pressable
        style={styles.button}
        onPress={regenerate}
        accessibilityLabel="Generar nueva clave"
      >
        <Text style={styles.buttonText}>Generar</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => void copyWithAutoClear(generated, 30000)}
        accessibilityLabel="Copiar clave generada"
      >
        <Text style={styles.buttonText}>Copiar (30 s)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14 },
  password: {
    fontSize: 18,
    fontWeight: "700",
    padding: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  strength: { fontWeight: "600" },
  sliderBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
