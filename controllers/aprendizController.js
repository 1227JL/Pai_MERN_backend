import Aprendiz from "../models/Aprendiz.js";
import Titulada from "../models/Titulada.js";
import fs from "fs";

function eliminarArchivoSubido(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const registrarAprendiz = async (req, res) => {
  const { ficha } = req.params;
  const { nombre, documento, correo, telefono } = req.body;

  const existeTitulada = await Titulada.findOne({ ficha }).select('ficha');
  console.log(existeTitulada);

  // Verificar si nombre, documento, correo o telefono ya existen en la base de datos
  const existeAprendiz = await Aprendiz.findOne({
    $or: [{ nombre }, { documento }, { correo }, { telefono }],
  });

  if (existeAprendiz) {
    const error = new Error(`Aprendiz Existente`);
    return res.status(400).json({ msg: error.message });
  }

  try {
    const { ficha } = req.params;

    const tituladaExiste = await Titulada.findOne({ficha});

    if (!tituladaExiste) {
      return res.status(404).json({ msg: "Titulada no existente" });
    }

    const aprendizAlmacenado = await Aprendiz(req.body);
    aprendizAlmacenado.estado = tituladaExiste.estado == 'Convocatoria' ? 'Matriculado' : tituladaExiste.estado;
    aprendizAlmacenado.documentoAdjunto = req.file.filename;
    await aprendizAlmacenado.save();
    tituladaExiste.aprendices.push(aprendizAlmacenado);
    tituladaExiste.save();
    res.json(aprendizAlmacenado);
  } catch (error) {
    console.error(error.message);
    eliminarArchivoSubido(req.file?.path); // Eliminar el archivo subido solo en caso de error
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

export { registrarAprendiz };
