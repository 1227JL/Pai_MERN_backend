import express from 'express'
import { 
    registrarAmbiente,
    obtenerAmbientes,
    actualizarAmbiente,
    eliminarAmbiente
} from '../controllers/ambienteController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerAmbientes)
    .post(checkAuth, registrarAmbiente)

router
    .route('/:id')
    .put(checkAuth, actualizarAmbiente)
    .delete(checkAuth, eliminarAmbiente)

export default router