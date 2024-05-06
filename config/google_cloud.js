import { Storage } from "@google-cloud/storage";

// Inicializa el cliente de GCS
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Función para subir un archivo
async function uploadFile(sourceFilePath, destinationBlobName) {
  const bucketName = process.env.GCS_BUCKET_NAME;
  try {
    await storage.bucket(bucketName).upload(sourceFilePath, {
      destination: destinationBlobName,
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error; // Relanzar el error para manejarlo más arriba en la pila de llamadas
  }
}

// Ejemplo de función para listar archivos
async function listFiles() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  const [files] = await storage.bucket(bucketName).getFiles();
  console.log("Files:");
  files.forEach((file) => console.log(file.name));
}

// Ejemplo de función para descargar un archivo
async function downloadFile(fileName, destination) {
  const options = {
    destination: destination,
  };

  await storage.bucket(bucketName).file(fileName).download(options);

  console.log(`Downloaded ${fileName} to ${destination}`);
}

async function generateV4ReadSignedUrl(filepath) {
  const bucketName = process.env.GCS_BUCKET_NAME;
  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutos de validez
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(filepath)
    .getSignedUrl(options);
  return url;
}

async function deleteDirectory(directoryName) {
    const bucketName = process.env.GCS_BUCKET_NAME;
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: directoryName });
  
    const deletePromises = files.map(file => file.delete());
    await Promise.all(deletePromises);
    console.log(`Todos los archivos en ${directoryName} han sido eliminados.`);
  }
  

export { listFiles, downloadFile, uploadFile, generateV4ReadSignedUrl, deleteDirectory };
