import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) => {
  const store = getStore("images");

  const { blobs } = await store.list();

  // Fetch metadata for each blob
  const images = await Promise.all(
    blobs.map(async (blob) => {
      const meta = await store.getMetadata(blob.key);
      return {
        key: blob.key,
        date: meta?.metadata?.date || "",
        caption: meta?.metadata?.caption || "",
        location: meta?.metadata?.location || "",
      };
    })
  );

  // Sort newest first (keys are prefixed with timestamp)
  images.sort((a, b) => {
    const dateA = a.date || a.key;
    const dateB = b.date || b.key;
    return dateB.localeCompare(dateA);
  });

  return new Response(JSON.stringify(images), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
};
