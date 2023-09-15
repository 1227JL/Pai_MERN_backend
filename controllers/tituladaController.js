import Titulada from "../models/Titulada.js"

const crearTitulada = async (req, res) => {
    const { ficha } = req.body

    const existeTitulada = await Titulada.findOne({ficha})
    
    if(existeTitulada){
        const error = new Error(`La ficha ${ficha} ya se encuentra asociada a una titulada`)
        return res.status(400).json({msg: error.message})
    }
   
    try {
        const titulada = new Titulada(req.body)
        titulada.creador = req.usuario.id

        const tituladaAlmacenada = await titulada.save()
        res.json(tituladaAlmacenada)
    } catch (error) {
        res.send(error)
    }
}

const obtenerTituladas = async (req, res) => {
    const tituladas = await Titulada.find().select("-creador -instructores -aprendices -duracion -createdAt -updatedAt -__v")
    res.json(tituladas)
}

const obtenerTitulada = async (req, res) => {
    const { ficha } = req.params
    
    const titulada = await Titulada.findOne({ficha})

    if(!titulada){
        const error = new Error('Titulada no econtrada')
        return res.status(404).json({msg: error.message})
    }

    res.json(titulada)
}

const editarTitulada = async (req, res) => {
    const { ficha } = req.params

    const titulada = await Titulada.findOne({ficha})

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

    try {
        const tituladaAlmacenada = await titulada.save()
        res.json(tituladaAlmacenada)
    } catch (error) {
        console.log(error);
    }
}

export {
    crearTitulada,
    obtenerTituladas,
    obtenerTitulada,
    editarTitulada
}