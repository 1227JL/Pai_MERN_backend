import Aprendiz from "../models/Aprendiz.js";
import Titulada from "../models/Titulada.js";
import fs from "fs";
import { spawn } from "child_process";

function eliminarArchivoSubido(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const registrarAprendiz = async (req, res) => {
  const { id } = req.params;
  const { nombre, documento, correo, telefono } = req.body;
  // Verificar si nombre, documento, correo o telefono ya existen en la base de datos

  try {
    const existeAprendiz = await Aprendiz.findOne({
      $or: [{ nombre }, { documento }, { correo }, { telefono }],
    });

    const tituladaExiste = await Titulada.findById(id).select("estado aprendices");

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
    const nacimiento = new Date(
      dateParts[2],
      dateParts[1] - 1,
      dateParts[0]
    );

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

export { registrarAprendiz };
