import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";
import generarId from "../helpers/generarId.js";
import generatJWT from "../helpers/generarJWT.js";
import Usuario from "../models/Usuario.js";

const registrar = async (req, res) => {
    const { email } = req.body

    const existeUsuario = await Usuario.findOne({email})

    if(existeUsuario){
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({msg: error.message})
    }

    try {
        const usuario = await Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()

        // Enviar Email
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: 'Usuario Creado Correctamente, Revisa tu email para confirmar tu cuenta'})
    } catch (error) {
        res.send(error)
    }
}

const autenticar = async (req, res) => {
    const { email, password } = req.body

    const usuario = await Usuario.findOne({email})

    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(400).json({msg: error.message})
    }

    if(!usuario.confirmado){
        const error = new Error('Tu Cuenta no ha sido confirmada')
        return res.status(403).json({msg: error.message})
    }

    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generatJWT(usuario._id),
        })
    }else{
        const error = new Error('La contraseña es incorrecta')
        return res.status(403).json({msg: error.message})
    }
} 

const confirmar = async (req, res) => {
    const { token } = req.params

    const usuarioConfirmar = await Usuario.findOne({token})

    if(!usuarioConfirmar){
        const error = new Error('Token no válido')
        return res.status(403).json({msg: error.message})
    }

    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = '';
        await usuarioConfirmar.save()
        res.json({msg: 'Usuario Confirmado Corectamente'})
    } catch (error) {
        console.log(error);
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body

    const usuario = await Usuario.findOne({email})

    if(!usuario){
        const error = new Error('El Usuario no existe')
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId()
        await usuario.save();
        
        // Enviar Email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: 'Hemos enviado un email con las instrucciones'})
    }catch(error){
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params

    const tokenValido = await Usuario.findOne({token})

    if(tokenValido){
        res.json({msg: 'Token válido, el usuario existe'})
    }else{
        const error = new Error('Token no válido')
        return res.status(403).json({msg: error.message})
    }
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({token})

    if(usuario){
        usuario.password = password
        usuario.token = ''

        try {
            await usuario.save()
            res.json({msg: 'Password modificado correctamente'})
        } catch (error) {
            console.log(error);
        }
    }else{
        const error = new Error('Token no válido')
        return res.status(403).json({msg: error.message})
    }
}

const perfil = async (req, res) => {
    const { usuario } = req
    res.json(usuario)
}


export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
}