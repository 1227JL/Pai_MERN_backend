import Ambiente from "../models/Ambiente.js";

const registrarAmbiente = async (req, res, next) => {
    const { numero, bloque } = req.body
    const ambiente = await Ambiente.findOne({ numero, bloque })

    if (ambiente) {
        const error = new Error('Ambiente Existente')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const nuevoAmbiente = new Ambiente(req.body)
        nuevoAmbiente.creador = req.usuario.id

        const ambienteAlmacenado = await nuevoAmbiente.save()
        res.json(ambienteAlmacenado)
        next()
    } catch (error) {
        console.error(error)
        res.status(500).send('Hubo un error al guardar el Ambiente')
    }
}

const obtenerAmbientes = async (req, res) => {
    const ambientes = await Ambiente.find().populate('creador', 'nombre email')
    res.json(ambientes)
}

const actualizarAmbiente = async (req, res) =>{
    const { id } = req.params
    const { numero, bloque, ...actualizacion } = req.body
    const ambiente = await Ambiente.findById(id)
    
    if(ambiente?.numero != numero || ambiente?.bloque != bloque){
        const ambienteExiste = await Ambiente.findOne({numero, bloque})
    
        if(ambienteExiste){
            const error = new Error('Ambiente Existente')
            return res.status(400).json({msg: error.message})
        }
    }

    if (!ambiente) {
        const error = new Error('Ambiente no existente')
        return res.status(404).json({ msg: error.message });
    }

    // Actualiza los campos de la titulada con los valores proporcionados en req.body
    for (const key in actualizacion) {
        if (actualizacion.hasOwnProperty(key)) {
          ambiente[key] = actualizacion[key];
        }
    }

    ambiente.numero = numero
    ambiente.bloque = bloque

    try {
        const ambienteAlmacenado = await ambiente.save()

        const ambientePopulado = await Ambiente.findById(ambienteAlmacenado._id).populate('creador', 'nombre email') 
        res.json(ambientePopulado)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}

const eliminarAmbiente = async (req, res) =>{
    const { id } = req.params
    const ambiente = await Ambiente.findById(id)

    if(!ambiente){
      const error = new Error('Ambiente no existente')
      return res.status(404).json({msg: error.message})
    }

    try {
        await ambiente.deleteOne()
        res.json({msg: 'Ambiente Eliminado Correctamente'})
    } catch (error) {
        console.log(error)
        res.status(500).send('Hubo un error al eliminar el Ambiente')
    }
}

export {
    registrarAmbiente,
    obtenerAmbientes,
    actualizarAmbiente,
    eliminarAmbiente
}