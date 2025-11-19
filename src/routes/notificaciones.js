const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Obtener todas las notificaciones (requiere autenticación)
router.get('/', verificarToken, async (req, res) => {
  try {
    const notificaciones = await Notificacion.find().populate('barril_id');

    if (notificaciones.length === 0) {
      return res.status(404).json({ message: "No se encontraron notificaciones" });
    }
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una nueva notificación (requiere rol admin)
router.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
  const { mensaje, fecha, barril_id, tipo_notificacion, usuario_receptor } = req.body;

  if (!mensaje || !fecha || !barril_id || !tipo_notificacion || !usuario_receptor) {
    return res.status(400).json({ message: "Faltan datos requeridos en la solicitud" });
  }

  const notificacion = new Notificacion({
    mensaje,
    fecha,
    barril_id,
    tipo_notificacion,
    usuario_receptor
  });

  try {
    const nuevaNotificacion = await notificacion.save();
    res.status(201).json(nuevaNotificacion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtener una notificación por ID (requiere autenticación)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id).populate('barril_id');
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    res.json(notificacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Actualizar una notificación (requiere rol admin)
router.patch('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    const campos = ['mensaje', 'fecha', 'barril_id', 'tipo_notificacion', 'usuario_receptor'];
    campos.forEach(campo => {
      if (req.body[campo] != null) {
        notificacion[campo] = req.body[campo];
      }
    });

    const notificacionActualizada = await notificacion.save();
    res.json(notificacionActualizada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una notificación (requiere rol admin)
router.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    await notificacion.remove();
    res.json({ message: 'Notificación eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
