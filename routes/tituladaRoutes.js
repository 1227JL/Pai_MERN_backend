import express from 'express'
import { 
    crearTitulada,
    obtenerTituladas,
    obtenerTitulada,
    editarTitulada,
    eliminarTitulada
} from '../controllers/tituladaController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerTituladas)
    .post(checkAuth, crearTitulada)

router
    .route('/:id')
    .get(checkAuth, obtenerTitulada)
    .put(checkAuth, editarTitulada)
    .delete(checkAuth, eliminarTitulada)

export default router