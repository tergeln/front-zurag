import "server-only";
import { createClient } from "@/lib/supabase/server";
import { presignGet } from "@/lib/r2";

export const DOWNLOAD_LINK_SECONDS = 300; // signed links to originals live 5 minutes
export const ZIP_MAX_PHOTOS = 50;

export type DownloadLink = { photoId: string; filename: string; url: string };

/**
 * Signed links to the originals the signed-in user has an active download
 * right for. Photos without a right are silently left out (the caller
 * compares counts). The database also counts each download.
 */
export async function signedOriginalLinks(photoIds: string[], asAttachment: boolean): Promise<DownloadLink[]> {
  const ids = [...new Set(photoIds.filter((id) => /^[0-9a-f-]{36}$/.test(id)))].slice(0, ZIP_MAX_PHOTOS);
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("authorize_download", { p_photo_ids: ids });
  if (error || !data) return [];
  const rows = data as { photo_id: string; original_key: string; filename: string }[];
  return Promise.all(
    rows.map(async (r) => ({
      photoId: r.photo_id,
      filename: r.filename,
      url: await presignGet(r.original_key, DOWNLOAD_LINK_SECONDS, asAttachment ? r.filename : undefined),
    })),
  );
}
