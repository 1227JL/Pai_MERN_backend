import Aprendiz from '../models/Aprendiz.js';
import multer from "multer"; 
import Titulada from '../models/Titulada.js';
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documentosAprendices'); // Directorio de destino para los archivos subidos
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop(); // Obtiene la extensión del archivo original
    cb(null, `${Date.now()}.${ext}`); // Asigna un nombre único al archivo
  },
});

const upload = multer({ storage }).single('documentoAdjunto'); // 'file' debe coincidir con el nombre del campo en el formulario

const registrarAprendiz = async (req, res) => {
    upload(req, res, async (err)=>{
        if(err){
          console.error(err);
          return res.status(500).send('Hubo un error al cargar el archivo');
        }

        const { nombre, documento, correo, telefono } = req.body;

        // Verificar si nombre, documento, correo o telefono ya existen en la base de datos
        const existeAprendiz = await Aprendiz.findOne({
          $or: [
            { nombre },
            { documento },
            { correo },
            { telefono }
          ]
        });

        if (existeAprendiz) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          const error = new Error(`Aprendiz Existente`);
          return res.status(400).json({ msg: error.message });
        }
    
        try {
            const { titulada } = req.body

            const tituladaExiste = await Titulada.findById(titulada)

            if(!tituladaExiste){
              return res.status(404).json({msg: 'Titulada no existente'})
            }

            const aprendizAlmacenado = await Aprendiz(req.body)
            aprendizAlmacenado.estado = tituladaExiste.estado
            aprendizAlmacenado.documentoAdjunto = req.file.filename
            await aprendizAlmacenado.save()
            tituladaExiste.aprendices.push(aprendizAlmacenado)
            tituladaExiste.save()
            res.json(aprendizAlmacenado)
        } catch (error) {
            console.log(error)
            res.status(500).send('Hubo un error al guardar el Aprendiz');
        }
    })
}

export {
    registrarAprendiz
}