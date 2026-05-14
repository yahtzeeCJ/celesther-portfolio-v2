"use server";

import * as z from 'zod';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { SiteContent, DEFAULT_CONTENT } from '@/types/content';

const CONTENT_FILE_NAME = 'site-content.json';

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

if (!publicDomain) {
  throw new Error("R2_PUBLIC_DOMAIN environment variable is not set.");
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
});

interface SubmitContactFormResponse {
  success: boolean;
  error?: string;
}

export async function submitContactForm(
  data: z.infer<typeof contactSchema>
): Promise<SubmitContactFormResponse> {
  const validation = contactSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Invalid form data." };
  }

  console.log("Contact form submitted:", validation.data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}

interface UploadFileResponse {
  success: boolean;
  url?: string;
  error?: string;
  message?: string;
  details?: unknown;
}

interface UploadProgress {
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
}

export async function uploadToR2(
  base64Data: string,
  folder: string = "portfolio_uploads",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadFileResponse> {
  try {
    console.log('Uploading to R2 with bucket:', bucketName);
    const s3 = getS3Client();

    let mimeType = 'application/octet-stream';
    let fileExtension = 'bin';
    let cleanBase64 = base64Data;

    if (base64Data.includes(',')) {
      const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        cleanBase64 = matches[2];

        const mimeToExt: Record<string, string> = {
          'model/gltf+json': 'gltf',
          'model/gltf-binary': 'glb',
          'application/octet-stream': 'bin',
          'application/gltf+json': 'gltf',
          'application/gltf-binary': 'glb',
          'model/vnd.collada+xml': 'dae',
          'application/x-blender': 'blend'
        };

        fileExtension = mimeToExt[mimeType] || 'bin';
      } else {
        cleanBase64 = base64Data.split(',')[1];
      }
    }

    const fileBuffer = Buffer.from(cleanBase64, 'base64');
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const destination = `${folder}/${uniqueFilename}`.replace(/\/+/g, '/');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: destination,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    });

    await s3.send(command);

    if (onProgress) {
      onProgress({
        progress: 1,
        uploadedBytes: fileBuffer.length,
        totalBytes: fileBuffer.length
      });
    }

    const publicUrl = `${publicDomain}/${destination}`;
    console.log('File uploaded successfully:', publicUrl);

    return {
      success: true,
      url: publicUrl,
      message: 'File uploaded successfully!'
    };

  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return {
      success: false,
      error: errorMessage,
      details: error
    };
  }
}

interface DeleteFileResponse {
  success: boolean;
  error?: string;
}

export async function deleteFromR2(fileUrl: string): Promise<DeleteFileResponse> {
  try {
    if (!fileUrl.startsWith(`${publicDomain}/`)) {
      throw new Error("URL does not belong to the configured R2 bucket.");
    }

    const objectName = fileUrl.substring(`${publicDomain}/`.length);
    console.log(`Attempting to delete from R2: objectName='${objectName}'`);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    await getS3Client().send(command);
    console.log(`R2 deletion successful for object: ${objectName}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting from R2:", error);
    const err = error as Error;
    if (err.name === 'NotFound') {
      console.warn("File not found during deletion, but proceeding with cleanup");
      return { success: true };
    }
    return { success: false, error: err.message || "Unknown error during R2 deletion." };
  }
}

export interface RenameFileResponse {
  success: boolean;
  newUrl?: string;
  error?: string;
}

export async function renameInR2(oldUrl: string, newName: string): Promise<RenameFileResponse> {
  try {
    if (!oldUrl.startsWith(`${publicDomain}/`)) {
      throw new Error("URL does not belong to the configured R2 bucket.");
    }

    const encodedObjectName = oldUrl.substring(`${publicDomain}/`.length);
    const oldObjectName = decodeURIComponent(encodedObjectName);
    const fileExtension = oldObjectName.split('.').pop() || '';

    const pathParts = oldObjectName.split('/');
    pathParts[pathParts.length - 1] = `${newName}.${fileExtension}`;
    const newObjectName = pathParts.join('/');

    console.log(`Attempting to rename in R2: from='${oldObjectName}' to='${newObjectName}'`);

    const s3 = getS3Client();

    // Copy to new destination
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: encodeURI(`${bucketName}/${oldObjectName}`),
      Key: newObjectName,
    });
    
    await s3.send(copyCommand);

    // Delete old object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldObjectName,
    });

    await s3.send(deleteCommand);

    const newUrl = `${publicDomain}/${newObjectName}`;
    return {
      success: true,
      newUrl
    };
  } catch (error: unknown) {
    console.error("Error renaming in R2:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during R2 rename operation.";
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function saveSiteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  try {
    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: CONTENT_FILE_NAME,
      Body: JSON.stringify(content, null, 2),
      ContentType: 'application/json',
      CacheControl: 'no-cache',
    });

    await s3.send(command);
    return { success: true };
  } catch (error) {
    console.error("Failed to save site content to R2:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: CONTENT_FILE_NAME,
    });

    const response = await s3.send(command);
    const content = await response.Body?.transformToString();

    if (!content) {
      return DEFAULT_CONTENT;
    }

    const jsonContent = JSON.parse(content) as Partial<SiteContent>;

    return {
      ...DEFAULT_CONTENT,
      ...jsonContent,
      skillCategories: jsonContent.skillCategories || DEFAULT_CONTENT.skillCategories,
      projects: jsonContent.projects || DEFAULT_CONTENT.projects,
      techProficiencies: jsonContent.techProficiencies || DEFAULT_CONTENT.techProficiencies,
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
      console.log("No site content found in R2, returning default.");
    } else {
      console.error("Failed to fetch site content from R2:", error);
    }
    return DEFAULT_CONTENT;
  }
}

