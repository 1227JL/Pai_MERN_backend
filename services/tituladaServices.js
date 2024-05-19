import { generateV4ReadSignedUrl } from "../config/google_cloud.js";

const getFileTitulada = async (req, res) => {
  const { tituladaName, filename } = req.params;
  const filePath = `tituladas/${tituladaName}/${filename}`;

  try {
    const signedUrl = await generateV4ReadSignedUrl(filePath);
    res.send(signedUrl); // Redirige al cliente directamente a la URL firmada
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
    res.status(500).send("Failed to generate signed URL");
  }
};


const obtenerAprendices = async (req, res) => {
    const { id } = req.params;
    const { aprendices } = await Titulada.findById(id).populate({
      path: "aprendices",
      select: "nombre telefono tipoDocumento rh estado email documento",
    });
    res.json(aprendices);
  };
  
  const obtenerInstructores = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Encontrar todos los instructores cuyo array de tituladas incluya el id especificado
      const titulada = await Titulada.findById(id).populate({
        path: "instructores.instructor",
        select: "nombre identificacion",
      });
  
      if (!titulada) {
        return res.status(404).json({ message: "Titulada no encontrada" });
      }
  
      // Extraer los instructores y el estado de aCargo
      const instructores = titulada.instructores.map((instructorObj) => ({
        _id: instructorObj._id,
        nombre: instructorObj.instructor.nombre,
        identificacion: instructorObj.instructor.identificacion,
        aCargo: instructorObj.aCargo,
      }));
  
      res.json(instructores);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al obtener los instructores" });
    }
  };
  
  const obtenerCompetencias = async (req, res) => {
    const { id } = req.params
  
    const { competencias } = await Titulada.findById(id).select('competencias')
    res.json(competencias)
  }

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