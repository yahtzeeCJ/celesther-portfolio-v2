import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load .env.local manually
try {
    const env = readFileSync('.env.local', 'utf8');
    env.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
} catch { }

const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function setCors() {
    console.log('Setting CORS on R2 bucket:', process.env.R2_BUCKET_NAME);
    await r2.send(new PutBucketCorsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedOrigins: ['*'],
                    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders: ['ETag'],
                    MaxAgeSeconds: 3600,
                },
            ],
        },
    }));
    console.log('✅ CORS configured successfully on R2 bucket!');
}

setCors().catch(err => {
    console.error('❌ Failed to set CORS:', err.message);
    process.exit(1);
});
