import { spawn } from "child_process";
import Instructor from "../models/Instructor.js";
import Titulada from "../models/Titulada.js";
import fs from "fs";
import capitalize from "../helpers/capitalize.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function eliminarArchivoSubido(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const crearTitulada = async (req, res) => {
  try {
    const { ficha, ambiente, jornada } = req.body;
    const existeTitulada = await Titulada.findOne({ ficha });
    const ambienteNoDisponible = await Titulada.findOne({ ambiente, jornada });
    const instructor = await Instructor.findById(req.body.instructor);

    if (existeTitulada) {
      throw new Error(
        `La ficha ${ficha} ya se encuentra asociada a una titulada`
      );
    }

    if (!instructor) {
      throw new Error("El instructor no se encuentra registrado");
    }

    if (ambienteNoDisponible) {
      throw new Error(
        `El ambiente ya cuenta con una titulada formándose en esa jornada`
      );
    }

    let contenidoExtraidoDelPDF = ""; // Aquí almacenaremos el contenido extraído del PDF

    const pythonProcess = spawn("python", [
      "scripts/pdfreaderTitulada.py",
      req.file.path,
    ]);

    pythonProcess.stdout.on("data", (data) => {
      contenidoExtraidoDelPDF += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Error al procesar el archivo PDF"));
        }
      });
    });

    const objetoExtraido = JSON.parse(contenidoExtraidoDelPDF);

    // Si llegamos aquí, el proceso fue exitoso, entonces procedemos con el guardado en la base de datos
    const tituloCapitalize = capitalize(objetoExtraido.titulada_info.titulo);
    const titulada = new Titulada({
      ...req.body,
      programa: objetoExtraido.titulada_info.programa,
      titulo: tituloCapitalize,
      creador: req.usuario.id,
      instructores: [instructor._id],
      archivoAdjunto: req.file.filename,
      competencias: objetoExtraido.competencias,
      duracion_etapa_lectiva:
        objetoExtraido.titulada_info.duracion_etapa_lectiva,
      duracion_etapa_productiva:
        objetoExtraido.titulada_info.duracion_etapa_productiva,
    });
    const tituladaAlmacenada = await titulada.save();
    const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
      .populate({ path: "ambiente", select: "bloque numero" })
      .select(
        "-__v -archivoAdjunto -createdAt -updatedAt -aprendices -instructores -duracion -creador"
      );

    res.json(tituladaPopulada);
  } catch (error) {
    console.error(error.message);
    eliminarArchivoSubido(req.file?.path); // Eliminar el archivo subido solo en caso de error
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

const obtenerTituladas = async (req, res) => {
  const tituladas = await Titulada.find()
    .select("-instructores -updatedAt -__v")
    .populate("ambiente");

  res.json(tituladas);
};

const obtenerTitulada = async (req, res) => {
  const { id } = req.params;

  const titulada = await Titulada.findOne({ ficha: id })
    .populate({
      path: "creador",
      select: "nombre email",
    })
    .populate("instructores", "nombre email")
    .populate("ambiente", "bloque numero")
    .populate({
      path: "aprendices",
      select: "nombre email estado documento", // Solo incluye estos campos
    })
    .select("-__v -competencias.resultados_aprendizaje");

  if (!titulada) {
    const error = new Error("Titulada no econtrada");
    return res.status(404).json({ msg: error.message });
  }
  res.json(titulada);
};

const editarTitulada = async (req, res) => {
  const { id } = req.params;
  let instructorExiste = null;

  // Encuentra la titulada primero para asegurar que exista
  const titulada = await Titulada.findById(id);
  if (!titulada) {
    return res.status(404).json({ msg: "Titulada no existente" });
  }

  // Extrae el instructor del req.body si se envía y verifica su existencia
  const { instructor, ...camposParaActualizar } = req.body;
  if (instructor && instructor !== titulada.instructores.toString()) {
    instructorExiste = await Instructor.findOne({ _id: instructor });
    if (!instructorExiste) {
      return res.status(404).json({ msg: "Instructor no existente" });
    }
  }

  // Preparar campos para actualizar, excluyendo aquellos no enviados en req.body
  Object.keys(camposParaActualizar).forEach((key) => {
    if (camposParaActualizar[key] !== undefined) {
      // Solo actualiza campos enviados en req.body
      titulada[key] = camposParaActualizar[key];
    }
  });

  // Actualizar instructor si existe
  if (instructorExiste) {
    titulada.instructores[0] = instructorExiste._id;
  }

  // Procesamiento del archivo, si se adjunta
  if (req.file) {
    if (
      titulada.archivoAdjunto &&
      fs.existsSync(`./uploads/${titulada.archivoAdjunto}`)
    ) {
      fs.unlinkSync(`./uploads/${titulada.archivoAdjunto}`);
    }
    titulada.archivoAdjunto = req.file.filename;
  }

  try {
    const tituladaAlmacenada = await titulada.save();
    const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
      .populate("creador", "nombre email")
      .populate("instructores", "nombre email")
      .populate("ambiente", "bloque numero")
      .populate("aprendices");

    res.json(tituladaPopulada);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const eliminarTitulada = async (req, res) => {
  const { id } = req.params;

  try {
    const titulada = await Titulada.findById(id);

    if (!titulada) {
      const error = new Error("Titulada no existente");
      return res.status(404).json({ msg: error.message });
    }

    // Elimina todos los aprendices asociados a la titulada
    await Aprendiz.deleteMany({ tituladaId: id });

    // Construye la ruta del archivo de manera segura
    const archivoPath = path.join(
      __dirname,
      "..",
      "uploads",
      "disenosCurriculares",
      titulada.archivoAdjunto
    );

    // Verifica si el archivo existe y luego intenta eliminarlo
    if (fs.existsSync(archivoPath)) {
      fs.unlinkSync(archivoPath);
    } else {
      console.log(
        "El archivo no existe, pero el registro será eliminado de todos modos."
      );
    }

    // Elimina el registro de la base de datos
    await titulada.deleteOne();
    res.json({ msg: "Titulada eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar titulada:", error);
    res.status(500).json({ msg: "Error al eliminar titulada" });
  }
};

const obtenerCompetencia = async (req, res) => {
  const { id, competencia } = req.params;

  try {
    const titulada = await Titulada.findById(id).select("competencias");

    const competenciaFiltrada = titulada.competencias.filter(
      (competenciaState) => competenciaState._id == competencia
    );
    if (!titulada) {
      throw new Error("Titulada no existente");
    }
    if (!competenciaFiltrada) {
      throw new Error("Competencia no existente");
    }

    res.json(competenciaFiltrada[0]);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

export {
  crearTitulada,
  obtenerTituladas,
  obtenerTitulada,
  editarTitulada,
  eliminarTitulada,
  obtenerCompetencia,
};
