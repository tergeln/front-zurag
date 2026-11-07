// Shared upload rules (used by the browser uploader and the API routes).

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];
export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
export const PRESIGN_BATCH = 50;

export function isAcceptedType(type: string): type is AcceptedType {
  return (ACCEPTED_TYPES as readonly string[]).includes(type);
}

/** Checks the first bytes of a file against its claimed type (JPEG, PNG, WebP). */
export function matchesMagicBytes(type: string, head: Uint8Array): boolean {
  const b = (i: number) => head[i];
  switch (type) {
    case "image/jpeg":
      return b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff;
    case "image/png":
      return b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47;
    case "image/webp":
      // "RIFF" .... "WEBP"
      return b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50;
    default:
      return false;
  }
}

export function parsePriceMnt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[\s,]/g, ""));
  return Number.isInteger(n) && n >= 0 && n <= 10_000_000 ? n : null;
}

export type PresignFile = { name: string; size: number; type: string; sha256: string };

/** Validates the JSON body of POST /api/uploads/presign. Returns null if anything is off. */
export function parsePresignBody(body: unknown): { eventId: string; priceMnt: number; files: PresignFile[] } | null {
  if (!body || typeof body !== "object") return null;
  const { eventId, priceMnt, files } = body as Record<string, unknown>;
  const price = parsePriceMnt(priceMnt);
  if (typeof eventId !== "string" || !/^[0-9a-f-]{36}$/.test(eventId) || price === null) return null;
  if (!Array.isArray(files) || files.length < 1 || files.length > PRESIGN_BATCH) return null;
  const out: PresignFile[] = [];
  for (const f of files) {
    if (!f || typeof f !== "object") return null;
    const { name, size, type, sha256 } = f as Record<string, unknown>;
    if (typeof name !== "string" || typeof type !== "string" || typeof sha256 !== "string" || typeof size !== "number") return null;
    if (!isAcceptedType(type) || !Number.isInteger(size) || size < 1 || size > MAX_FILE_BYTES || !/^[0-9a-f]{64}$/.test(sha256)) return null;
    out.push({ name: name.slice(0, 255), size, type, sha256 });
  }
  return { eventId, priceMnt: price, files: out };
}
