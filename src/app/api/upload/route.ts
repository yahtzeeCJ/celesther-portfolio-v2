import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder')?.toString() || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Initializing S3 client for R2...');
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });

    const bucketName = process.env.R2_BUCKET_NAME || 'portfolio';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!publicDomain) {
      throw new Error("R2_PUBLIC_DOMAIN is missing");
    }

    // Determine file extension and MIME type
    const fileName = file.name.toLowerCase();
    let mimeType = file.type;
    const fileExtension = fileName.split('.').pop() || 'bin';

    // Map common 3D model extensions to their MIME types
    const extensionToMime: Record<string, string> = {
      'glb': 'model/gltf-binary',
      'gltf': 'model/gltf+json',
      'dae': 'model/vnd.collada+xml',
      'obj': 'model/obj',
      'fbx': 'application/octet-stream',
      'stl': 'model/stl',
      'blend': 'application/x-blender'
    };

    if (mimeType === 'application/octet-stream' || !mimeType) {
      mimeType = extensionToMime[fileExtension] || 'application/octet-stream';
    }

    // Generate a unique filename
    const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destination = `${folder}/${uniqueFileName}`.replace(/\/+/g, '/');

    console.log(`Uploading file: ${fileName} as ${mimeType}`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: destination,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    });

    await s3.send(command);

    const publicUrl = `${publicDomain}/${destination}`;
    console.log('File uploaded successfully:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mimeType,
      message: 'File uploaded successfully!',
    });

  } catch (error: unknown) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
