import Aprendiz from '../models/Aprendiz.js'
import Ingreso from "../models/Ingreso.js";

const registrarIngreso = async (req, res) => {
  const { usuario, objetos, vehiculo } = req.body;

  try {

    const usuarioExiste = await Aprendiz.findById(usuario)

    if(!usuarioExiste) {
      return res.status(400).json({ message: 'El aprendiz no existe' });
    }

    // Preparar la fecha de registro al comienzo del día
    const fechaRegistro = new Date();
    fechaRegistro.setHours(0, 0, 0, 0);

    // Verificar si existe un ingreso duplicado con la misma placa y fecha de registro
    const existeIngreso = await Ingreso.findOne({
      'vehiculo.placa': vehiculo.placa,
      'vehiculo.fechaRegistro': fechaRegistro
    });

    if (existeIngreso) {
      return res.status(400).json({ message: 'Ya existe un ingreso con la misma placa en la fecha especificada.' });
    }

    // Crear y guardar el nuevo ingreso si no hay duplicados
    const nuevoIngreso = new Ingreso({
      usuario,
      objetos,
      vehiculo: {
        ...vehiculo,
        fechaRegistro // Asegurarse de enviar esto para mantener la consistencia
      }
    });
    await nuevoIngreso.save();
    res.status(201).json(nuevoIngreso);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registrarSalida = async (req, res) => {
  try {
    const { idIngreso } = req.params; // Suponiendo que el ID del ingreso viene en los parámetros de la URL
    const fechaSalida = new Date(); // Usamos la fecha y hora actual para la salida

    const ingreso = await Ingreso.findByIdAndUpdate(
      idIngreso,
      { fechaSalida },
      { new: true }
    );
    if (!ingreso) {
      return res
        .status(404)
        .json({ msg: "No se encontró el ingreso con el ID proporcionado." });
    }
    res.json(ingreso);
  } catch (error) {
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

const obtenerIngresos = async (req, res) => {
  const ingresos = await Ingreso.find().select("-_v").sort({ fecha: -1 });
  res.json(ingresos);
};

const obtenerIngresosAprendiz = async (req, res) => {
  try {
    const { id } = req.params; // ID del aprendiz extraído de los parámetros de la URL
    const { date } = req.params; // Extraer la fecha de los parámetros de la URL

    const aprendizExiste = await Aprendiz.findById(id)

    if(!aprendizExiste){
      return res
        .status(404)
        .json({ msg: "Aprendiz no existente" });
    }

    if (!date) {
      return res
        .status(400)
        .json({ msg: "La fecha es requerida en el formato YYYY-MM-DD." });
    }

    const [year, month, day] = date.split("-").map(Number); // Descomponer la fecha y convertir a números

    // Crear la fecha de inicio y fin usando los valores proporcionados
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0); // Configurar al inicio del día
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 1); // Configurar al final del día

    // Consulta para encontrar los ingresos en la fecha especificada y que pertenecen al aprendiz dado
    const ingresos = await Ingreso.find({
      usuario: id,
      $or: [
        { fechaIngreso: { $gte: fechaInicio, $lt: fechaFin } },
        { fechaSalida: { $gte: fechaInicio, $lt: fechaFin } },
      ],
    }).select("-__v"); // Excluir el campo __v

    res.json(ingresos[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};

export {
  registrarIngreso,
  registrarSalida,
  obtenerIngresos,
  obtenerIngresosAprendiz,
};
