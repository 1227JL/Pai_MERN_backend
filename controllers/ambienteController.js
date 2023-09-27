import Ambiente from "../models/Ambiente.js";

const registrarAmbiente = async (req, res) => {
    const { numero, bloque } = req.body

    try {
        const ambiente = await Ambiente.findOne({ numero, bloque })

        if (ambiente) {
            const error = new Error('Ambiente existente')
            return res.status(400).json({ msg: error.message })
        }

        const nuevoAmbiente = new Ambiente(req.body)
        nuevoAmbiente.creador = req.usuario.id

        const ambienteAlmacenado = await nuevoAmbiente.save()
        res.json(ambienteAlmacenado)
    } catch (error) {
        console.error(error)
        res.status(500).send('Hubo un error al guardar el Ambiente')
    }
}


const obtenerAmbientes = async (req, res) => {
    const ambientes = await Ambiente.find()
    res.json(ambientes)
}

export {
    registrarAmbiente,
    obtenerAmbientes
}