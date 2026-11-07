/** Money is always whole tögrög (MNT) integers. Commission rates are basis points (2000 = 20%). */

export function splitSale(priceMnt: number, commissionBp: number): { platform: number; photographer: number } {
  if (!Number.isInteger(priceMnt) || priceMnt < 0) throw new Error("price must be a non-negative integer");
  if (!Number.isInteger(commissionBp) || commissionBp < 0 || commissionBp > 10000) throw new Error("commission must be 0..10000 bp");
  // Round the photographer's share down; the remainder (at most 1₮) goes to the platform.
  const photographer = Math.floor((priceMnt * (10000 - commissionBp)) / 10000);
  return { platform: priceMnt - photographer, photographer };
}

export function bpToPercent(bp: number): string {
  return (bp / 100).toFixed(2).replace(/\.?0+$/, "");
}

export function percentToBp(percent: string): number | null {
  const n = Number(percent.replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  const bp = Math.round(n * 100);
  return Math.abs(bp - n * 100) < 1e-6 ? bp : null; // at most 2 decimals
}

export function formatMnt(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}
