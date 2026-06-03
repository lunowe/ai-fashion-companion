# MinIO on Railway — Storage Setup

FitFlow stores images in S3-compatible object storage. This guide sets up
[MinIO](https://min.io/) (a self-hosted, S3-compatible server) on Railway as a
drop-in replacement for AWS S3. The backend code is unchanged — only environment
variables differ.

## 1. Deploy MinIO

In your Railway project:

1. **New → Database → Add MinIO** (or "Deploy from template" → search "MinIO").
2. After it deploys, open the MinIO service and note its credentials
   (`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` — these become your access key /
   secret key).
3. **Attach a Volume** to the MinIO service (Settings → Volumes) mounted at the
   data path the template uses (commonly `/data`). Without a volume, images are
   lost on every redeploy.
4. **Expose the API port publicly**: Settings → Networking → Generate Domain for
   the **API port (9000)**. This gives a public URL like
   `https://minio-production-xxxx.up.railway.app`. (Port 9001 is the web console —
   keep that private or behind login.)

## 2. Networking model

Two endpoints, on purpose:

| Endpoint | Used for | Example |
|---|---|---|
| **Private** (`*.railway.internal`) | Backend uploads / downloads / deletes — free, fast egress | `http://minio.railway.internal:9000` |
| **Public** (`*.up.railway.app`) | Signing pre-signed URLs the **browser** fetches | `https://minio-production-xxxx.up.railway.app` |

Pre-signed URLs are signed against the host the browser will use, so they must be
signed with the **public** endpoint. The backend talks to MinIO over the private
endpoint to avoid egress charges. The code uses two boto3 clients for exactly this
reason (`s3_client` for I/O, `s3_public_client` for signing).

> Find the private hostname under the MinIO service → Settings → Networking →
> "Private Networking". The port is MinIO's API container port (9000).

## 3. Backend environment variables

Set these on the **backend** service in Railway (Variables tab):

```env
# Credentials = MinIO root user / password
AWS_ACCESS_KEY_ID=<MINIO_ROOT_USER>
AWS_SECRET_ACCESS_KEY=<MINIO_ROOT_PASSWORD>
AWS_REGION=us-east-1                 # MinIO ignores this; any value is fine
S3_BUCKET_NAME=fitflow-images

# S3-compatible endpoints (this is what switches storage from AWS to MinIO)
S3_ENDPOINT_URL=http://minio.railway.internal:9000
S3_PUBLIC_ENDPOINT_URL=https://minio-production-xxxx.up.railway.app

# Optional: how long pre-signed URLs stay valid (seconds)
PRESIGNED_URL_EXPIRATION=3600
```

Notes:
- `S3_PUBLIC_ENDPOINT_URL` must be **HTTPS** with no port (Railway's public domain
  is on 443). If you omit it, signing falls back to `S3_ENDPOINT_URL`.
- The bucket (`S3_BUCKET_NAME`) is **created automatically on startup** via
  `s3_service.ensure_bucket()` — no manual bucket creation needed.

## 4. CORS (only if needed)

Displaying images via `<img src=...>` does **not** require CORS. You only need CORS
on MinIO if the frontend `fetch()`es image bytes directly. If so, configure MinIO's
bucket CORS to allow your frontend origin for `GET`/`HEAD`.

## 5. Verify

1. Redeploy the backend after setting the variables.
2. Check logs for `Created bucket: fitflow-images` (first boot) and no storage
   warnings.
3. Upload a clothing item / style image and confirm it renders — the image URL
   should now be `https://<public-minio-domain>/<bucket>/<key>?X-Amz-...`.

## Local development

Run MinIO locally with Docker and point the same variables at it:

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -v "$PWD/minio-data:/data" \
  minio/minio server /data --console-address ":9001"
```

```env
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=fitflow-images
S3_ENDPOINT_URL=http://localhost:9000
S3_PUBLIC_ENDPOINT_URL=http://localhost:9000
```

## Migrating from AWS

There is nothing to migrate — the previous AWS data is gone, and existing MongoDB
rows reference dead S3 keys. New uploads work immediately. Old broken references can
be left as-is (users re-upload) or cleared with `scripts/clean_images.py`.

To switch **back** to AWS at any time, just unset `S3_ENDPOINT_URL` /
`S3_PUBLIC_ENDPOINT_URL` and provide AWS credentials — the code reverts to AWS
virtual-hosted addressing automatically.
