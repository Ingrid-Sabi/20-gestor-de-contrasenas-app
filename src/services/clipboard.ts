import * as Clipboard from "expo-clipboard";

let clearTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyWithAutoClear(
  text: string,
  delayMs = 30000
): Promise<void> {
  await Clipboard.setStringAsync(text);
  if (clearTimer) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(() => {
    void Clipboard.setStringAsync("");
    clearTimer = null;
  }, delayMs);
}
