import Aprendiz from '../models/Aprendiz.js'; // Importa el modelo Aprendiz
import Titulada from '../models/Titulada.js'; // Importa el modelo Titulada
import { generateV4ReadSignedUrl } from "../config/google_cloud.js";

const asociarTituladaAAprendiz = async (idAprendiz, idTitulada) => {
  // Encuentra el aprendiz por ID
  const aprendiz = await Aprendiz.findById(idAprendiz);
  if (!aprendiz) {
    throw new Error('Aprendiz no encontrado');
  }

  // Verifica si la titulada ya está asociada
  if (aprendiz.tituladas.includes(idTitulada)) {
    throw new Error('La titulada ya está asociada a este aprendiz');
  }

  // Encuentra la titulada por ID y verifica su existencia
  const titulada = await Titulada.findById(idTitulada);
  if (!titulada) {
    throw new Error('Titulada no encontrada');
  }

  // Asocia la titulada al aprendiz
  aprendiz.tituladas.push(idTitulada);
  await aprendiz.save();
  
//   Opcionalmente, también puedes querer agregar el aprendiz a la titulada
  titulada.aprendices.push(idAprendiz);
  await titulada.save();

  return aprendiz; // Retorna el aprendiz actualizado
};

const getFileAprendiz = async (req, res) => {
  const { aprendiz, filename } = req.params;
  const filePath = `aprendices/${aprendiz}/${filename}`;

  try {
      const signedUrl = await generateV4ReadSignedUrl(filePath);
      res.send(signedUrl);  // Redirige al cliente directamente a la URL firmada
  } catch (error) {
      console.error('Failed to generate signed URL:', error);
      res.status(500).send('Failed to generate signed URL');
  }
}

export { asociarTituladaAAprendiz, getFileAprendiz };
