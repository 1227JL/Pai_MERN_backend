import Ingreso from "../models/Ingreso.js";

const registrarIngreso = async (req, res) => {
  try {
    // Extraer datos del vehículo
    const { placa } = req.body.vehiculo;
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    // Buscar ingresos existentes con la misma placa en la misma fecha
    const existeIngreso = await Ingreso.findOne({
      'vehiculo.placa': placa,
      createdAt: {
        $gte: fechaHoy,
        $lt: new Date(fechaHoy.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existeIngreso) {
      return res.status(400).json({ msg: "El vehículo con esta placa ya fue registrado hoy." });
    }

    // Crear y guardar el nuevo ingreso si no hay conflictos
    const ingreso = new Ingreso(req.body);
    await ingreso.save();
    res.json(ingreso);
  } catch (error) {
    return res.status(500).json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
}

const registrarSalida = async (req, res) => {
  try {
    const { idIngreso } = req.params;  // Suponiendo que el ID del ingreso viene en los parámetros de la URL
    const fechaSalida = new Date();  // Usamos la fecha y hora actual para la salida

    const ingreso = await Ingreso.findByIdAndUpdate(idIngreso, { fechaSalida }, { new: true });
    if (!ingreso) {
      return res.status(404).json({ msg: "No se encontró el ingreso con el ID proporcionado." });
    }
    res.json(ingreso);
  } catch (error) {
    return res.status(500).json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
}

const obtenerIngresos = async (req, res) => {
  const ingresos = await Ingreso.find().select("-_v").sort({ fecha: -1 });
  res.json(ingresos);
};

const obtenerIngresosAprendiz = async (req, res) => {
  try {
    const { id } = req.params;  // ID del aprendiz extraído de los parámetros de la URL
    const { date } = req.params;  // Extraer la fecha de los parámetros de la URL

    if (!date) {
      return res.status(400).json({ msg: "La fecha es requerida en el formato YYYY-MM-DD." });
    }

    const [year, month, day] = date.split('-').map(Number);  // Descomponer la fecha y convertir a números

    // Crear la fecha de inicio y fin usando los valores proporcionados
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0);  // Configurar al inicio del día
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 1);  // Configurar al final del día

    // Consulta para encontrar los ingresos en la fecha especificada y que pertenecen al aprendiz dado
    const ingresos = await Ingreso.find({
      usuario: id,
      $or: [
        { createdAt: { $gte: fechaInicio, $lt: fechaFin } },
        { fechaSalida: { $gte: fechaInicio, $lt: fechaFin } }
      ]
    }).select("-__v");  // Excluir el campo __v

    res.json(ingresos);
  } catch (error) {
    return res.status(500).json({ msg: error.message || "Hubo un error al procesar la solicitud" });
  }
};



export { registrarIngreso, registrarSalida, obtenerIngresos, obtenerIngresosAprendiz };
