import mongoose from "mongoose";
import bcrypt from 'bcrypt';


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
        // password: {
        //     type: String,
        //     required: true,
        //     trim: true
        // },
        email: {
            type: String,
            trim: true,
            required: true
        },
        telefono: {
            type: Number,
            required: true
        },
        // token: {
        //     type: String,
        // },
        // confirmado: {
        //     type: Boolean,
        //     default: false,     
        // },
        contrato: {
            type: String,
            required: true,
            enum: ['Término Indefinido', 'Término Fijo']
        },
        // rol: {
        //     type: String,
        //     required: true,
        //     default: 'Instructor'
        // },
        area: {
            type: String,
            required: true,
            enum: ['Deportes', 'Gastronomia', 'Sistemas', 'Gestion', 'Idiomas']
        },
        estado: {
            type: String,
            required: true,
            enum: ['Activo', 'Inactivo', 'Vacaciones'],
            default: 'Activo',
        },
        // imagen: {
        //     type: String, // Puede ser una URL o un identificador de archivo
        // },
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


instructorSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

instructorSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Instructor = mongoose.model('Instructor', instructorSchema)

export default Instructor