const mongoose = require("mongoose");

const BarrilSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del barril es obligatorio"],
    trim: true,
    minlength: [3, "El nombre del barril debe tener al menos 3 caracteres"],
    maxlength: [100, "El nombre del barril no puede exceder los 100 caracteres"],
  },
  estado: {
    type: String,
    required: [true, "El estado del barril es obligatorio"],
    enum: {
      values: ["En uso", "Vacío", "Mantenimiento"],
      message: "El estado debe ser uno de los siguientes: 'En uso', 'Vacío' o 'Mantenimiento'",
    },
  },
  ubicacion: {
    type: String,
    required: [true, "La ubicación del barril es obligatoria"],
    trim: true,
    minlength: [3, "La ubicación debe tener al menos 3 caracteres"],
    maxlength: [100, "La ubicación no puede exceder los 100 caracteres"],
  },

  // Historial de movimientos relacionados
  historial_movimientos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movimiento"
    }
  ],

  // Fecha de creación (inmutable)
  fecha_registro: {
    type: Date,
    default: Date.now,
    immutable: true,
  }
}, {
  timestamps: true,
  collection: "barriles"
});

// Índices para mejorar búsquedas
BarrilSchema.index({ nombre: 1, estado: 1 });

// Validación personalizada (opcional)
BarrilSchema.pre("save", function (next) {
  if (this.nombre && this.nombre.toLowerCase() === "prohibido") {
    return next(new Error("El nombre 'prohibido' no está permitido para los barriles"));
  }
  next();
});

module.exports = mongoose.models.Barril || mongoose.model("Barril", BarrilSchema);
