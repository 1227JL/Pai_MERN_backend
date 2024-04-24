import mongoose from 'mongoose';

const ingresoSChema = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aprendiz',
        required: true
    },
    objetos: [{
        type: String,
        required: true
    }],
    vehiculo: {
        tipo: {
            type: String,
            enum: ['moto', 'carro', 'bicicleta', 'ninguno'],
            default: 'ninguno'
        },
        placa: {
            type: String,
            unique: true,
            sparse: true,
            required: function() { return this.vehiculo.tipo === 'moto' || this.vehiculo.tipo === 'carro'; }
        }
    },
    fechaSalida: {
        type: Date
    }
}, { timestamps: true });

const Ingreso = mongoose.model('Ingreso', ingresoSChema);

export default Ingreso;
