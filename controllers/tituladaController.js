import Instructor from "../models/Instructor.js"
import Titulada from "../models/Titulada.js"
import fs from 'fs'
import multer from "multer"; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directorio de destino para los archivos subidos
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop(); // Obtiene la extensión del archivo original
    cb(null, `${Date.now()}.${ext}`); // Asigna un nombre único al archivo
  },
});

const upload = multer({ storage }).single('file'); // 'file' debe coincidir con el nombre del campo en el formulario

const crearTitulada = async (req, res) => {
  // Llama al middleware 'multer' para procesar la carga del archivo
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Hubo un error al cargar el archivo');
    }

    const { ficha, ambiente, jornada } = req.body;
    const existeTitulada = await Titulada.findOne({ ficha });
    const ambienteNoDisponible = await Titulada.findOne({ambiente, jornada})
    const instructor = await Instructor.findById(req.body.instructor);

    if (existeTitulada) {
      // Elimina el archivo cargado si la titulada ya existe
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error(`La ficha ${ficha} ya se encuentra asociada a una titulada`);
      return res.status(400).json({ msg: error.message });
    }
  
    if (!instructor) {
      // Elimina el archivo cargado si el instructor no está registrado
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error('El instructor no se encuentra registrado');
      return res.status(400).json({ msg: error.message });
    }

    if(ambienteNoDisponible){
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error(`El ambiente ya cuenta con una titulada formandose en esa jornada`);
      return res.status(400).json({ msg: error.message });
    }

    try {
      const titulada = new Titulada(req.body);
      titulada.creador = req.usuario.id;
      titulada.instructores.push(instructor._id);
      titulada.ambiente = req.body.ambiente
      titulada.archivoAdjunto = req.file.filename;

      const tituladaAlmacenada = await titulada.save();

      const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id).populate({ path: 'ambiente', select: 'bloque numero'}).select("-__v -archivoAdjunto -createdAt -updatedAt -aprendices -instructores -duracion -creador")
      res.json(tituladaPopulada);
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al guardar la Titulada');
    }
  });
}

const obtenerTituladas = async (req, res) => {
  const tituladas = await Titulada.find().select("-instructores -updatedAt -__v").populate('ambiente')
  res.json(tituladas)
}

const obtenerTitulada = async (req, res) => {
  const { id } = req.params
  
  const titulada = await Titulada.findOne({ ficha: id })
  .populate({
    path: 'creador',
    select: 'nombre email'
  })
  .populate('instructores', 'nombre email')
  .populate('ambiente', 'bloque numero')
  .select('-__v');

  if(!titulada){
    const error = new Error('Titulada no econtrada')
    return res.status(404).json({msg: error.message})
  }

  res.json(titulada)
}

const editarTitulada = async (req, res) => {

  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Hubo un error al cargar el archivo');
    }
  
    const { id } = req.params;
    const { ficha, ambiente, jornada } = req.body;
    const { instructor, ...actualizacion } = req.body; // Desestructura los datos de actualización
    const titulada = await Titulada.findById(id);
    const instructorExiste = await Instructor.findOne({ _id: instructor });

    if(titulada.ficha != ficha){
      const existeTitulada = await Titulada.findOne({ ficha });
      console.log('La ficha que se ingreso en el form es disitna a la de la titulada')

      if (existeTitulada) {
        // Elimina el archivo cargado si la titulada ya existe
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        const error = new Error(`La ficha ${ficha} ya se encuentra asociada a una titulada`);
        return res.status(400).json({ msg: error.message });
      }
    }

    if ((ambiente._id && titulada.ambiente != ambiente._id) || (!ambiente._id && titulada.ambiente != ambiente)) {
      const ambienteNoDisponible = await Titulada.findOne({ ambiente, jornada });
      
      if (ambienteNoDisponible) {
        const error = new Error('El ambiente ya cuenta con una titulada formándose en esa jornada');
        return res.status(400).json({ msg: error.message });
      }
    }    

    if (!titulada) {
      return res.status(404).json({ msg: 'Titulada no existente' });
    }
    
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

    try {
      // Guarda la titulada actualizada en la base de datos
      const tituladaAlmacenada = await titulada.save();
  
      // Realiza un populate de los instructores y del creador
      const tituladaPopulada = await Titulada.findById(tituladaAlmacenada._id)
        .populate({ path: 'creador', select: 'nombre email' })
        .populate({ path: 'instructores', select: 'nombre email' })
        .populate({ path: 'ambiente', select: 'bloque numero'})
  
      res.json(tituladaPopulada);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  })
};  

const eliminarTitulada = async (req, res) => {
    const { id } = req.params

    const titulada = await Titulada.findById(id)

    if(!titulada){
      const error = new Error('Titulada no existente')
      return res.status(404).json({msg: error.message})
    }

    try {
      if (fs.existsSync(`./uploads/${titulada.archivoAdjunto}`)) {
        fs.unlinkSync(`./uploads/${titulada.archivoAdjunto}`);
      }

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