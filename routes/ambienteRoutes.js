import express from 'express'
import { 
    registrarAmbiente,
    obtenerAmbientes 
} from '../controllers/ambienteController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerAmbientes)
    .post(checkAuth, registrarAmbiente)

export default router