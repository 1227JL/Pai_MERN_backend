import Instructor from "../models/Instructor.js";
import generarId from "../helpers/generarId.js";
import generarPassword from "../helpers/generarPassword.js";
import { emailRegistroInstructor } from "../helpers/emails.js";

const registrarInstructor = async (req, res) => {
    const { identificacion } = req.body

    const instructorExiste = await Instructor.findOne({identificacion})

    if(instructorExiste){
        const error = new Error(`El instructor con la identificacion ${identificacion} ya se encuentra registrado`)
        return res.status(400).json({msg: error.message})
    }

    try {
        const instructor = await Instructor(req.body)
        instructor.asignador = req.usuario.id
        // instructor.token = generarId()
        // instructor.password = generarPassword()
        
        // emailRegistroInstructor({
        //     email: instructor.email,
        //     nombre: instructor.nombre,
        //     token: instructor.token,
        //     password: instructor.password
        // })

        await instructor.save()
    
        res.json({msg: 'Instructor Registrado Correctamente'})
    } catch (error) {
        res.send(error)
    }
}

const obtenerInstructores = async (req, res) => {
    const instructores = await Instructor.find().select("-__v -tituladas")
    res.json(instructores)
}

const obtenerInstructor = async (req, res) => {
    const { id } = req.params

    const instructor = await Instructor.findOne({identificacion: id})

    if(!instructor){
        const error = new Error('Instructor no existente')
        return res.status(404).json({msg: error.message})
    }

    res.json(instructor);
    console.log(instructor)
}

const actualizarInstructor = async (req, res) => {

}

const eliminarInstructor = async (req, res) => {
    const { id } = req.params

    const instructor = await Instructor.findById(id)

    if(!instructor){
        const error = new Error('Instructor no existente')
        return res.status(404).json({msg: error.message})
    }

    try {
        await instructor.deleteOne()
        res.json({msg: 'Instructor Eliminado'})
    } catch (error) {
        console.log(error);
    }
}

export {
    registrarInstructor,
    obtenerInstructores,
    obtenerInstructor,
    actualizarInstructor,
    eliminarInstructor
}