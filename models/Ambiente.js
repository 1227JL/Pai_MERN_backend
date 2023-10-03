import mongoose from "mongoose";

const ambienteSchema = mongoose.Schema(
    {
        numero: {
            type: Number,
            required: true,
        },
        bloque: {
            type: String,
            enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            required: true
        },
        capacidad: {
            type: Number,
            required: true
        },
        categoria: {
            type: String,
            enum: ['Cocina', 'Informática', 'Otro'], // Enumera las categorías posibles
            required: true
        },
        estado: {
            type: String,
            enum: ['Disponible', 'No Disponible', 'En Mantenimiento'],
            default: 'Disponible',
        },
        creador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
        }
    }
)

const Ambiente = mongoose.model('Ambiente', ambienteSchema)

export default Ambiente