import express from "express";
import {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
} from "../controllers/usuarioController.js";
import checkAuth from '../middleware/checkAuth.js'


const router = express.Router();

router.post('/', registrar)
router.post('/login', autenticar) // Autentica el usuario registrado
router.get('/confirmar/:token', confirmar) // Autentica el usuario registrado
router.post('/olvide-password', olvidePassword) // Genera el token que se envia al email para realizar el cambio de la contraseña
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)


export default router