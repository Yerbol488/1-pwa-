// Local PIN hashing. This is LOCAL-ONLY obfuscation, NOT real security — the
// hash lives in localStorage on the device. Real authentication will come with
// Supabase Auth later. We avoid storing the PIN in plaintext, but anyone with
// device access can still read localStorage, so do not treat this as protection
// of sensitive data.

/** Lightweight non-cryptographic hash (djb2 variant) → short string. */
export function hashPin(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) ^ pin.charCodeAt(i);
  }
  return "p" + (h >>> 0).toString(36);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}
