import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";
import { v4 as uuid } from "uuid";

const MAX_PAYLOAD_BYTES = 6 * 1024 * 1024; // 6 MB Netlify limit

export default async (req: Request, _context: Context) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate auth
  const secret = Netlify.env.get("UPLOAD_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: { image?: string; caption?: string; location?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.image || typeof body.image !== "string") {
    return new Response(
      JSON.stringify({
        error: "Missing or invalid 'image' field",
        debug: {
          receivedKeys: Object.keys(body),
          imageType: typeof body.image,
          imagePreview: body.image ? String(body.image).slice(0, 100) : null,
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse base64 data URI
  let contentType = "image/jpeg";
  let base64Data = body.image;

  const dataUriMatch = body.image.match(
    /^data:(image\/(?:jpeg|png|gif|webp|heic));base64,/i
  );
  if (dataUriMatch) {
    contentType = dataUriMatch[1].toLowerCase();
    base64Data = body.image.slice(dataUriMatch[0].length);
  }

  // Strip whitespace/newlines (iOS Shortcuts adds line breaks in base64)
  base64Data = base64Data.replace(/[\s\r\n]/g, "");

  // Validate base64 characters
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64Data)) {
    return new Response(
      JSON.stringify({ error: "Invalid base64 data" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Decode
  const binaryString = atob(base64Data);
  if (binaryString.length > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({ error: "Image exceeds size limit" }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Generate key (timestamp prefix for chronological ordering)
  const now = new Date();
  const key = `${now.getTime()}-${uuid()}`;

  // Store in Netlify Blobs
  const store = getStore("images");
  await store.set(key, bytes, {
    metadata: {
      contentType,
      caption: body.caption || "",
      location: body.location || "",
      date: now.toISOString(),
    },
  });

  return new Response(
    JSON.stringify({ success: true, key }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
};
