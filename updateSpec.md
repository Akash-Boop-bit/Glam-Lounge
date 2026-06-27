# Glam Lounge Luxury Salon — Migration Spec: content.json + /public/uploads → MongoDB + Cloudinary

**Project type:** Architecture migration for an existing Next.js project
**For:** Coding agents (Claude Code, Gemini CLI, etc.)
**Read this first:** This is a *migration* spec, not a from-scratch build. The project already exists (built from the original `specs.md`). Do not re-scaffold the app. Only touch the data/image layer and the admin write-paths described below. The public-facing pages, GSAP animations, and Dark Cherry Blossom theme are unaffected and must keep working exactly as they do today.

---

## 1. Why this migration is happening

The current architecture stores all content in a local `content.json` file and all images in `/public/uploads`, both written to at runtime by Next.js API routes when the admin dashboard saves changes.

This breaks on Vercel (and most serverless hosts) because **deployed serverless functions run on a read-only filesystem** — only `/tmp` is writable, and `/tmp` is wiped between invocations and not shared across function instances. Any `fs.writeFile` call targeting `/public/uploads/*` or `content.json` in production throws:

```
EROFS: read-only file system, open '/var/task/public/uploads/...'
```

This is expected, permanent behavior of the hosting platform — not a bug to patch around. The fix is to stop writing to the local filesystem entirely and move both content and images to services designed for serverless write access:

- **MongoDB Atlas** (free tier) — for all structured content (services, gallery metadata, testimonials, homepage text, Gul Arora bio, contact info, admin auth).
- **Cloudinary** (free tier) — for all image storage/hosting (uploads, transforms, CDN delivery).

Both are reachable over HTTPS from any serverless function with no persistent disk required, so this stays 100% Next.js (API routes / Route Handlers) — **no dedicated Node/Express backend is needed or wanted.**

---

## 2. Target Architecture

```
Next.js (Vercel, serverless functions only)
│
├── Public site (SSR/ISR pages) ──► reads content via lib/db.ts ──► MongoDB Atlas
│                                  ──► renders images via Cloudinary URLs (next/image with a custom loader OR raw <img>/CldImage)
│
├── Admin dashboard (/admin/*) ────► API routes (/api/admin/*)
│                                      ├── content mutations ──► MongoDB Atlas
│                                      └── image uploads ──────► Cloudinary Upload API
│
└── No local file writes anywhere. /public is used ONLY for truly static, build-time assets
    (favicon, fonts, fixed SVG icons) that ship with the deployment — never for user-uploaded
    or admin-editable content.
```

### MongoDB collections

```
glamlounge (database)
├── content        — singleton document: business stats, homepage text/hero image, about text/image,
│                     gulArora object, team array, contact object  (one document, fixed _id: "site")
├── categories      — service categories, each with an embedded array of services
│                     OR a flat "services" collection with a categoryId foreign key — see §4.2 for the decision
├── gallery         — one document per gallery image (id, category, title, imageUrl, cloudinaryPublicId, order)
├── testimonials    — one document per testimonial (id, name, rating, text, date)
└── users           — single admin user document (username, passwordHash, updatedAt). Even though there's
                      only one admin, use a collection (not embedded in `content`) so auth concerns stay
                      isolated from public-readable content.
```

### Cloudinary structure (folders, for organization only — not enforced by Cloudinary, just a convention)

```
glamlounge/
├── homepage/        (hero image, about image)
├── gul-arora/       (portrait)
├── team/            (Akash, etc.)
├── services/        (per-service images)
└── gallery/         (portfolio/work images)
```

---

## 3. New Required Packages

```
mongodb            (official driver — no need for Mongoose unless the agent prefers schema validation helpers; either is fine, but keep it consistent project-wide)
cloudinary         (official Cloudinary Node SDK, works fine inside serverless functions)
```

Remove (after migration is verified working, see §7 cutover order):
```
Any local-filesystem image-upload helper code that does fs.writeFile/fs.mkdir into /public/uploads
Any fs.readFile/fs.writeFile calls against content.json
```

Do not remove these until §7's cutover steps confirm the new path works end-to-end — keep the old code path intact but unused during migration so there's an easy rollback.

---

## 4. Environment Variables

Add to `.env.local` (and to Vercel's Project → Settings → Environment Variables for production/preview):

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/glamlounge?retryWrites=true&w=majority
MONGODB_DB_NAME=glamlounge

CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>

# existing admin auth env vars carry over unchanged, e.g.:
ADMIN_SESSION_SECRET=<existing value, keep as-is>
```

**Never commit `.env.local` to git.** Confirm `.env*` is in `.gitignore` before doing anything else — if it currently isn't, that's a separate problem the agent should flag immediately, since it would mean prior secrets may already be exposed in version control history.

> **Security note carried over from before:** the current `content.json` (shared in this conversation) contains a real bcrypt password hash and a real WhatsApp business number. Once this migration is complete, the admin password should be **rotated** (set a new password through the new `/admin/settings` flow, see §6.4) rather than reusing the old hash — treat the old hash as compromised since it passed through a chat/document context.

---

## 5. Database Layer — `lib/db.ts`

Replace the old `lib/content.ts` (JSON read/write) with a MongoDB connection helper and typed accessor functions. Keep the **function signatures** as close as possible to the old `lib/content.ts` exports (e.g. `getContent()`, `updateContent()`, `getServices()`, `updateService()`, `getGallery()`, `addGalleryImage()`, etc.) so that page components and API routes calling them need minimal changes — only the internals swap from file I/O to DB calls.

### 5.1 Connection pattern (critical for serverless)

Serverless functions can spin up many concurrent instances; opening a new MongoDB connection per request exhausts connection limits fast. Use the standard cached-connection pattern:

```ts
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // Reuse the client across HMR reloads in dev
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, a new client per cold start is fine; Vercel reuses warm instances
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
```

### 5.2 Accessor layer (`lib/db.ts`)

Build typed functions on top of `clientPromise`, e.g.:

```ts
import clientPromise from './mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME);
}

export async function getContent() {
  const db = await getDb();
  return db.collection('content').findOne({ _id: 'site' });
}

export async function updateContent(patch: Partial<SiteContent>) {
  const db = await getDb();
  return db.collection('content').updateOne(
    { _id: 'site' },
    { $set: { ...patch, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

export async function getCategories() {
  const db = await getDb();
  return db.collection('categories').find().sort({ order: 1 }).toArray();
}

export async function updateService(categoryId: string, serviceId: string, patch: Partial<Service>) {
  const db = await getDb();
  return db.collection('categories').updateOne(
    { id: categoryId, 'services.id': serviceId },
    { $set: Object.fromEntries(Object.entries(patch).map(([k, v]) => [`services.$.${k}`, v])) }
  );
}

export async function getGallery() {
  const db = await getDb();
  return db.collection('gallery').find().sort({ order: 1 }).toArray();
}

export async function addGalleryImage(item: GalleryItem) {
  const db = await getDb();
  return db.collection('gallery').insertOne(item);
}

export async function deleteGalleryImage(id: string) {
  const db = await getDb();
  return db.collection('gallery').deleteOne({ id });
}

export async function getTestimonials() { /* same pattern */ }
export async function getUser() { /* for auth — see §6 */ }
```

Mirror this pattern for every collection. The exact function list should match whatever the existing admin dashboard pages and public pages currently call into `lib/content.ts` — **audit the existing codebase's imports of `lib/content.ts` first** and make sure every call site has an equivalent here before deleting the old file.

---

## 6. Image Layer — Cloudinary

### 6.1 Server-side upload helper (`lib/cloudinary.ts`)

```ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileBuffer: Buffer, folder: string, publicId?: string) {
  return cloudinary.uploader.upload(
    `data:image/png;base64,${fileBuffer.toString('base64')}`,
    {
      folder: `glamlounge/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    }
  );
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
```

### 6.2 Admin upload API route (`app/api/admin/upload/route.ts`)

Replace the old route that did `fs.writeFile` with one that:
1. Verifies the admin session (unchanged — see §6.4, this check must stay).
2. Parses the incoming `multipart/form-data` (use `request.formData()` in a Next.js Route Handler — works natively, no extra body-parser package needed).
3. Validates file type (`image/jpeg`, `image/png`, `image/webp` only) and size (≤ 5MB) — same rule as before, just enforced before calling Cloudinary instead of before `fs.writeFile`.
4. Calls `uploadImage()` and gets back a secure Cloudinary URL + `public_id`.
5. Returns `{ url, publicId }` to the admin UI, which then saves that URL into the relevant MongoDB document (e.g. updates `content.homepage.heroImage` to the new Cloudinary URL via the existing content-update endpoint).
6. If the field being replaced already had an old Cloudinary image (not a seed/Unsplash URL), call `deleteImage(oldPublicId)` afterward to avoid orphaned files piling up against the free tier's storage quota. Store `cloudinaryPublicId` alongside every image URL field specifically so it can be cleaned up later — don't rely on parsing the URL to recover the public ID.

### 6.3 Rendering images on the public site

Cloudinary URLs are full external URLs (e.g. `https://res.cloudinary.com/<cloud_name>/image/upload/v.../glamlounge/services/bridal-makeup.jpg`), so:
- Add `res.cloudinary.com` to `images.remotePatterns` in `next.config.js` so `next/image` can optimize them.
- Existing Unsplash seed images (`images.unsplash.com`) should already be allow-listed from the original build — keep that entry too, since not every image needs to be migrated to Cloudinary on day one (see §7.1 — only images the client actually replaces need to live in Cloudinary going forward; seed/placeholder Unsplash URLs can stay as direct external URLs indefinitely if the client never swaps them).
- No other rendering changes needed — `<Image src={service.image} ... />` works the same whether `service.image` is an Unsplash URL or a Cloudinary URL, as long as both domains are allow-listed.

### 6.4 Admin auth — unchanged in mechanism, only storage location changes

The admin dashboard's login flow, session cookie handling, and middleware-based route protection (described in the original `specs.md` §8.2) do **not change in behavior**. The only change: the `users` collection in MongoDB replaces wherever the password hash previously lived (env var or JSON field).

- On migration, take the existing `auth.passwordHash` value from the old `content.json` and seed it into the new `users` collection as a one-time migration step (§7.2) — **but then prompt the client to immediately change their password** through `/admin/settings` once the new system is confirmed working, since that hash has been exposed in a non-production context (a chat conversation) and should be treated as burned.
- `/admin/settings` → "change password" flow now reads/writes the `users` collection instead of an env var or JSON field; hashing logic (bcrypt) is unchanged.
- Session cookie mechanism (HTTP-only, signed, short expiry) is unchanged — this was never filesystem-dependent and isn't part of the problem being fixed here.

---

## 7. Migration & Cutover Order

Follow this exact order. Each step should be independently verifiable before moving to the next — **do not delete old code paths until the new ones are confirmed working in production (not just locally).**

### 7.1 Set up infrastructure
1. Create a free MongoDB Atlas cluster (M0 tier), get the connection string, allow-list `0.0.0.0/0` for network access (or Vercel's specific egress IPs if the agent wants tighter security — free-tier projects commonly just allow all, since the URI itself is the credential).
2. Create a free Cloudinary account, get cloud name / API key / API secret from the dashboard.
3. Add all env vars (§4) to `.env.local` for local testing and to Vercel's project settings for the deployed environments (Production + Preview at minimum).

### 7.2 One-time data migration script
Write a standalone script (`scripts/migrate.ts`, run via `tsx scripts/migrate.ts` or `node` with `ts-node` — **not** an API route, since this only ever runs once, manually, by the developer) that:

1. Reads the existing `content.json` (the file the project currently has on disk — the agent should locate it in the existing repo, not recreate it from this spec's earlier example).
2. **For every image field whose value is a local path starting with `/uploads/`:**
   - Reads the actual file from `/public/uploads/<filename>` (must be run locally, where the filesystem is still writable/readable — this script never runs on Vercel).
   - Uploads it to Cloudinary via `uploadImage()`, into the appropriate folder based on what kind of image it is (homepage hero → `homepage/`, a service image → `services/`, a gallery image → `gallery/`, etc. — infer from the JSON key path).
   - Replaces that field's value with the returned Cloudinary secure URL, and records the `public_id` alongside it.
3. **For every image field whose value is already a remote URL (e.g. `images.unsplash.com/...`):** leave it as-is — do not re-upload external placeholder images to Cloudinary, that's unnecessary storage/bandwidth use on the free tier. Only locally-stored `/uploads/...` files need migrating.
4. Once all image fields are rewritten to their new URLs, write the resulting object into MongoDB:
   - `content` collection ← `business`, `homepage`, `gulArora`, `team`, `contact` fields, merged into one document with `_id: "site"`.
   - `categories` collection ← the `categories` array, one document per category (each keeping its embedded `services` array, now with migrated image URLs).
   - `gallery` collection ← the `gallery` array, one document per item.
   - `testimonials` collection ← the `testimonials` array, one document per item.
   - `users` collection ← one document built from the old `auth` object (`passwordHash`, `updatedAt`), plus a fixed `username` field if the dashboard needs one (e.g. `"admin"`).
5. Log a clear summary at the end: how many images were uploaded to Cloudinary, how many documents were inserted into each collection, and explicitly remind the developer running the script to **rotate the admin password afterward**.

This script should be safe to re-run (use `upsert: true` / `replaceOne` rather than blind `insertOne`, so running it twice doesn't create duplicates) in case the first run fails partway through (e.g. one bad image file shouldn't crash the whole migration — catch per-image errors, log them, and continue with the rest).

### 7.3 Swap the data layer
1. Implement `lib/mongodb.ts` and `lib/db.ts` (§5).
2. Implement `lib/cloudinary.ts` (§6.1).
3. Update every API route and server component that currently imports from `lib/content.ts` to import from `lib/db.ts` instead, function-by-function (audit list from §5.2).
4. Update the admin upload API route to use Cloudinary (§6.2) instead of `fs.writeFile`.
5. Update `next.config.js` to allow-list `res.cloudinary.com`.

### 7.4 Test locally end-to-end
- Confirm the public site renders all content correctly from MongoDB.
- Confirm all images load correctly (both migrated Cloudinary URLs and untouched Unsplash URLs).
- Confirm admin login still works against the migrated `users` collection.
- Confirm an admin image replace (e.g. swap the hero image) successfully uploads to Cloudinary and updates MongoDB, and the public homepage reflects it immediately (or after the existing revalidation mechanism fires, per original `specs.md` §8.4).
- Confirm an admin text edit (e.g. change a service price) updates MongoDB and reflects on the public site.

### 7.5 Deploy and verify in production
- Deploy to Vercel with the new env vars set.
- Repeat the same checks as §7.4 against the live deployed URL specifically — this is the step that actually proves the `EROFS` issue is resolved, since local dev never hit it in the first place (local filesystem is writable).
- Specifically re-test the exact failure case from the original bug report: replacing an image through the admin dashboard on the live deployed site.

### 7.6 Clean up old code paths
Only after §7.5 passes:
- Remove `lib/content.ts` (old JSON-based accessor) and any remaining `fs.writeFile`/`fs.readFile` calls targeting `content.json` or `/public/uploads`.
- Remove `content.json` from the repo (after confirming the migration script already captured everything from it into MongoDB) — or keep it renamed as `content.json.bak` for one release cycle as a manual rollback reference, then delete it.
- Leave the actual image files in `/public/uploads` alone for now (harmless dead weight) or delete them once confident — they're no longer referenced by anything once MongoDB holds the new Cloudinary URLs.
- Remind the client (again) to rotate the admin password if this hasn't happened yet.

---

## 8. What Does NOT Change

To keep this migration scoped and low-risk:
- Public site page structure, sections, copy, and the Dark Cherry Blossom theme/GSAP animations — untouched.
- Admin dashboard's page-by-page structure (`/admin/homepage`, `/admin/services`, `/admin/gallery`, `/admin/gul-arora`, `/admin/contact`, `/admin/settings`) — untouched; only what happens *inside* their form-submit handlers changes (calling new API routes backed by Mongo/Cloudinary instead of old ones backed by JSON/filesystem).
- Authentication mechanism (password hashing, session cookies, middleware route protection) — untouched in design, only its storage location moves from env-var/JSON to a MongoDB `users` collection.
- WhatsApp links, Google Maps embed, SEO/JSON-LD metadata — untouched.
- Still pure Next.js. No Express, no separate Node server, no Docker container needed — MongoDB and Cloudinary are both accessed via their official SDKs directly from Next.js API routes / Route Handlers, which run fine as Vercel serverless functions.

---

## 9. Free-Tier Limits to Keep in Mind

- **MongoDB Atlas M0:** 512MB storage — more than enough for this site's text content (images aren't stored here, only URLs/metadata).
- **Cloudinary free tier:** typically ~25 credits/month (covers a generous number of transformations + a few GB of storage/bandwidth — exact numbers change, so the agent should check Cloudinary's current free-tier page if precise limits matter for capacity planning). For a single-salon site with a few dozen images, this is comfortable headroom.
- If the client's gallery grows very large over time (hundreds of high-res images), revisit storage/bandwidth usage — not a concern at current content volume.

---

## 10. Rollback Plan

If the migration causes unexpected issues in production:
1. Old code paths are not deleted until §7.6, so reverting the Vercel deployment to the previous commit (pre-migration) immediately restores the working JSON/filesystem-based version for read operations (the existing `EROFS` write bug would still be present, but that's the pre-existing known issue, not a regression).
2. `content.json` (or its `.bak`) remains in the repo until §7.6 is reached, so no data is lost even if MongoDB setup needs to be redone.
3. Because the migration script (§7.2) is idempotent (upsert-based), it can simply be re-run after fixing whatever caused a partial failure, without needing to manually clean up MongoDB first.
