const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  barril_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Barril', 
    required: true
  },
  tipo_notificacion: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  usuario_receptor: {
    type: [String],  
    required: true
  }
});

module.exports = mongoose.model('Notificacion', notificacionSchema, 'notificaciones');
