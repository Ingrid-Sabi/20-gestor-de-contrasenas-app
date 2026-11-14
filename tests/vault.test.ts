import {
  decryptSecret,
  encryptSecret,
  evaluatePasswordStrength,
} from "../src/services/crypto";
import {
  getMasterKey,
  lockVault,
  resetAutoLockTimer,
  setMasterKey,
} from "../src/services/vaultSession";
import { isPrivacyTilt, isStrongShake } from "../src/sensors/logic";

jest.mock("expo-crypto", () => {
  let counter = 0;
  return {
    CryptoDigestAlgorithm: { SHA256: "SHA-256", SHA1: "SHA-1" },
    getRandomBytesAsync: jest.fn(async (len: number) => {
      counter += 1;
      const arr = new Uint8Array(len);
      arr.fill(counter);
      return arr;
    }),
    digestStringAsync: jest.fn(async (_alg: string, input: string) => {
      let hash = 0;
      for (let i = 0; i < input.length; i += 1) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
      }
      return hash.toString(16).padStart(64, "0");
    }),
  };
});

describe("Bóveda de contraseñas", () => {
  it("cifrar y descifrar devuelve el original con IV distinto cada vez", async () => {
    const key = "a".repeat(64);
    const enc1 = await encryptSecret("MiClaveSecreta123!", key);
    const enc2 = await encryptSecret("MiClaveSecreta123!", key);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(await decryptSecret(enc1.cipherText, enc1.iv, key)).toBe(
      "MiClaveSecreta123!"
    );
    expect(await decryptSecret(enc2.cipherText, enc2.iv, key)).toBe(
      "MiClaveSecreta123!"
    );
  });

  it("evalúa la fortaleza de una clave", () => {
    expect(evaluatePasswordStrength("123").score).toBe(0);
    expect(evaluatePasswordStrength("ClaveFuerte#2026").score).toBe(4);
  });

  it("el auto-bloqueo vacía la clave maestra de memoria", () => {
    jest.useFakeTimers();
    const onLock = jest.fn();
    setMasterKey("clave-en-memoria");
    expect(getMasterKey()).toBe("clave-en-memoria");

    resetAutoLockTimer(1000, onLock);
    jest.advanceTimersByTime(1000);

    expect(getMasterKey()).toBeNull();
    expect(onLock).toHaveBeenCalledTimes(1);
    lockVault();
    jest.useRealTimers();
  });

  it("detecta sacudida fuerte e inclinación de privacidad (lógica pura)", () => {
    expect(isStrongShake({ x: 0.1, y: 0.2, z: 0.9 })).toBe(false);
    expect(isStrongShake({ x: 2.0, y: 1.5, z: 0.5 })).toBe(true);
    expect(isPrivacyTilt({ gamma: 0.2 })).toBe(false);
    expect(isPrivacyTilt({ gamma: 0.8 })).toBe(true);
  });
});
