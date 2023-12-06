import express from "express";
import checkAuth from '../middleware/checkAuth.js'
import {
    registrarInstructor,
    obtenerInstructores,
    obtenerInstructor,
    actualizarInstructor,
    eliminarInstructor
} from '../controllers/instructorController.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerInstructores)
    .post(checkAuth, registrarInstructor)

router
    .route('/:id')
    .put(checkAuth, actualizarInstructor)
    .delete(checkAuth, eliminarInstructor)

export default router