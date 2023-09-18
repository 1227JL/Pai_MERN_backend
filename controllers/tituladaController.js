import Instructor from "../models/Instructor.js"
import Titulada from "../models/Titulada.js"

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

        const tituladaAlmacenada = await titulada.save()
        res.json(tituladaAlmacenada)
    } catch (error) {
        res.send(error)
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
    const { id, instructor } = req.params

    const titulada = await Titulada.findById(id).populate({ path: 'creador', select: "nombre"}).select("-__v")
    const instructorExiste = await Instructor.findOne({id: instructor})

    if(!instructorExiste){
        const error = new Error('Instructor no existente')
        return res.status(404).json({msg: error.message})
    }

    if(!titulada){
        const error = new Error('Titulada no existente')
        return res.status(404).json({msg: error.message})
    }

    titulada.programa = req.body.programa || titulada.programa;
    titulada.ficha = req.body.ficha || titulada.ficha;
    titulada.tipo = req.body.tipo || titulada.tipo;
    titulada.jornada = req.body.jornada || titulada.jornada;
    titulada.modalidad = req.body.modalidad || titulada.modalidad;
    titulada.duracion = req.body.duracion || titulada.duracion;
    titulada.estado = req.body.estado || titulada.estado;
    titulada.instructores[0] = instructorExiste._id || titulada.instructor[0]

    try {
        const tituladaAlmacenada = await titulada.save()
        res.json(tituladaAlmacenada)
    } catch (error) {
        console.log(error);
    }
}

const eliminarTitulada = async (req, res) => {
    const { id } = req.params

    const titulada = await Titulada.findById(id)

    if(!titulada){
        const error = new Error('Titulada no existente')
        return res.status(404).json({msg: error.message})
    }

    if(titulada.creador.toString() !== req.usuario.id.toString()){
        const error = new Error('Acción no válida')
        return res.status(401).json({msg: error.message})
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