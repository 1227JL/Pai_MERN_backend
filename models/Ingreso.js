import mongoose from 'mongoose';

const ingresoSchema = new mongoose.Schema({
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
    placa: String,
  },
  fechaIngreso: {
    type: Date,
    index: true  // Este índice individual ya se define aquí
  }
});

// Definir índice compuesto directamente en el esquema
ingresoSchema.index({ "vehiculo.placa": 1, "vehiculo.fechaIngreso": 1 }, { unique: true });

// Middleware para ajustar fechaRegistro al guardar un nuevo documento
ingresoSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  this.fechaIngreso = new Date(this.createdAt);
  this.fechaIngreso.setHours(0, 0, 0, 0);  // Ajustar al inicio del día
  next();
});

const Ingreso = mongoose.model('Ingreso', ingresoSchema);

export default Ingreso;
