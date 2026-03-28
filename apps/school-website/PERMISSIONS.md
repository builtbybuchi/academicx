# Appwrite permissions (school website)

Apply these in the Appwrite console when creating or updating collections.

## Public read (anonymous site visitors)

- **schools**: allow `read` for documents where needed, or use a **public** role limited to `websiteSlug` lookups. Prefer listing schools only via **backend function** if you must hide other schools; otherwise `read` any with `status: active` is common for multi-tenant slugs.
- **events**, **news**, **gallery_images**, **testimonials**, **accreditations**: `read` for authenticated users is not enough for a public site — grant **Role: any** (guest) `read` on these collections, scoped in production via Appwrite **Document Security** or custom rules if available.

## Writes

- **contact_messages**: do **not** grant guest `create` on the client. Use the **`submitContactMessage`** backend function ([backend/functions/index.js](../../backend/functions/index.js)), which uses the API key to create documents after validating `schoolId`.

## Storage

- **school_media** bucket: `read` for file previews used on public pages; `create` only for authenticated school admins.

After schema changes, sync attributes in Appwrite to match [backend/database/schema.js](../../backend/database/schema.js).
