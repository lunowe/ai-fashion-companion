# AWS S3 Configuration Guide

## Required Environment Variables

Add the following to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=ai-fashion-companion-images
```

## S3 Bucket Setup

### 1. Create S3 Bucket

1. Log into AWS Console
2. Navigate to S3
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `ai-fashion-companion-images`)
5. Select your preferred region (e.g., `us-east-1`)
6. **Uncheck "Block all public access"** (we need public read access for images)
7. Create the bucket

### 2. Configure Bucket for Private Access

**Make the bucket private** (do NOT allow public access):

1. In the bucket settings, go to "Permissions"
2. Under "Block public access (bucket settings)", click "Edit"
3. **Enable all 4 checkboxes** to block all public access
4. Save changes

**Remove any existing public bucket policy:**

1. Go to "Bucket Policy"
2. Delete any existing policy or ensure it does NOT grant public read access
3. Leave it empty or use a restrictive policy

> [!IMPORTANT] > **The bucket should be completely private.** Pre-signed URLs will provide temporary access without making the bucket public.

### 3. Configure CORS

Add this CORS configuration to allow your frontend to access images:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

### 4. Create IAM User

1. Navigate to IAM in AWS Console
2. Click "Users" > "Add user"
3. Choose a username (e.g., `ai-fashion-companion-s3-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select "AmazonS3FullAccess" (or create a custom policy with just PutObject, GetObject, DeleteObject permissions)
8. Complete user creation
9. **Save the Access Key ID and Secret Access Key** - you'll need these for your `.env` file

## Installation

Install the required boto3 library:

```bash
pip install boto3
```

Or use the requirements file:

```bash
pip install -r requirements.txt
```

## Testing

See `test_s3_upload.py` in the backend directory for testing S3 functionality.

## Migration Notes

-   **Legacy Support**: The code maintains backward compatibility with existing local image paths
-   **New Uploads**: All new image uploads will go to S3
-   **Existing Images**: To migrate existing images from `static/styles/` to S3, you can create a migration script or leave them as-is (they'll continue to work for outfit generation)
