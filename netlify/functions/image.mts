import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing 'key' parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore("images");

  // DELETE — requires auth
  if (req.method === "DELETE") {
    const secret = Netlify.env.get("UPLOAD_SECRET");
    const auth = req.headers.get("authorization");
    if (!secret || !auth || auth !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await store.delete(key);
    return new Response(JSON.stringify({ success: true, deleted: key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // GET — serve image
  const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });

  if (!entry) {
    return new Response(JSON.stringify({ error: "Image not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contentType =
    (entry.metadata?.contentType as string) || "image/jpeg";

  return new Response(entry.data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
