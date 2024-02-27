import mongoose from 'mongoose'

const tituladaSchema = mongoose.Schema(
    {
        programa: {
            type: String,
            required: true,
            trim: true
        },
        ficha: {
            type: Number,
            required: true,
        },
        tipo: {
            type: String,
            required: true,
            enum: ['Tecnologo', 'Técnico', 'Curso Corto']
        },
        jornada: {
            type: String,
            required: true,
            enum: ['Mañana', 'Tarde', 'Noche']
        },
        estado: {
            type: String,
            enum: ['Convocatoria', 'Etapa Lectiva', 'Etapa Productiva', 'Formación Finalizada'],
            default: 'Convocatoria',
        },
        modalidad: {
            type: String,
            required: true,
            enum: ['Presencial', 'Virtual']
        },
        instructores: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Instructor',
            }
        ],
        aprendices: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Aprendiz',
            }
        ],
        ambiente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ambiente'
        },
        duracion: {
            type: Number,
            required: true
        },
        archivoAdjunto: {
            type: String, // Puede ser una URL o un identificador de archivo
        },
        competencias: [
            {
                nombre: {
                    type: String,
                },
                serial: {
                    type: Number
                },
                estado: {
                    type: String,
                    enum: ['Pendiente', 'Realizada'],
                    default: 'Pendiente'
                }
            }
        ],
        creador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
        },
    },
    { timestamps: true }
)

const Titulada = mongoose.model('Titulada', tituladaSchema)

export default Titulada