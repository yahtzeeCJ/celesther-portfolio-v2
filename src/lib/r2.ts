import { S3Client } from '@aws-sdk/client-s3';

/**
 * Shared Cloudflare R2 client (S3-compatible)
 * Uses environment variables for credentials.
 */
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'portfolio';

/**
 * Returns the public URL for a file stored in R2.
 * Uses the custom public domain set up in Cloudflare R2.
 */
export function getR2PublicUrl(key: string): string {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    if (publicDomain) {
        return `${publicDomain}/${key}`;
    }
    // Fallback: R2 public bucket URL format
    return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
}
