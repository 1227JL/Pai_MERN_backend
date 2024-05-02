import Aprendiz from "../models/Aprendiz.js";
import Titulada from "../models/Titulada.js";
import fs from "fs";
import { spawn } from "child_process";
import mongoose from "mongoose";
import { asociarTituladaAAprendiz } from "../services/aprendizService.js";

function eliminarArchivoSubido(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const registrarAprendiz = async (req, res) => {
  const { id } = req.params;
  const { email, telefono } = req.body;
  // Verificar si nombre, documento, correo o telefono ya existen en la base de datos

  try {
    const existeAprendiz = await Aprendiz.findOne({
      $or: [{ email }, { telefono }],
    });

    const tituladaExiste = await Titulada.findById(id).select(
      "estado aprendices"
    );

    if (existeAprendiz) {
      const error = new Error(`Aprendiz Existente`);
      return res.status(400).json({ msg: error.message });
    }

    if (!tituladaExiste) {
      return res.status(404).json({ msg: "Titulada no existente" });
    }

    let contenidoExtraidoDelPDF = ""; // Aquí almacenaremos el contenido extraído del PDF

    const pythonProcess = spawn("python", [
      "scripts/readerID.py",
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

    const dateString = objetoExtraido.nacimiento;
    const dateParts = dateString.split("/");

    // Cambia el orden de DD/MM/YYYY a YYYY-MM-DD
    const nacimiento = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

    const nuevoAprendiz = new Aprendiz({
      ...req.body,
      nombre: objetoExtraido.nombre,
      documento: objetoExtraido.documento,
      nacimiento: nacimiento,
      rh: objetoExtraido.rh,
      estado:
        tituladaExiste.estado == "Convocatoria"
          ? "Matriculado"
          : tituladaExiste.estado,
      documentoAdjunto: req.file.filename,
      creador: req.usuario._id,
    });

    await nuevoAprendiz.save();
    tituladaExiste.aprendices.push(nuevoAprendiz);
    tituladaExiste.save();
    res.json(nuevoAprendiz);
  } catch (error) {
    console.error(error.message);
    eliminarArchivoSubido(req.file?.path); // Eliminar el archivo subido solo en caso de error
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

const obtenerAprendiz = async (req, res) => {
  const { id } = req.params;
  try {
    const aprendiz = await Aprendiz.findOne({ documento: id }).select("-_v");

    if (!aprendiz) {
      throw new Error("Aprendiz no existente");
    }

    res.json(aprendiz);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

const eliminarAprendiz = async (req, res) => {
  const { id } = req.params;
  try {
    const aprendiz = await Aprendiz.findById(id);

    if (!aprendiz) {
      throw new Error("Aprendiz no existente");
    }

    await aprendiz.deleteOne();
    res.json({ msg: "Aprendiz Eliminado Correctamente" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

const agregarTituladaAAprendiz = async (req, res) => {
  try {
    const { idAprendiz, idTitulada } = req.params; // Suponiendo que pasas estos parámetros en la URL
    const aprendizActualizado = await asociarTituladaAAprendiz(
      idAprendiz,
      idTitulada
    );
    res.status(200).json(aprendizActualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const obtenerTituladasAprendiz = async (req, res) => {
  try {
    const { id } = req.params; // Asegúrate de que 'id' se obtiene correctamente de los parámetros de la URL

    // Encuentra el aprendiz por ID y pobla el array de 'tituladas'
    const aprendiz = await Aprendiz.findById(id)
      .select("tituladas -_id") // Selecciona solo el campo 'tituladas' y excluye '_id'
      .populate({
        path: "tituladas", // Especifica el path que quieres poblar
        select:
          "programa ficha titulo jornada estado modalidad instructores ambiente", // Campos específicos para incluir en la población
        populate: [
          {
            path: "instructores", // Poblar los instructores dentro de tituladas
            match: { aCargo: true }, // Solo incluye instructores donde aCargo es true
            populate: {
              path: 'instructor',
              select: 'nombre'
            }
          },
          {
            path: "ambiente", // Poblar los instructores dentro de tituladas
            select: 'bloque numero'
          }
        ]
      });

    if (!aprendiz) {
      return res.status(404).json({ message: "Aprendiz no encontrado" });
    }

    res.json(aprendiz.tituladas); // Devuelve solo las tituladas asociadas
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export {
  registrarAprendiz,
  obtenerAprendiz,
  eliminarAprendiz,
  agregarTituladaAAprendiz,
  obtenerTituladasAprendiz,
};
