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
            enum: ["Informática o de Computo",
            "Cocina",
            "Gestión",
            "Enfermería",
            "Idiomas",
            "Electricidad y Electrónica",
            "Construcción y Obras Civiles",
            "Agricultura y Agroindustria",
            "Automotriz y Mecánica Industrial",
            "Turismo y Hotelería",
            "Arte y Cultura",
            "Recursos Naturales y Medio Ambiente",
            "Seguridad y Salud en el Trabajo",
            "Diseño Gráfico y Multimedia",
            "Logística y Transporte",
            "Mecánica de Aviación",
            "Energías Renovables y Medio Ambiente",
            "Tecnologías de la Información y Comunicación (TIC)",
            "Finanzas y Contabilidad",
            "Salud y Belleza",
            "Gastronomía y Repostería"], // Enumera las categorías posibles
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