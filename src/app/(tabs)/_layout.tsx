import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Cuentas" }} />
      <Tabs.Screen name="generador" options={{ title: "Generador" }} />
    </Tabs>
  );
}
