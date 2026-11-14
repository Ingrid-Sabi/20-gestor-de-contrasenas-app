import * as Crypto from "expo-crypto";

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Muy débil" | "Débil" | "Media" | "Fuerte" | "Muy fuerte";
}

export interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function deriveKeystream(
  keyHex: string,
  ivHex: string,
  length: number
): Promise<Uint8Array> {
  const result = new Uint8Array(length);
  let offset = 0;
  let counter = 0;
  while (offset < length) {
    const blockHex = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${keyHex}:${ivHex}:${counter}`
    );
    const block = hexToBytes(blockHex);
    for (let i = 0; i < block.length && offset < length; i += 1) {
      result[offset] = block[i] ?? 0;
      offset += 1;
    }
    counter += 1;
  }
  return result;
}

export async function deriveMasterKey(
  masterPassword: string,
  salt = "boveda-local-v1"
): Promise<string> {
  let hash = `${masterPassword}:${salt}`;
  for (let i = 0; i < 50; i += 1) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      hash
    );
  }
  return hash;
}

export async function encryptSecret(
  plainText: string,
  keyHex: string
): Promise<EncryptedPayload> {
  const ivBytes = await Crypto.getRandomBytesAsync(16);
  const iv = bytesToHex(ivBytes);
  const plainBytes = new TextEncoder().encode(plainText);
  const keystream = await deriveKeystream(keyHex, iv, plainBytes.length);
  const cipherBytes = new Uint8Array(plainBytes.length);
  for (let i = 0; i < plainBytes.length; i += 1) {
    cipherBytes[i] = (plainBytes[i] ?? 0) ^ (keystream[i] ?? 0);
  }
  return { cipherText: bytesToHex(cipherBytes), iv };
}

export async function decryptSecret(
  cipherText: string,
  iv: string,
  keyHex: string
): Promise<string> {
  const cipherBytes = hexToBytes(cipherText);
  const keystream = await deriveKeystream(keyHex, iv, cipherBytes.length);
  const plainBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i += 1) {
    plainBytes[i] = (cipherBytes[i] ?? 0) ^ (keystream[i] ?? 0);
  }
  return new TextDecoder().decode(plainBytes);
}

export async function sha1Hex(value: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    value
  );
  return digest.toUpperCase();
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels: Record<number, PasswordStrength["label"]> = {
    0: "Muy débil",
    1: "Débil",
    2: "Media",
    3: "Fuerte",
    4: "Muy fuerte",
  };
  const clamped = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;
  return { score: clamped, label: labels[clamped] ?? "Muy débil" };
}

export function generatePassword(options: GeneratorOptions): string {
  let charset = "abcdefghijklmnopqrstuvwxyz";
  if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.includeNumbers) charset += "0123456789";
  if (options.includeSymbols) charset += "!@#$%^&*()-_=+[]{}";

  const length = Math.max(6, Math.min(64, options.length));
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * charset.length);
    out += charset[idx] ?? "a";
  }
  return out;
}
