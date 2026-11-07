import { describe, expect, it } from "vitest";
import { matchesMagicBytes, parsePresignBody, parsePriceMnt } from "./uploads";

const sha = "a".repeat(64);
const file = { name: "IMG_0001.jpg", size: 1000, type: "image/jpeg", sha256: sha };
const eventId = "123e4567-e89b-12d3-a456-426614174000";

describe("matchesMagicBytes", () => {
  it("recognises JPEG, PNG and WebP headers", () => {
    expect(matchesMagicBytes("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(matchesMagicBytes("image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(matchesMagicBytes("image/webp", webp)).toBe(true);
  });

  it("rejects a file whose bytes don't match its claimed type", () => {
    expect(matchesMagicBytes("image/jpeg", new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
    expect(matchesMagicBytes("image/gif", new Uint8Array([0x47, 0x49, 0x46]))).toBe(false);
  });
});

describe("parsePriceMnt", () => {
  it("accepts whole tögrög up to 10,000,000", () => {
    expect(parsePriceMnt("15,000")).toBe(15000);
    expect(parsePriceMnt(0)).toBe(0);
    expect(parsePriceMnt("10000000")).toBe(10000000);
  });
  it("rejects decimals, negatives and huge values", () => {
    expect(parsePriceMnt("12.5")).toBeNull();
    expect(parsePriceMnt(-1)).toBeNull();
    expect(parsePriceMnt(10000001)).toBeNull();
    expect(parsePriceMnt("abc")).toBeNull();
  });
});

describe("parsePresignBody", () => {
  it("accepts a valid batch", () => {
    expect(parsePresignBody({ eventId, priceMnt: 10000, files: [file] })?.files).toHaveLength(1);
  });
  it("rejects bad types, oversize files, bad hashes and oversized batches", () => {
    expect(parsePresignBody({ eventId, priceMnt: 10000, files: [{ ...file, type: "image/gif" }] })).toBeNull();
    expect(parsePresignBody({ eventId, priceMnt: 10000, files: [{ ...file, size: 60 * 1024 * 1024 }] })).toBeNull();
    expect(parsePresignBody({ eventId, priceMnt: 10000, files: [{ ...file, sha256: "xyz" }] })).toBeNull();
    expect(parsePresignBody({ eventId, priceMnt: 10000, files: Array(51).fill(file) })).toBeNull();
    expect(parsePresignBody({ eventId: "not-a-uuid", priceMnt: 10000, files: [file] })).toBeNull();
  });
});
