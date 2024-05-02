import {Storage} from '@google-cloud/storage'

// Inicializa el cliente de GCS
const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});


// Función para subir un archivo
async function uploadFile(sourceFilePath, destinationBlobName) {
    const bucketName = process.env.GCS_BUCKET_NAME;
    try {
        await storage.bucket(bucketName).upload(sourceFilePath, {
            destination: destinationBlobName,
        });
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw error; // Relanzar el error para manejarlo más arriba en la pila de llamadas
    }
}

// Ejemplo de función para listar archivos
async function listFiles() {
    const bucketName = process.env.GCS_BUCKET_NAME;
    const [files] = await storage.bucket(bucketName).getFiles();
    console.log('Files:');
    files.forEach(file => console.log(file.name));
}

// Ejemplo de función para descargar un archivo
async function downloadFile(fileName, destination) {
    const options = {
        destination: destination,
    };

    await storage
        .bucket(bucketName)
        .file(fileName)
        .download(options);

    console.log(`Downloaded ${fileName} to ${destination}`);
}

export { listFiles, downloadFile, uploadFile };
