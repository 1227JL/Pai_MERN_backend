import express from 'express'
import { registrarAprendiz } from '../controllers/aprendizController.js'

const router = express.Router()

router
    .route('/')
    .post(registrarAprendiz)

export default router