const IV_SIZE = 12;
const ENCRYPTION_ALG = "AES-GCM";

// process
export function encode(string: string): Uint8Array {
  return new TextEncoder().encode(string);
}

export function decode(array: Uint8Array): string {
  return new TextDecoder("utf-8").decode(array);
}

export async function encrypt(
  iv: Uint8Array,
  key: CryptoKey,
  message: string
): Promise<Uint8Array> {
  const arrayBuffer = await window.crypto.subtle.encrypt(
    { name: ENCRYPTION_ALG, iv },
    key,
    encode(message)
  );
  return new Uint8Array(arrayBuffer);
}

export async function decrypt(
  iv: Uint8Array,
  key: CryptoKey,
  cyphertext: Uint8Array
): Promise<string> {
  const arrayBuffer = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALG, iv },
    key,
    cyphertext
  );
  return arrayBufferToString(arrayBuffer);
}

export async function hash(encoded: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.digest("SHA-256", encoded);
}

// iv
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_SIZE));
}

export function splitMergedString(mergedString: string): [Uint8Array, string] {
  const iv = mergedString.slice(0, IV_SIZE);
  const encryptedString = mergedString.slice(IV_SIZE);

  return [JSON.parse(iv), encryptedString];
}

// key
export async function importKey(
  passphrase: string,
  purpose: "encrypt" | "decrypt"
): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    await hash(encode(passphrase)),
    { name: ENCRYPTION_ALG },
    false,
    [purpose]
  );
}

// conversion
export function arrayBufferToString(arrayBuffer: ArrayBuffer): string {
  const uInt8Array = new Uint8Array(arrayBuffer);
  return decode(uInt8Array);
}

export function uInt8ToArray(uInt8Array: Uint8Array): number[] {
  return Array.from(uInt8Array);
}

export function arrayToUint8(array: number[]): Uint8Array {
  return new Uint8Array(array);
}
