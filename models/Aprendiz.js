import mongoose from 'mongoose'

const aprendizSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: Number,
            required: true,
            trim: true
        },
        documento: {
            type: Number,
            required: true,
            trim: true
        },
        tipoDocumento: {
            type: String,
            required: true,
            enum: ['Cédula de Ciudadania', 'Tarjeta de Identidad', 'Cédula de Extranjeria']
        },
        documentoAdjunto: {
            type: String, // Puede ser una URL o un identificador de archivo
        },
        estado: {
            type: String,
            required: true,
            enum: ['Convocatoria', 'Etapa Lectiva', 'Etapa Productiva', 'Formación Finalizada', ,'Decersión'],
        },
        creador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
        },
    },
    { timestamps: true }
)

const Aprendiz = mongoose.model('Aprendiz', aprendizSchema)

export default Aprendiz