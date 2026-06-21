# Slice 1: Image Upload + CDN

## Goal

Rendered widget images are uploaded to a CDN and accessible via public URLs. This is the foundation for Discord embeds — Discord needs a URL to display the image.

## Issues

### T1: Set up Cloudflare R2 bucket for widget images

**What to build:**
Create a Cloudflare R2 bucket (or compatible S3 storage) to host rendered widget images. Configure CORS, lifecycle rules (auto-expire old images after 24h), and public access via a custom domain or r2.dev subdomain.

**Acceptance criteria:**
- [ ] R2 bucket created with appropriate name (e.g., `discord-widgets`)
- [ ] Public read access configured (either via r2.dev subdomain or custom domain)
- [ ] CORS allows Discord's image proxy to fetch images
- [ ] Lifecycle rule: auto-delete objects after 24 hours

**Dependencies:** None — can start immediately

**Metadata:**
- **Source:** PRD Phase 1 (Image upload)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Add image upload utility to render package

**What to build:**
Create `packages/render/src/upload.ts` with functions to upload PNG buffers to R2 and return public URLs. Use the S3-compatible API (AWS SDK `@aws-sdk/client-s3`). The upload function should:
- Accept a PNG Buffer and a filename/key
- Upload to R2 with `image/png` content type
- Return the public URL
- Support optional TTL (default 24h)

Also create `packages/render/src/hosted.ts` that combines render + upload:
```typescript
async function renderToHostedUrl(component, options): Promise<string>
```

**Acceptance criteria:**
- [ ] `upload.ts` exports `uploadToR2(buffer, key): Promise<string>`
- [ ] `hosted.ts` exports `renderToHostedUrl(component, options): Promise<string>`
- [ ] Uploaded images are accessible via public URL
- [ ] URLs return valid PNG with correct content type

**Dependencies:** T1 (R2 bucket must exist)

**Metadata:**
- **Source:** PRD Phase 1 (Image upload)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Add R2 credentials to env package

**What to build:**
Add R2/S3 environment variables to `packages/env/`:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` (the public CDN URL)

Use the existing env schema pattern from the project.

**Acceptance criteria:**
- [ ] Env schema validates all R2 variables
- [ ] `.env.example` updated with R2 placeholders
- [ ] Missing vars produce clear error messages

**Dependencies:** None — can start immediately

**Metadata:**
- **Source:** PRD Phase 1 (Image upload)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T4: Update demo script to output hosted URLs

**What to build:**
Update `packages/render/src/demo.tsx` to optionally upload rendered images to R2 and print the public URLs alongside the local file paths. This validates the full render → upload → URL pipeline.

**Acceptance criteria:**
- [ ] Demo outputs both local paths and R2 URLs
- [ ] R2 URLs are accessible and render correctly in browser
- [ ] Fallback to local-only if R2 credentials are missing

**Dependencies:** T2, T3

**Metadata:**
- **Source:** PRD Phase 1 (Image upload)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk
