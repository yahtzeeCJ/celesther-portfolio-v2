import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const getS3Client = () => {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
};

const bucketName = process.env.R2_BUCKET_NAME || 'portfolio';
const publicDomain = process.env.R2_PUBLIC_DOMAIN;

export async function POST(request: Request) {
  try {
    const { filePath, contentType } = await request.json();

    if (!filePath || !contentType) {
      return NextResponse.json(
        { error: 'Missing filePath or contentType' },
        { status: 400 }
      );
    }

    if (!publicDomain) {
      throw new Error("R2_PUBLIC_DOMAIN is missing");
    }

    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 15 * 60 });

    return NextResponse.json({
      url,
      fields: {
        key: filePath,
        'Content-Type': contentType,
      }
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
