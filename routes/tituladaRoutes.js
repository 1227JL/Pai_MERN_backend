import express from 'express'
import { 
    crearTitulada,
    obtenerTituladas
} from '../controllers/tituladaController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerTituladas)
    .post(checkAuth, crearTitulada)


export default router