import boto3
from botocore.exceptions import ClientError
import base64
import uuid
from typing import List, Dict
from config import settings
import io


class S3Service:
    """Service for handling AWS S3 uploads and operations with pre-signed URLs."""
    
    def __init__(self):
        """Initialize S3 client(s) with credentials from settings.

        Works against AWS S3 (no endpoint configured) or any S3-compatible
        service such as self-hosted MinIO (S3_ENDPOINT_URL set).
        """
        from botocore.config import Config

        self.bucket_name = settings.S3_BUCKET_NAME
        self.endpoint_url = settings.S3_ENDPOINT_URL or None
        # Endpoint used when signing pre-signed URLs. Must be reachable from the
        # browser; falls back to the server-side endpoint, then to AWS.
        self.public_endpoint_url = (
            settings.S3_PUBLIC_ENDPOINT_URL or settings.S3_ENDPOINT_URL or None
        )

        # AWS uses virtual-hosted addressing; self-hosted MinIO behind a single
        # (non-wildcard) domain needs path-style addressing.
        addressing_style = 'path' if self.endpoint_url else 'virtual'
        config = Config(
            signature_version='s3v4',
            s3={'addressing_style': addressing_style}
        )

        common = dict(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=config,
        )

        # Server-side client: handles put/get/delete. On Railway this should point
        # at the private network endpoint (free, fast egress).
        self.s3_client = boto3.client('s3', endpoint_url=self.endpoint_url, **common)

        # Signing client: pre-signed URLs are signed against this host so the
        # browser can fetch them. generate_presigned_url() makes no network call,
        # so pointing this at the public endpoint costs nothing.
        if self.public_endpoint_url and self.public_endpoint_url != self.endpoint_url:
            self.s3_public_client = boto3.client(
                's3', endpoint_url=self.public_endpoint_url, **common
            )
        else:
            self.s3_public_client = self.s3_client

    def ensure_bucket(self) -> None:
        """Create the configured bucket if it doesn't exist (idempotent).

        Needed for fresh MinIO instances, which start with no buckets. On AWS
        this is effectively a no-op since the bucket already exists.
        """
        if not self.bucket_name:
            return
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return
        except ClientError as e:
            code = e.response.get('Error', {}).get('Code', '')
            if code not in ('404', '403', 'NoSuchBucket'):
                raise

        try:
            if self.endpoint_url is None and settings.AWS_REGION != 'us-east-1':
                # AWS requires a location constraint outside us-east-1
                self.s3_client.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': settings.AWS_REGION},
                )
            else:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            print(f"Created bucket: {self.bucket_name}")
        except ClientError as e:
            code = e.response.get('Error', {}).get('Code', '')
            if code in ('BucketAlreadyOwnedByYou', 'BucketAlreadyExists'):
                return
            raise

    def _get_content_type(self, extension: str) -> str:
        """Get MIME type based on file extension."""
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        return content_types.get(extension.lower(), 'application/octet-stream')
    
    async def upload_base64_image(self, base64_image: str, folder: str = "styles") -> str:
        """
        Upload a base64 encoded image to S3 (private bucket).
        
        Args:
            base64_image: Base64 encoded image string (with or without data URL prefix)
            folder: Folder/prefix in S3 bucket (default: "styles")
            
        Returns:
            S3 key (e.g., "styles/uuid.jpg") - NOT a full URL
            
        Raises:
            Exception: If upload fails
        """
        try:
            # Parse base64 image
            if base64_image.startswith('data:'):
                # Extract the base64 part from data URL
                # Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
                header, base64_data = base64_image.split(',', 1)
                # Extract file extension from header
                mime_type = header.split(':')[1].split(';')[0]
                extension = mime_type.split('/')[1]  # e.g., 'jpeg', 'png'
                if extension == 'jpeg':
                    extension = 'jpg'
            else:
                # Raw base64, default to jpg
                base64_data = base64_image
                extension = 'jpg'
            
            # Generate unique filename
            filename = f"{uuid.uuid4()}.{extension}"
            key = f"{folder}/{filename}"
            
            # Decode base64 image
            image_data = base64.b64decode(base64_data)
            
            # Upload to S3 (PRIVATE - no ACL specified, defaults to private)
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_data,
                ContentType=self._get_content_type(extension)
                # Note: No ACL='public-read' - bucket is now private
            )
            
            # Return the S3 key (not a full URL)
            return key
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload image to S3: {str(e)}")
        except Exception as e:
            print(f"Error processing image: {e}")
            raise Exception(f"Failed to process image: {str(e)}")
        
    def upload_bytes(self, data: bytes, key: str, content_type: str = "application/octet-stream") -> str:
        """Upload raw bytes to S3."""
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=data,
            ContentType=content_type
        )
        return key
    
    async def upload_base64_images(self, base64_images: List[str], folder: str = "styles") -> List[str]:
        """
        Upload multiple base64 encoded images to S3.
        
        Args:
            base64_images: List of base64 encoded image strings
            folder: Folder/prefix in S3 bucket (default: "styles")
            
        Returns:
            List of S3 keys (not full URLs)
        """
        uploaded_keys = []
        
        for base64_image in base64_images:
            try:
                key = await self.upload_base64_image(base64_image, folder)
                uploaded_keys.append(key)
            except Exception as e:
                print(f"Error uploading image: {e}")
                # Continue with other images if one fails
                continue
        
        return uploaded_keys
    
    def generate_presigned_url(self, s3_key: str, expiration: int = None) -> str:
        """
        Generate a pre-signed URL for an S3 object.
        
        Args:
            s3_key: S3 key of the object (e.g., "styles/uuid.jpg")
            expiration: Time in seconds until the URL expires (default: from settings)
            
        Returns:
            Pre-signed URL that expires after the specified time
            
        Raises:
            Exception: If generation fails
        """
        if expiration is None:
            expiration = settings.PRESIGNED_URL_EXPIRATION
            
        try:
            url = self.s3_public_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Error generating pre-signed URL: {e}")
            raise Exception(f"Failed to generate pre-signed URL: {str(e)}")
    
    def generate_presigned_urls(self, s3_keys: List[str], expiration: int = None) -> Dict[str, str]:
        """
        Generate pre-signed URLs for multiple S3 objects.
        
        Args:
            s3_keys: List of S3 keys
            expiration: Time in seconds until URLs expire (default: from settings)
            
        Returns:
            Dictionary mapping S3 keys to pre-signed URLs
        """
        result = {}
        for key in s3_keys:
            try:
                result[key] = self.generate_presigned_url(key, expiration)
            except Exception as e:
                print(f"Error generating pre-signed URL for {key}: {e}")
                # Continue with other keys if one fails
                continue
        return result
    
    def delete_object(self, s3_key: str) -> bool:
        """
        Delete an object from S3.
        
        Args:
            s3_key: S3 key of the object to delete (e.g., "styles/uuid.jpg")
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            print(f"Deleted S3 object: {s3_key}")
            return True
        except ClientError as e:
            print(f"Error deleting S3 object {s3_key}: {e}")
            return False
    
    def delete_objects(self, s3_keys: List[str]) -> int:
        """
        Delete multiple objects from S3.
        
        Args:
            s3_keys: List of S3 keys to delete
            
        Returns:
            Number of successfully deleted objects
        """
        deleted_count = 0
        for key in s3_keys:
            if self.delete_object(key):
                deleted_count += 1
        return deleted_count
    
    async def download_to_temp(self, s3_key_or_url: str, temp_path: str) -> None:
        """
        Download an S3 object to a temporary local file.
        Accepts either an S3 key or a full S3 URL.
        
        Args:
            s3_key_or_url: S3 key (e.g., "styles/uuid.jpg") or full S3 URL
            temp_path: Local path where the file should be saved
            
        Raises:
            Exception: If download fails
        """
        try:
            # Determine if it's a key or URL
            if s3_key_or_url.startswith("https://"):
                # It's a full URL - extract the key
                # Format: https://bucket-name.s3.region.amazonaws.com/folder/filename.jpg
                url_parts = s3_key_or_url.split(f".s3.{settings.AWS_REGION}.amazonaws.com/")
                if len(url_parts) != 2:
                    raise ValueError(f"Invalid S3 URL format: {s3_key_or_url}")
                key = url_parts[1].split('?')[0]  # Remove any query params (e.g., from presigned URL)
            else:
                # It's already a key
                key = s3_key_or_url
            
            # Download the file
            self.s3_client.download_file(self.bucket_name, key, temp_path)
            
        except ClientError as e:
            print(f"Error downloading from S3: {e}")
            raise Exception(f"Failed to download from S3: {str(e)}")
        except Exception as e:
            print(f"Error processing S3 download: {e}")
            raise Exception(f"Failed to download: {str(e)}")


# Singleton instance
s3_service = S3Service()
