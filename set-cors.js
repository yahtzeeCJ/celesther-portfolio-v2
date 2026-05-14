const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function setCors() {
  const bucketName = process.env.R2_BUCKET_NAME;
  console.log(`Setting CORS for bucket: ${bucketName}`);

  const command = new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:3000', 
            'https://myportfolio-rho-amber-65.vercel.app', 
            'https://myportfolio-2bgri7wtr-yahtzeecjs-projects.vercel.app',
            'https://celesther.com',
            'https://*.vercel.app'
          ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    await s3Client.send(command);
    console.log('CORS configuration successfully updated!');
  } catch (error) {
    console.error('Error setting CORS:', error);
  }
}

setCors();
