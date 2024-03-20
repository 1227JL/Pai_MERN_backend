import { spawn } from "child_process";
import Instructor from "../models/Instructor.js";
import Titulada from "../models/Titulada.js";
import fs from "fs";

const crearTitulada = async (req, res) => {
  // Llama al middleware 'multer' para procesar la carga del archivo

  const { ficha, ambiente, jornada } = req.body;
  const existeTitulada = await Titulada.findOne({ ficha });
  const ambienteNoDisponible = await Titulada.findOne({ ambiente, jornada });
  const instructor = await Instructor.findById(req.body.instructor);

  if (existeTitulada) {
    // Elimina el archivo cargado si la titulada ya existe
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const error = new Error(
      `La ficha ${ficha} ya se encuentra asociada a una titulada`
    );
    return res.status(400).json({ msg: error.message });
  }

  if (!instructor) {
    // Elimina el archivo cargado si el instructor no está registrado
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const error = new Error("El instructor no se encuentra registrado");
    return res.status(400).json({ msg: error.message });
  }

  if (ambienteNoDisponible) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const error = new Error(
      `El ambiente ya cuenta con una titulada formándose en esa jornada`
    );
    return res.status(400).json({ msg: error.message });
  }

  try {
    const pythonProcess = spawn("python", ["test/pdfreader.py", req.file.path]);

    let contenidoExtraidoDelPDF = ''; // Aquí almacenaremos el contenido extraído del PDF

    // Capturar la salida del script de Python
    pythonProcess.stdout.on("data", (data) => {
      contenidoExtraidoDelPDF += data.toString('utf8');
    });

    
    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
    
    // Cuando el proceso de Python ha terminado
    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        // Proceso exitoso, puedes continuar con la lógica para guardar la titulada en la base de datos
        // Por ejemplo:
        const titulada = new Titulada(req.body);
        titulada.creador = req.usuario.id;
        titulada.instructores.push(instructor._id);
        titulada.ambiente = req.body.ambiente;
        titulada.archivoAdjunto = req.file.filename;
        titulada.competencias = JSON.parse(contenidoExtraidoDelPDF); // Asignamos las competencias extraídas


        const tituladaAlmacenada = await titulada.save();

        const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
        .populate({ path: 'ambiente', select: 'bloque numero' })
        .select('-__v -archivoAdjunto -createdAt -updatedAt -aprendices -instructores -duracion -creador');
        
        res.json(tituladaPopulada);
      } else {
        // Si el proceso de Python falla
        res.status(500).send("Error al procesar el archivo PDF");
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al guardar la Titulada");
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
    .populate("aprendices")
    .populate({
      path: "aprendices",
      populate: {
        path: "creador",
        select: "nombre email", // Los campos que desees obtener del creador del aprendiz
      },
    })
    .select("-__v");

  if (!titulada) {
    const error = new Error("Titulada no econtrada");
    return res.status(404).json({ msg: error.message });
  }
  res.json(titulada);
};

const editarTitulada = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Hubo un error al cargar el archivo");
    }

    const { id } = req.params;
    const { ficha, ambiente, jornada } = req.body;
    const { instructor, ...actualizacion } = req.body; // Desestructura los datos de actualización
    const titulada = await Titulada.findById(id);
    const instructorExiste = await Instructor.findOne({ _id: instructor });

    if (titulada.ficha != ficha) {
      const existeTitulada = await Titulada.findOne({ ficha });

      if (existeTitulada) {
        // Elimina el archivo cargado si la titulada ya existe
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        const error = new Error(
          `La ficha ${ficha} ya se encuentra asociada a una titulada`
        );
        return res.status(400).json({ msg: error.message });
      }
    }

    if (
      (ambiente?._id && titulada?.ambiente != ambiente?._id) ||
      (!ambiente?._id && titulada?.ambiente != ambiente)
    ) {
      const ambienteNoDisponible = await Titulada.findOne({
        ambiente,
        jornada,
      });

      if (ambienteNoDisponible) {
        const error = new Error(
          "El ambiente ya cuenta con una titulada formándose en esa jornada"
        );
        return res.status(400).json({ msg: error.message });
      }
    }

    if (!titulada) {
      return res.status(404).json({ msg: "Titulada no existente" });
    }

    if (!instructorExiste) {
      return res.status(404).json({ msg: "Instructor no existente" });
    }

    // Actualiza los campos de la titulada con los valores proporcionados en req.body
    for (const key in actualizacion) {
      if (actualizacion.hasOwnProperty(key)) {
        titulada[key] = actualizacion[key];
      }
    }

    // Actualiza el primer instructor (puedes ajustar esta lógica según tus necesidades)
    if (instructorExiste) {
      titulada.instructores[0] = instructorExiste._id;
    }

    if (req.file) {
      if (fs.existsSync(`./uploads/${titulada.archivoAdjunto}`)) {
        fs.unlinkSync(`./uploads/${titulada.archivoAdjunto}`);
      }
      titulada.archivoAdjunto = req.file.filename;
    }

    try {
      // Guarda la titulada actualizada en la base de datos
      const tituladaAlmacenada = await titulada.save();

      // Realiza un populate de los instructores y del creador
      const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
        .populate({ path: "creador", select: "nombre email" })
        .populate({ path: "instructores", select: "nombre email" })
        .populate({ path: "ambiente", select: "bloque numero" })
        .populate("aprendices");

      res.json(tituladaPopulada);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Error interno del servidor" });
    }
  });
};

const eliminarTitulada = async (req, res) => {
  const { id } = req.params;

  const titulada = await Titulada.findById(id);

  if (!titulada) {
    const error = new Error("Titulada no existente");
    return res.status(404).json({ msg: error.message });
  }

  try {
    if (fs.existsSync(`./uploads/${titulada.archivoAdjunto}`)) {
      fs.unlinkSync(`./uploads/${titulada.archivoAdjunto}`);
    }

    await titulada.deleteOne();
    res.json({ msg: "Titulada Eliminada Correctamente" });
  } catch (error) {
    console.log(error);
  }
};

export {
  crearTitulada,
  obtenerTituladas,
  obtenerTitulada,
  editarTitulada,
  eliminarTitulada,
};
