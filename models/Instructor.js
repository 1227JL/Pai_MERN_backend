import mongoose from "mongoose";

const instructorSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            required: true
        },
        identificacion: {
            type: Number,
            required: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            required: true
        },
        telefono: {
            type: Number,
            required: true
        },
        token: {
            type: String,
        },
        confirmado: {
            type: Boolean,
            default: false,     
        },
        contrato: {
            type: String,
            required: true,
            enum: ['Término Indefinido', 'Termino Fijo']
        },
        rol: {
            type: String,
            required: true,
            default: 'Instructor'
        },
        imagen: {
            type: String, // Puede ser una URL o un identificador de archivo
            required: true
        },
        horas: {
            type: Number,
            default: 0
        },
        tituladas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Titulada'
            }
        ],
        asignador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    },
    { timestamps: true }
)

const Instructor = mongoose.model('Instructor', instructorSchema)

export default Instructor