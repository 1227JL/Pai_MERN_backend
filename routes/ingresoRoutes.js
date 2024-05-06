import express from 'express'
import { registrarIngreso, registrarSalida, obtenerIngresos, obtenerIngresosAprendiz } from '../controllers/ingresoController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerIngresos)
    .post(checkAuth, registrarIngreso)

router
    .route('/:id/:date')
    .get(checkAuth, obtenerIngresosAprendiz)
    .post(checkAuth, registrarSalida)
export default router