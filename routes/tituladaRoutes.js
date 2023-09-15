import express from 'express'
import { 
    crearTitulada,
    obtenerTituladas,
    obtenerTitulada,
    editarTitulada
} from '../controllers/tituladaController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerTituladas)
    .post(checkAuth, crearTitulada)

router
    .route('/:ficha')
    .get(checkAuth, obtenerTitulada)
    .put(checkAuth, editarTitulada)
    .delete(checkAuth, )

export default router