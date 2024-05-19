import { generateV4ReadSignedUrl } from "../config/google_cloud.js";

const getFileTitulada = async (req, res) => {
    const { tituladaName, filename } = req.params;
    const filePath = `tituladas/${tituladaName}/${filename}`;

    try {
        const signedUrl = await generateV4ReadSignedUrl(filePath);
        res.send(signedUrl);  // Redirige al cliente directamente a la URL firmada
    } catch (error) {
        console.error('Failed to generate signed URL:', error);
        res.status(500).send('Failed to generate signed URL');
    }
}

export {
    getFileTitulada
}