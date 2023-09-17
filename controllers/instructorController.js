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

export {
    registrarInstructor,
    obtenerInstructores
}