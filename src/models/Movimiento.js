const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  barril_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barril',
    required: [true, 'El ID del barril es obligatorio']
  },
  tipo_movimiento: {
    type: String,
    enum: {
      values: ['Traslado', 'Mantenimiento', 'Limpieza', 'Producción', 'Venta', 'Otro', 'Entrega', 'Revisión'],
      message: 'Tipo de movimiento no válido'
    },
    required: [true, 'El tipo de movimiento es obligatorio']
  },
  ubicacion_origen: {
    type: String,
    required: [true, 'La ubicación de origen es obligatoria'],
    trim: true
  },
  ubicacion_destino: {
    type: String,
    required: [true, 'La ubicación de destino es obligatoria'],
    trim: true
  },
  usuario_responsable: {
    type: String,
    required: [true, 'El responsable del movimiento es obligatorio'],
    trim: true
  },
  observacion: {
    type: String,
    default: '',
    trim: true
  },
  fecha_movimiento: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'movimientos'
});

// Índices recomendados para trazabilidad y consultas
movimientoSchema.index({ barril_id: 1, fecha_movimiento: -1 });

module.exports = mongoose.models.Movimiento || mongoose.model('Movimiento', movimientoSchema);
