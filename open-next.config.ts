import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is rendered per request (they read the auth cookie), so no incremental cache is needed yet.
export default defineCloudflareConfig({});
