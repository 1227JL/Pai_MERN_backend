import express from "express";
import checkAuth from '../middleware/checkAuth.js'
import {
    registrarInstructor,
    obtenerInstructores
} from '../controllers/instructorController.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, obtenerInstructores)
    .post(checkAuth, registrarInstructor)


export default router