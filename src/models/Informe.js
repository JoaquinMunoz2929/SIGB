const mongoose = require('mongoose');

const informeSchema = new mongoose.Schema({
  tipo_informe: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  mes: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  anio: {
    type: Number,
    required: true,
    min: 2000
  },
  contenido: [
    {
      barril_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barril',
        required: true
      },
      movimientos: [
        {
          tipo_movimiento: {
            type: String,
            required: true,
            trim: true
          },
          ubicacion_origen: {
            type: String,
            trim: true
          },
          ubicacion_destino: {
            type: String,
            trim: true
          },
          usuario_responsable: {
            type: String,
            trim: true
          },
          observacion: {
            type: String,
            trim: true
          },
          fecha_movimiento: {
            type: Date,
            required: true
          }
        }
      ]
    }
  ]
}, {
  timestamps: true,
  collection: 'informes'  // nombre explícito de colección
});

module.exports = mongoose.model('Informe', informeSchema);
