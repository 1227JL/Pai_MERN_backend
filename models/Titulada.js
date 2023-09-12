import moongose from 'mongoose'

const tituladaSchema = moongose.Schema(
    {
        programa: {
            type: String,
            required: true,
            trim: true
        },
        ficha: {
            type: Number,
            trim: true,
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
            required: true,
            enum: ['Convocatoria', 'En Formación', 'En Etapa Productiva', 'Formación Finalizada']
        },
        modalidad: {
            type: String,
            required: true,
            enum: ['Presencial', 'Virtual']
        },

    }
)