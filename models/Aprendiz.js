import mongoose from 'mongoose';

const aprendizSchema = mongoose.Schema({
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
        trim: true
    },
    tipoDocumento: {
        type: String,
        enum: ['Cédula de Ciudadania', 'Tarjeta de Identidad', 'Cédula de Extranjeria'],
        default: 'Cédula de Ciudadania'
    },
    nacimiento: {
        type: Date,
        required: true
    },
    rh: {
        type: String,
        required: true  
    },
    documentoAdjunto: {
        type: String, // Puede ser una URL o un identificador de archivo
    },
    estado: {
        type: String,
        required: true,
        enum: ['Matriculado', 'Etapa Lectiva', 'Etapa Productiva', 'Formación Finalizada', 'Decersión'],
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    tituladaId: {  // Vinculación con la titulada
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Titulada'
    }
}, { timestamps: true });

const Aprendiz = mongoose.model('Aprendiz', aprendizSchema);

export default Aprendiz;
