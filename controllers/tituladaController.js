import Instructor from "../models/Instructor.js"
import Titulada from "../models/Titulada.js"
import fs from 'fs'

const crearTitulada = async (req, res) => {
  const { ficha } = req.body

  const existeTitulada = await Titulada.findOne({ficha})
  const instructor = await Instructor.findById(req.body.instructor)
  
  if(existeTitulada){
    const error = new Error(`La ficha ${ficha} ya se encuentra asociada a una titulada`)
    return res.status(400).json({msg: error.message})
  }
  
  if(!instructor){
    const error = new Error('El instructor no se encuentra registrado')
    return res.status(400).json({msg: error.message})
  }

  try {
    const titulada = new Titulada(req.body)
    titulada.creador = req.usuario.id
    titulada.instructores.push(instructor._id)
    titulada.archivoAdjunto = req.file.filename

    const tituladaAlmacenada = await titulada.save()
    res.json(tituladaAlmacenada)
  } catch (error) {
    console.error(error)
    res.status(500).send('Hubo un error al guardar la Titulada')
  }
}

const obtenerTituladas = async (req, res) => {
  const tituladas = await Titulada.find().select("-instructores -updatedAt -__v")
  res.json(tituladas)
}

const obtenerTitulada = async (req, res) => {
  const { id } = req.params
  
  const titulada = await Titulada.findOne({ficha: id}).populate({ path: 'creador', select: "nombre email"}).populate('instructores', "nombre email").select("-__v")

  if(!titulada){
    const error = new Error('Titulada no econtrada')
    return res.status(404).json({msg: error.message})
  }

  res.json(titulada)
}

const editarTitulada = async (req, res) => {
  const { id } = req.params;
  const { instructor, ...actualizacion } = req.body; // Desestructura los datos de actualización

  try {
    const titulada = await Titulada.findById(id);

    if (!titulada) {
      return res.status(404).json({ msg: 'Titulada no existente' });
    }

    const instructorExiste = await Instructor.findOne({ _id: instructor });

    if (!instructorExiste) {
      return res.status(404).json({ msg: 'Instructor no existente' });
    }

    // Actualiza los campos de la titulada con los valores proporcionados en req.body
    for (const key in actualizacion) {
      if (actualizacion.hasOwnProperty(key)) {
        titulada[key] = actualizacion[key];
      }
    }

    // Actualiza el primer instructor (puedes ajustar esta lógica según tus necesidades)
    if (instructorExiste._id) {
      titulada.instructores[0] = instructorExiste._id;
    }

    if(req.file){
      if (fs.existsSync(`./uploads/${titulada.archivoAdjunto}`)) {
        fs.unlinkSync(`./uploads/${titulada.archivoAdjunto}`);
      }
      titulada.archivoAdjunto = req.file.filename
    }

    // Guarda la titulada actualizada en la base de datos
    const tituladaAlmacenada = await titulada.save();

    // Realiza un populate de los instructores y del creador
    const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
      .populate({ path: 'creador', select: 'nombre email' })
      .populate({ path: 'instructores', select: 'nombre email' });

  res.json(tituladaPopulada);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};  

const eliminarTitulada = async (req, res) => {
    const { id } = req.params

    const titulada = await Titulada.findById(id)

    if(!titulada){
      const error = new Error('Titulada no existente')
      return res.status(404).json({msg: error.message})
    }

    try {
      await titulada.deleteOne()
      res.json({msg: 'Titulada Eliminada'})
    } catch (error) {
      console.log(error);
    }
}

export {
    crearTitulada,
    obtenerTituladas,
    obtenerTitulada,
    editarTitulada,
    eliminarTitulada
}