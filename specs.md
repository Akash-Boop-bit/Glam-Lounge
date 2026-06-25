# Glam Lounge Luxury Salon — Website Build Specification

**Project type:** Marketing website + secured Admin Dashboard (CMS-lite)
**For:** Coding agents (Claude Code, Gemini CLI, etc.)
**Client:** Glam Lounge Luxury Salon, Model Town, Panipat

> This document is the single source of truth for building this project. Follow it section by section. Where a decision is not specified, choose the simplest option consistent with the rest of the spec and note the assumption in code comments.

---

## 1. Project Overview

Build a two-part product:

1. **Public Website** — a premium, animated marketing site for "Glam Lounge Luxury Salon" (a unisex makeup/hair/skin salon in Panipat), showcasing services, the founder/lead artist Gul Arora, portfolio/work, reviews, and contact/location info.
2. **Admin Dashboard** — a password-protected private area (can be a route on the same site, e.g. `/admin`, or a separate deployable app) that lets the salon owner edit site content without touching code: images, service names/descriptions/prices, and homepage headline/punchline text.

Brand name **"Glam Lounge Luxury Salon"** must appear consistently across: navbar logo, footer, page titles/meta, favicon alt text, WhatsApp message templates, and the admin dashboard header. Do not abbreviate it.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | TypeScript preferred over JS |
| Styling | **Tailwind CSS** | Custom theme tokens for the Dark Cherry Blossom palette (see §5) |
| Animation | **GSAP** (+ `ScrollTrigger` plugin) | Used for hero reveals, scroll-based section transitions, petal-fall effects, image parallax |
| Icons | `lucide-react` | WhatsApp icon, phone, map-pin, etc. |
| Forms | Native React state + simple API route, or `react-hook-form` for the contact form | Keep dependency count low |
| Image handling | `next/image` | All images must use this component for optimization |
| Map | Google Maps **Embed API** (iframe, no API key required) for the contact section | See §9 |
| Database / Content storage | **Option A (recommended, simplest):** a single JSON file (`/data/content.json`) read/written by API routes — works well for a single-admin, low-traffic salon site. **Option B (more robust):** SQLite via Prisma, or a hosted DB (Supabase/Postgres) if the client wants multi-device editing with concurrent safety. Build with Option A by default but structure the data-access layer (`/lib/content.ts`) so swapping to Option B later only means rewriting that one file. |
| Auth (admin) | Simple password-based session auth using **NextAuth.js Credentials provider** or a hand-rolled signed HTTP-only cookie + `bcrypt`-hashed password stored in env var. No public sign-up — single admin user only. |
| Image storage (uploads) | Local `/public/uploads` folder for self-hosted simplicity, OR an object storage bucket (Cloudinary / Supabase Storage / S3) if the agent building this has access to one. Default to local `/public/uploads` and document the upgrade path. |
| Deployment target | Vercel (ideal for Next.js) or any Node host | |
| Fonts | Google Fonts: a refined serif for headings (e.g. `Playfair Display` or `Cormorant Garamond`) + a clean sans for body (e.g. `Inter` or `Poppins`) | Loaded via `next/font/google` |

### Required packages (baseline)
```
next, react, react-dom, typescript
tailwindcss, postcss, autoprefixer
gsap
lucide-react
next-auth (or jose + bcryptjs for custom auth)
zod (for form/admin input validation)
```

---

## 3. Site Map / Page Structure

### Public site
```
/                       → Home (single long-scroll page with anchor sections)
  ├─ #hero
  ├─ #about            (Glam Lounge intro + stats: 5.0 rating, 120+ reviews, since-year if provided)
  ├─ #gul-arora         (Founder / Lead Artist portfolio section)
  ├─ #services          (Makeup / Hair / Nail & Skin — tabbed or accordion categories)
  ├─ #portfolio          (Gallery of bridal/party work — client-supplied images)
  ├─ #testimonials       (Reviews carousel)
  ├─ #academy           (Makeup Academy / courses callout — optional sub-section, can link to /academy)
  └─ #contact            (Map, address, phone, WhatsApp, hours, Instagram)
/academy (optional standalone page if content gets long — otherwise keep as a section)
/portfolio (optional standalone page with full gallery + filtering by category: Bridal / Party / Hair / Nails)
/gallery/[category] (optional, only if /portfolio needs deep linking)
```

Keep the MVP as a **single-page scroll site** with a sticky nav that smooth-scrolls to anchors; only split into multiple routes if content volume demands it (e.g., portfolio grows past ~30 images).

### Admin (private)
```
/admin/login            → Password entry screen
/admin                  → Dashboard home (overview + quick links)
/admin/homepage         → Edit hero headline, punchline/tagline, hero background image, about text, stats
/admin/services         → CRUD for service categories + individual services (name, description, price, image, order)
/admin/gallery          → Upload/replace/delete portfolio & blog/work images, tag by category
/admin/gul-arora        → Edit founder bio, credentials (Canada/Singapore training), profile photo, WhatsApp number
/admin/contact          → Edit phone numbers, address, map embed link, hours, social links
/admin/settings         → Change admin password, view last-updated timestamps
```

All `/admin/*` routes (except `/admin/login`) must be wrapped in a server-side auth check (middleware) that redirects unauthenticated requests to `/admin/login`.

---

## 4. Brand & Content Reference (provided by client)

Use this verbatim as the seed content. The Admin Dashboard must let the client overwrite **all** of it later.

**Name:** Glam Lounge Luxury Salon
**Tagline candidates for homepage punchline** (admin-editable, pick one as default): *"Best Bridal Makeup Artist in Panipat"* or *"Where Every Face Tells a Beautiful Story"*
**Category:** Unisex Make-up Artist Salon
**Rating:** 5.0 ★ (120+ reviews)
**Hours:** Daily, 9:00 AM – 9:00 PM
**Phone / WhatsApp:** 093598 00006
**Location:** Model Town Road, near Sigma Ultrasound, Model Town, Panipat
**Instagram:** [@makeup_by_gularora](https://instagram.com/makeup_by_gularora) (10,000+ followers)
**Lead Artist / Founder:** Gul Arora — HD bridal & party makeup specialist, trained/graduated in **Canada and Singapore**
**Other notable staff:** Akash — noted for exceptional hair cutting (give him a small "Meet the Team" card if a team section is added)
**Amenities:** Free on-site parking, free street parking, accepts Credit Card / Google Pay / NFC payments, appointment required
**Reputation notes:** Praised for "magic touch," clean/modern/relaxing vibe, well-regarded makeup courses

### Services data (seed content for `/data/content.json` → `services` array)

```json
{
  "categories": [
    {
      "id": "makeup",
      "name": "Makeup Services",
      "description": "Specializing in professional artistry for weddings and events, known for customized and flawless finishes.",
      "services": [
        { "id": "bridal-makeup", "name": "Bridal Makeup", "description": "A signature service designed for brides, including traditional and contemporary looks tailored to individual features.", "price": "On request", "image": "/uploads/services/bridal-makeup.jpg" },
        { "id": "airbrush-makeup", "name": "Airbrush Makeup", "description": "Long-lasting, water-resistant, high-definition finish using a fine mist technique.", "price": "On request", "image": "/uploads/services/airbrush-makeup.jpg" },
        { "id": "party-fashion-makeup", "name": "Party & Fashion Makeup", "description": "Professional styling for social gatherings or photo shoots to ensure a camera-ready glow.", "price": "On request", "image": "/uploads/services/party-makeup.jpg" },
        { "id": "makeup-academy", "name": "Makeup Academy", "description": "Professional training courses for aspiring artists to master advanced makeup techniques.", "price": "On request", "image": "/uploads/services/makeup-academy.jpg" }
      ]
    },
    {
      "id": "hair",
      "name": "Hair Care & Styling",
      "description": "A variety of hair treatments and styling options for both men and women.",
      "services": [
        { "id": "haircut-men", "name": "Hair Cut (Men)", "description": "Professional grooming and modern styling.", "price": "₹199 (special) – ₹350", "image": "/uploads/services/haircut-men.jpg" },
        { "id": "haircut-women", "name": "Hair Cut (Women)", "description": "Precision cutting and styling to enhance hair texture and shape.", "price": "Starting ₹500", "image": "/uploads/services/haircut-women.jpg" },
        { "id": "hair-smoothening", "name": "Hair Smoothening", "description": "Chemical treatment that reduces frizz and adds a sleek, healthy shine.", "price": "Starting ₹4,000", "image": "/uploads/services/hair-smoothening.jpg" },
        { "id": "hair-highlighting", "name": "Hair Highlighting", "description": "Adds dimension and depth through customized color placement.", "price": "Starting ₹300", "image": "/uploads/services/hair-highlighting.jpg" },
        { "id": "hair-styling", "name": "Hair Styling", "description": "Professional blow-outs or formal updos for special occasions.", "price": "Starting ₹150", "image": "/uploads/services/hair-styling.jpg" },
        { "id": "hair-trimming", "name": "Hair Trimming", "description": "A quick service to maintain health and remove split ends.", "price": "Starting ₹300", "image": "/uploads/services/hair-trimming.jpg" }
      ]
    },
    {
      "id": "nail-skin",
      "name": "Nail & Skin Care",
      "description": "Luxury treatments focused on grooming and rejuvenating the hands and feet.",
      "services": [
        { "id": "acrylic-nails", "name": "Acrylic Nail Extensions", "description": "Durable and aesthetic extensions, customizable with colors and designs.", "price": "On request", "image": "/uploads/services/acrylic-nails.jpg" },
        { "id": "anti-tan-pedicure", "name": "Anti Tan Pedicure", "description": "A relaxing foot treatment that removes tan and dead skin while moisturizing deeply.", "price": "On request", "image": "/uploads/services/anti-tan-pedicure.jpg" },
        { "id": "threading", "name": "Threading", "description": "Precise eyebrow and facial hair removal to define facial features.", "price": "On request", "image": "/uploads/services/threading.jpg" }
      ]
    }
  ]
}
```

All `price` fields showing "On request" should be admin-editable to an actual number whenever the client provides one.

---

## 5. Design Direction — "Dark Cherry Blossom" Theme

A moody, luxurious dark theme: near-black backgrounds, deep cherry/burgundy reds, and soft pink-blossom accents, evoking a high-end salon at night with cherry blossom petals drifting across the screen.

### 5.1 Color tokens (Tailwind config)

```js
// tailwind.config.ts → theme.extend.colors
colors: {
  charcoal: {
    DEFAULT: '#120A0D',   // primary background
    light: '#1C1116',     // card / section backgrounds
    lighter: '#2A1820',   // borders, dividers
  },
  cherry: {
    50:  '#FFE9F0',
    100: '#FFD0E0',
    300: '#F6A0C0',       // blossom pink — accents, hover states
    500: '#D94F70',       // primary brand red-pink
    700: '#8C1F3A',       // deep cherry — buttons, CTAs
    900: '#4A0F1F',       // darkest cherry — gradients, shadows
  },
  gold: {
    DEFAULT: '#C9A24B',   // optional luxury accent for dividers/icons
  },
  ivory: '#F7EDE9',       // primary light text on dark backgrounds
}
```

### 5.2 Typography
- Headings: `Playfair Display` (serif, elegant) — weights 500/600/700
- Body: `Inter` or `Poppins` — weights 400/500
- Generous letter-spacing on uppercase labels (e.g. nav links, section eyebrows: "OUR SERVICES")

### 5.3 Visual motifs
- **Cherry blossom petals**: subtle animated SVG petals drifting downward in the hero and section transitions (GSAP-driven, low-opacity, never distracting from text/CTAs). Use 3–5 simple petal SVG shapes, randomize size/rotation/speed.
- **Gradient overlays**: dark charcoal → deep cherry radial/linear gradients behind hero text and section dividers, never flat black.
- **Soft glow accents**: cherry-pink glow (`box-shadow` blur) behind key CTA buttons and the Gul Arora portrait.
- **Thin gold-line dividers** between sections for a touch of luxury.
- **Rounded-but-sharp cards**: `rounded-2xl` images/cards with a thin cherry-300 border on hover, not overly soft.
- **Grain/noise texture** (optional, subtle) overlay on hero background for a premium editorial feel.

### 5.4 Layout principles
- Max content width: `1280px` (`max-w-7xl`), generous side padding on mobile (`px-6`).
- Section vertical rhythm: `py-24` desktop / `py-16` mobile.
- Mobile-first; salon clients browse primarily on phones — test WhatsApp/Call buttons as **sticky bottom bar** on mobile.
- Dark theme only (no light/dark toggle needed) — this is a fixed aesthetic choice, not a user setting.

---

## 6. GSAP Animation Plan

Register `ScrollTrigger` once in a shared `lib/gsap.ts` and reuse.

| Section | Animation |
|---|---|
| Hero | On load: headline fades/slides up in staggered words; background image scales from 1.1 → 1 (slow zoom-out); petals begin looping fall animation; CTA buttons fade in last. |
| Nav | Background changes from transparent → solid `charcoal` with blur on scroll past hero (triggered via `ScrollTrigger`, not just CSS, if combined with logo size shrink). |
| About / Stats | Numbers (5.0 rating, 120+ reviews, years of experience) count up when scrolled into view. |
| Gul Arora section | Portrait image reveals with a clip-path wipe (cherry-colored panel slides away); credentials ("Trained in Canada & Singapore") fade in one line at a time. |
| Services | Cards stagger-fade-up on scroll, one category tab transitions with a crossfade + slight horizontal slide when switched. |
| Portfolio gallery | Masonry/grid images scale-in with stagger; lightbox open/close uses GSAP scale+fade, not abrupt show/hide. |
| Testimonials | Horizontal scroll-snap carousel; auto-advance with pause-on-hover; GSAP-driven drag-to-scroll. |
| Contact / Map | Map + form slide in from opposite sides on scroll into view. |
| Section transitions | Thin gold divider lines draw themselves left-to-right (`strokeDashoffset` animation) as user scrolls past. |

Keep all animations `prefers-reduced-motion` aware — disable/shorten heavy motion if the user's OS setting requests it.

---

## 7. Page-by-Page Content & Image Spec

For every image slot below: **(a)** a working placeholder image URL is provided so the site looks complete out of the box, and **(b)** the exact `content.json` key / admin field the client can use to swap in their own image. All images load through `next/image` with appropriate `alt` text using salon/service names for SEO.

> **Placeholder image source:** Unsplash (free to use, no attribution required, hot-linkable via their CDN). If the agent building this has no internet access at build time, download these once and store locally in `/public/uploads/seed/`, or simply leave the URLs as remote `next/image` sources (configure `images.domains` / `remotePatterns` for `images.unsplash.com` in `next.config.js`).

### 7.1 Hero Section
- **Background image:** full-bleed dark, moody salon/makeup-chair or close-up bridal makeup shot, with a dark cherry gradient overlay for text legibility.
  - Placeholder: `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2` (makeup brushes, warm dark tone) — swap for a real salon interior shot when available.
  - Admin field: `content.homepage.heroImage`
- **Headline (H1):** "Glam Lounge Luxury Salon" or punchline — admin field `content.homepage.headline`
- **Punchline/sub-headline:** e.g. "Best Bridal Makeup Artist in Panipat" — admin field `content.homepage.punchline`
- **CTAs:** "Book on WhatsApp" (opens `wa.me` link), "View Services" (smooth-scrolls to #services)
- **Trust badges row:** ★ 5.0 rating · 120+ Reviews · Since [year, optional]

### 7.2 About Section
- Short paragraph (admin-editable, `content.about.text`) using the provided business description (unisex destination, Model Town, professional artistry + luxurious atmosphere).
- Stat counters: 5.0★ rating, 120+ reviews, 10,000+ Instagram followers, Years of Experience (placeholder "X+", admin-editable).
- Image: salon interior — Placeholder: `https://images.unsplash.com/photo-1633681926035-ec1ac984418a` (modern salon interior). Admin field: `content.about.image`

### 7.3 Gul Arora — Featured Artist Section
This is a mini-portfolio/bio block, visually distinct (different background tone, more spacious).

- **Portrait photo** — Placeholder: `https://images.unsplash.com/photo-1560066984-138dadb4c035` (professional portrait placeholder; replace with Gul Arora's real photo ASAP). Admin field: `content.gulArora.photo`
- **Name & title:** "Gul Arora — Founder & Lead Makeup Artist"
- **Bio copy (admin-editable, `content.gulArora.bio`):** mentions HD bridal & party makeup specialization, training/graduation in **Canada and Singapore**, Instagram handle `@makeup_by_gularora` (10,000+ followers) linked out.
- **Credentials list:** e.g. "Certified Makeup Artist — Canada", "Advanced HD Techniques — Singapore" (admin-editable array `content.gulArora.credentials`)
- **CTA — WhatsApp Gul Arora directly:** a distinct button "Chat with Gul Arora on WhatsApp" → `https://wa.me/<gulAroraNumber>?text=Hi%20Gul%2C%20I%27d%20like%20to%20book%20a%20consultation`. Admin field for the number: `content.gulArora.whatsappNumber` (falls back to the main salon number if not set).
- Optional small "Meet the Team" sub-card for Akash (hair specialist) — image placeholder `https://images.unsplash.com/photo-1599351431202-1e0f0137899a`, admin field `content.team[]`.

### 7.4 Services Section
- Tabbed or accordion layout for the 3 categories (Makeup / Hair / Nail & Skin) from §4 data.
- Each service = card with: image, name, short description, price, optional "Book This" WhatsApp deep-link pre-filled with the service name in the message text.
- Per-service image placeholders (swap via admin or client-provided files):

| Service | Placeholder URL | Admin field |
|---|---|---|
| Bridal Makeup | `https://images.unsplash.com/photo-1606902965551-dce093cda6e7` | `services.makeup.bridal-makeup.image` |
| Airbrush Makeup | `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9` | `services.makeup.airbrush-makeup.image` |
| Party & Fashion Makeup | `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2` | `services.makeup.party-fashion-makeup.image` |
| Makeup Academy | `https://images.unsplash.com/photo-1571646034647-52e6ea84b28e` | `services.makeup.makeup-academy.image` |
| Hair Cut (Men) | `https://images.unsplash.com/photo-1503951914875-452162b0f3f1` | `services.hair.haircut-men.image` |
| Hair Cut (Women) | `https://images.unsplash.com/photo-1560066984-138dadb4c035` | `services.hair.haircut-women.image` |
| Hair Smoothening | `https://images.unsplash.com/photo-1519699047748-de8e457a634e` | `services.hair.hair-smoothening.image` |
| Hair Highlighting | `https://images.unsplash.com/photo-1605497788044-5a32c7078486` | `services.hair.hair-highlighting.image` |
| Hair Styling | `https://images.unsplash.com/photo-1522336572468-97b06e8ef143` | `services.hair.hair-styling.image` |
| Hair Trimming | `https://images.unsplash.com/photo-1599351431202-1e0f0137899a` | `services.hair.hair-trimming.image` |
| Acrylic Nail Extensions | `https://images.unsplash.com/photo-1604654894610-df63bc536371` | `services.nail-skin.acrylic-nails.image` |
| Anti Tan Pedicure | `https://images.unsplash.com/photo-1519014816548-bf5fe059798b` | `services.nail-skin.anti-tan-pedicure.image` |
| Threading | `https://images.unsplash.com/photo-1612817288484-bf7f5c6f4f12` | `services.nail-skin.threading.image` |

> Note to builder: verify each Unsplash URL resolves at build time (Unsplash photo IDs occasionally get reorganized); if any 404, swap for any close-matching free Unsplash/Pexels image in the same category — exact photo choice is not critical, tone (dark, elegant, beauty/salon-related) is.

### 7.5 Portfolio / Gallery Section ("Our Work")
This is where the **client's own photos** of real bridal/party transformations and past work go.
- Default seed: 6–9 placeholder images in a masonry grid so the section isn't empty pre-launch.
  - Placeholders: a mixed set from Unsplash's makeup/bridal category, e.g. `https://images.unsplash.com/photo-1583001931096-959e9a1a6223`, `https://images.unsplash.com/photo-1492106087820-71f1a00d2b11`, `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2`, etc. — clearly label these in code comments as **"REPLACE WITH CLIENT PHOTOS."**
- **Primary path:** client uploads real photos via `/admin/gallery` (drag-and-drop uploader, stores to `/public/uploads/gallery/`, tags each with a category: Bridal / Party / Hair / Nails / Academy).
- **Alternative path:** client can hand the agent a folder/zip of images directly; the agent places them in `/public/images/portfolio/` and references them in `content.json` directly — no admin upload needed for the initial seed.
- Lightbox on click (GSAP fade+scale), filterable by category tabs.
- Optional: a "Blog"-style sub-grid if the client wants written posts about transformations — out of scope for MVP unless requested; design the data model (`content.blog[]`) to be extensible regardless.

### 7.6 Testimonials Section
- Carousel of reviews. Since no individual review text was provided, seed with 3 generic, clearly-marked placeholder reviews referencing the 5.0★ / 120+ reviews stat, and give the admin a `content.testimonials[]` array (name, rating, text, optional photo) to replace them with real Google reviews.
- Include a "See all reviews on Google" outbound link if/when the client provides their Google Business Profile URL.

### 7.7 Contact Section
- **Google Map embed** (no API key needed):
  ```html
  <iframe
    src="https://www.google.com/maps?q=Sigma+Ultrasound,+Model+Town+Road,+Panipat&output=embed"
    width="100%" height="450" style="border:0;" loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
  ```
  Replace the query string with the salon's exact pinned coordinates/Place ID once the client shares their Google Business Profile link — admin field `content.contact.mapEmbedUrl` so this is editable without redeploying.
- **Address text:** Model Town Road, near Sigma Ultrasound, Model Town, Panipat — admin field `content.contact.address`
- **Hours:** Daily 9:00 AM – 9:00 PM — admin field `content.contact.hours`
- **Phone / Call button:** `tel:+91XXXXXXXXXX` — admin field `content.contact.phone`
- **WhatsApp button:** `https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20Glam%20Lounge%20Luxury%20Salon` — admin field `content.contact.whatsappNumber`
- **Instagram link:** `@makeup_by_gularora` — admin field `content.contact.instagramUrl`
- **Simple contact form** (name, phone, message) → sends via an API route to email/WhatsApp notification, or simply opens a pre-filled WhatsApp message (simplest, no email infra needed). Recommend the WhatsApp-first approach for a salon business.

### 7.8 Global — WhatsApp Floating Button
- A persistent floating WhatsApp icon button (bottom-right, GSAP gentle pulse animation) on every page, linking to the main salon WhatsApp number, present alongside (not instead of) the dedicated Gul Arora WhatsApp CTA in his section.
- On mobile, this can collapse into the sticky bottom action bar (Call | WhatsApp | Directions) for easier thumb access.

---

## 8. Admin Dashboard — Detailed Spec

### 8.1 Goals
A non-technical salon owner must be able to:
1. Log in with a single password (no username needed, or a simple fixed username + password).
2. Replace **any image** on the site (hero, about, Gul Arora portrait, every service image, every gallery image).
3. Edit **every service's** name, description, and price, and add/remove services within existing categories.
4. Edit the **homepage headline/punchline** and About text.
5. Edit contact info (phone, WhatsApp numbers, address, hours, map link, Instagram URL).
6. See changes reflected on the live site immediately (or after a one-click "Publish"/revalidate step) without a code deploy.

### 8.2 Security requirements
- Single shared admin password, **never stored in plaintext** — hash with `bcrypt` and store the hash in an environment variable (`ADMIN_PASSWORD_HASH`) or a protected config row, not in source control.
- Session via HTTP-only, `Secure`, `SameSite=Strict` cookie with a reasonably short expiry (e.g. 24h) and a manual "Log out" action.
- `middleware.ts` protects all `/admin/*` routes except `/admin/login`, checking for a valid session cookie/JWT.
- Rate-limit login attempts (basic in-memory or edge-config counter) to slow brute force — e.g. lock out for 5 minutes after 5 failed attempts from the same IP.
- All admin API routes (`/api/admin/*`) must re-check the session server-side — never trust client-side route protection alone.
- Image uploads: validate file type (jpg/png/webp only) and size limit (e.g. 5MB) before saving; sanitize filenames.
- No public sign-up route, no password reset via email unless the client specifically wants this (adds infra complexity) — simplest path: owner contacts the developer to rotate the password via env var if forgotten.
- Recommend HTTPS-only deployment (default on Vercel).

### 8.3 Admin UI requirements
- Plain, fast, clearly-labeled forms — this is a tool, not a showcase; can use the same dark cherry blossom palette at lower intensity for brand consistency, or a neutral light/dark admin UI for clarity — builder's choice, but must remain easy to read and use on both desktop and mobile (owner may update content from their phone).
- Each editable section (`/admin/homepage`, `/admin/services`, `/admin/gallery`, `/admin/gul-arora`, `/admin/contact`) has:
  - A live preview thumbnail of current content/image.
  - An upload/replace control for images (drag-and-drop + file picker), with instant preview before saving.
  - Text inputs/textareas for copy, with a visible character-count hint where length affects layout (e.g. headline).
  - A clear **Save** action with success/error feedback (toast or inline message).
- `/admin/services` specifically needs:
  - List view grouped by category, drag-to-reorder (optional nice-to-have) or simple up/down ordering.
  - Add new service / delete service actions, with a confirmation step before delete.
  - Inline edit of name, description, price, image per service.
- `/admin/settings` lets the owner change their password (requires entering current password).

### 8.4 Data flow
- Admin saves → API route validates (with `zod`) → writes to `content.json` (or DB) → public site reads this same source on next request/build.
- If using static generation for speed, trigger `revalidatePath('/')` (Next.js on-demand revalidation) after every successful admin save so changes appear immediately without a full redeploy.
- Keep a simple `updatedAt` timestamp per section so the admin dashboard can show "Last updated: ...".

### 8.5 Deployment option for the admin
Either:
- **(A) Same app, separate route** — `/admin` lives inside the same Next.js project, protected by middleware. Simplest, recommended default.
- **(B) Fully separate app** — a second small Next.js (or any stack) app that talks to the same content store (DB or shared file via API) and is deployed on a different subdomain (e.g. `admin.glamloungesalon.com`). Only worth the extra complexity if the client wants the admin physically isolated from the public site's infrastructure/codebase.

Default to **(A)** unless told otherwise.

---

## 9. SEO & Metadata
- Page title: "Glam Lounge Luxury Salon | Best Bridal Makeup Artist in Panipat"
- Meta description referencing Model Town, Panipat, bridal/HD makeup, Gul Arora.
- Open Graph image: a hero/portfolio shot for social link previews.
- `sitemap.xml` and `robots.txt` via Next.js conventions.
- Local SEO: embed structured data (`LocalBusiness` JSON-LD) with name, address, phone, hours, rating (5.0, 120+ reviews) — helps Google surface the existing strong rating.
- Ensure all images have descriptive `alt` text (e.g. "Bridal HD makeup by Gul Arora at Glam Lounge Luxury Salon, Panipat") for image-search SEO, since the salon's portfolio is a key discovery channel.

---

## 10. Performance & Accessibility
- Lazy-load all below-the-fold images (`next/image` default behavior).
- Compress/responsibly size all gallery uploads on the admin side (resize before storing, or use a service that does this automatically).
- Respect `prefers-reduced-motion` for GSAP animations.
- Sufficient color contrast for body text against dark backgrounds (test ivory text against charcoal — should pass WCAG AA).
- All interactive elements (WhatsApp buttons, nav links, lightbox) keyboard-navigable with visible focus states.

---

## 11. Build Order (recommended sequence for the coding agent)

1. Scaffold Next.js + Tailwind + TypeScript project; set up theme tokens and fonts.
2. Build static layout shell: Navbar, Footer, global WhatsApp floating button.
3. Build Hero section with seed content + GSAP intro animation.
4. Build About, Gul Arora, Services, Portfolio, Testimonials, Contact sections in order, wiring each to read from `content.json` (not hardcoded strings) from the start — this avoids a painful refactor later.
5. Add Google Map embed + contact form.
6. Add SEO metadata + JSON-LD.
7. Build `/lib/content.ts` data-access layer (read/write JSON; swappable for DB later).
8. Build admin auth (login page, middleware, session handling).
9. Build admin dashboard pages one section at a time, each wired to the same `content.json` via API routes.
10. Add image upload handling for admin (`/api/admin/upload`).
11. Polish GSAP animations, test `prefers-reduced-motion`, test mobile sticky action bar.
12. Final QA pass: all placeholder images clearly swappable, all admin fields actually affect the live site, all WhatsApp links correctly formatted with the real number once provided.

---

## 12. Open Items for the Client to Confirm Before/During Build
- Final hero punchline wording (a default is provided in §7.1, but confirm preferred phrasing).
- Real photos: salon interior, Gul Arora portrait, portfolio/work samples, Akash's photo (if a team section is wanted).
- Exact Google Maps pin / Place ID (currently using a text-query embed as a placeholder — works, but a precise pin is better).
- Whether Gul Arora should have a WhatsApp number distinct from the main salon line, or share it.
- Whether actual prices should replace any "On request" placeholders.
- Whether a Blog section is wanted now or deferred (data model is left extensible either way).
- Preferred admin login credentials (the agent will generate a strong default password and hash if none is supplied, and must communicate it securely to the client outside of source control).
