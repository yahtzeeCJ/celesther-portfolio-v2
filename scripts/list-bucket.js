const { Storage } = require('@google-cloud/storage');
const path = require('path');

const projectId = 'celesthers-digital-canvas';
const bucketName = 'celesthers-digital-canvas-portfolio';
const keyFile = path.join(process.cwd(), 'service-account-key.json');

const storage = new Storage({
    projectId,
    keyFilename: keyFile,
});

async function listFiles() {
    try {
        const [files] = await storage.bucket(bucketName).getFiles({
            prefix: 'project2/',
        });

        console.log('Files in project2/:');
        files.forEach(file => {
            console.log(`- ${file.name}`);
        });
    } catch (error) {
        console.error('Error listing files:', error);
    }
}

listFiles();
