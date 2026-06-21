# Cloudflare R2 Setup for Widget Images

## Overview

This guide sets up a Cloudflare R2 bucket to host rendered widget images for Discord embeds. R2 provides S3-compatible object storage with global CDN and automatic image optimization.

## Prerequisites

- Cloudflare account (free tier works)
- Access to Cloudflare Dashboard

## Step 1: Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**
4. Configure:
   - **Bucket name**: `discord-widgets`
   - **Location**: Automatic (closest to your users)
   - **Storage class**: Standard
5. Click **Create bucket**

## Step 2: Enable Public Access

### Option A: Use r2.dev Subdomain (Recommended for Quick Setup)

1. In the bucket settings, go to **Settings** tab
2. Find **Public access** section
3. Click **Allow Access**
4. Note the public URL: `https://pub-<hash>.r2.dev`

### Option B: Use Custom Domain (Recommended for Production)

1. In bucket **Settings**, go to **Custom domains**
2. Click **Connect domain**
3. Enter your domain (e.g., `widgets.yourdomain.com`)
4. Follow DNS verification steps
5. Wait for SSL certificate provisioning

## Step 3: Configure CORS

1. In bucket **Settings**, go to **CORS policy**
2. Add the following policy:

```json
[
  {
    "AllowedOrigins": [
      "https://discord.com",
      "https://cdn.discordapp.com",
      "https://media.discordapp.net"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

This allows Discord's image proxy to fetch widget images.

## Step 4: Configure Lifecycle Rules

1. In bucket **Settings**, go to **Lifecycle rules**
2. Click **Create lifecycle rule**
3. Configure:
   - **Rule name**: `auto-delete-24h`
   - **Prefix**: `widgets/` (optional, to scope the rule)
   - **Action**: Delete objects
   - **Condition**: Days since object creation: `1`
4. Click **Save**

This auto-deletes objects after 24 hours, keeping storage costs minimal.

## Step 5: Generate API Credentials

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure:
   - **Token name**: `discord-widgets-upload`
   - **Permissions**: Object Read & Write
   - **Specify bucket**: `discord-widgets`
   - **TTL**: Optional (or no expiration)
4. Click **Create API Token**
5. **Save the credentials** (they won't be shown again):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

## Step 6: Configure Environment Variables

Create or update `.env` in the project root:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_BUCKET_NAME=discord-widgets
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
# Or with custom domain: https://widgets.yourdomain.com
```

## Step 7: Verify Setup

### Test Public Access

```bash
# Upload a test file via Cloudflare Dashboard or rclone
# Then verify it's accessible:
curl -I https://pub-<hash>.r2.dev/widgets/test.png
```

Expected response headers:
- `Content-Type: image/png`
- `Access-Control-Allow-Origin: *`

### Test CORS

```bash
curl -I -X OPTIONS \
  -H "Origin: https://discord.com" \
  -H "Access-Control-Request-Method: GET" \
  https://pub-<hash>.r2.dev/widgets/test.png
```

## Bucket Structure

```
discord-widgets/
├── widgets/          # Rendered widget images
│   ├── rss-feed-{timestamp}.png
│   ├── crypto-{timestamp}.png
│   └── weather-{timestamp}.png
└── demos/            # Demo images (optional)
```

## Cost Estimation

R2 pricing (as of 2024):
- **Storage**: $0.015/GB/month
- **Class A operations** (writes): $4.50/million
- **Class B operations** (reads): $0.36/million
- **Egress**: Free (no bandwidth fees)

For a widget service generating ~1000 images/day with 24h TTL:
- Storage: ~50MB active (50KB × 1000 images × 24h retention)
- Cost: < $0.01/month

## Security Considerations

1. **CORS Policy**: Only allows Discord origins (can be expanded if needed)
2. **Lifecycle Rules**: Auto-deletes after 24h minimizes exposure
3. **API Tokens**: Use least-privilege (only write to specific bucket)
4. **Public URLs**: Consider adding signed URLs for private widgets in future

## Troubleshooting

### Images not loading in Discord
- Verify CORS policy includes Discord origins
- Check bucket is set to public access
- Ensure image URLs are HTTPS

### 403 Forbidden
- Verify API token has correct permissions
- Check bucket name matches configuration
- Ensure endpoint URL is correct

### Images not auto-deleting
- Verify lifecycle rule is enabled
- Check rule prefix matches your object keys
- Wait 24 hours for first deletion cycle

## Next Steps

After R2 setup, proceed to:
- T2: Add image upload utility to render package
- T3: Add R2 credentials to env package
- T4: Update demo script to output hosted URLs
