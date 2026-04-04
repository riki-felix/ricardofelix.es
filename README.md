# ricardofelix.es

One-page personal site with a dynamic image grid. Built with Astro, hosted on Netlify. Images uploaded from an iOS Shortcut via Netlify Functions + Netlify Blobs.

## Setup

```bash
npm install
```

## Development

```bash
netlify dev
```

## Environment Variables

Set in Netlify UI (Project settings > Environment variables):

| Variable | Description |
|---|---|
| `UPLOAD_SECRET` | Bearer token for the upload endpoint. Generate with: `openssl rand -hex 32` |

## Upload API

**POST** `/api/upload`

```
Authorization: Bearer <UPLOAD_SECRET>
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "caption": "Optional caption",
  "location": "Optional location"
}
```

**GET** `/api/images` — Returns JSON array of all images (newest first).

**GET** `/api/image?key=<key>` — Returns the image binary.

## iOS Shortcut Flow

1. Select Photo
2. Resize Image (max width 1600px)
3. Convert to JPEG (80% quality)
4. Base64 Encode
5. POST to `https://www.ricardofelix.es/api/upload` with Bearer auth + JSON body
6. Show Result
