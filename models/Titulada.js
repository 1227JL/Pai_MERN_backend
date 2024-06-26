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
        titulo: {
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
                instructor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Instructor'
                },
                aCargo: {
                    type: Boolean,
                    default: false
                }
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
        duracion_etapa_lectiva: {
            type: Number,
            required: true
        },
        duracion_etapa_productiva: {
            type: Number,
            required: true
        },
        archivoAdjunto: {
            type: String, // Puede ser una URL o un identificador de archivo
        },
        competencias: [
            {
                descripcion_general: {
                    type: String,
                },
                codigo_norma: {
                    type: Number
                },
                nombre_competencia: {
                    type: String
                },
                duracion_maxima: {
                    type: Number
                },
                resultados_aprendizaje: [
                    {
                        type: String
                    }
                ],
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