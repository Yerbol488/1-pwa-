// Phone / WhatsApp helpers for the suppliers module.

/**
 * Normalise a phone string to digits only, fixing the common KZ/RU case where
 * the number starts with a leading 8 (e.g. "8 777..." -> "7777...").
 * "+7 777 123 45 67" -> "77771234567"
 */
export function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }
  return digits;
}

/** Build a wa.me link from any phone format. Returns null if no digits. */
export function whatsappLink(raw: string): string | null {
  const digits = normalizePhone(raw);
  return digits ? `https://wa.me/${digits}` : null;
}

/** Copy text to clipboard, with a legacy fallback. Returns success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
