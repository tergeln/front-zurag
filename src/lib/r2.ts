import "server-only";
import { AwsClient } from "aws4fetch";

// Private Cloudflare R2 bucket, accessed with its S3-compatible API.
// Nothing in the bucket is public: browsers only ever get short-lived signed URLs.

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY or R2_BUCKET in the environment.");
  }
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    base: `https://${accountId}.r2.cloudflarestorage.com/${bucket}`,
  };
}

function objectUrl(base: string, key: string) {
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** A URL the browser can PUT one file to, valid for `expiresIn` seconds. Content-Type must match. */
export async function presignPut(key: string, contentType: string, expiresIn = 900): Promise<string> {
  const { client, base } = config();
  const url = new URL(objectUrl(base, key));
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await client.sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

/** A URL that lets the holder GET one object for `expiresIn` seconds. */
export async function presignGet(key: string, expiresIn = 600): Promise<string> {
  const { client, base } = config();
  const url = new URL(objectUrl(base, key));
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await client.sign(new Request(url, { method: "GET" }), { aws: { signQuery: true } });
  return signed.url;
}

/** Size in bytes of a stored object, or null if it does not exist. */
export async function headObjectSize(key: string): Promise<number | null> {
  const { client, base } = config();
  const res = await client.fetch(objectUrl(base, key), { method: "HEAD" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 HEAD failed: ${res.status}`);
  return Number(res.headers.get("content-length"));
}
