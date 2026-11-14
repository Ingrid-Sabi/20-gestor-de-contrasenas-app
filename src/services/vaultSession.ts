let masterKeyInMemory: string | null = null;
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

export function setMasterKey(key: string): void {
  masterKeyInMemory = key;
}

export function getMasterKey(): string | null {
  return masterKeyInMemory;
}

export function isVaultUnlocked(): boolean {
  return masterKeyInMemory !== null;
}

export function lockVault(): void {
  masterKeyInMemory = null;
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
}

export function resetAutoLockTimer(
  timeoutMs: number,
  onLock: () => void
): void {
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
  }
  autoLockTimer = setTimeout(() => {
    lockVault();
    onLock();
  }, timeoutMs);
}
