const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Movimiento = require('../models/Movimiento');
const Barril = require('../models/Barril');
const { verificarToken, verificarRol, verificarCualquierRol } = require('../middlewares/auth');

// Crear un nuevo movimiento (admin u operario)
router.post('/', verificarToken, verificarCualquierRol('operario', 'admin'), async (req, res) => {
  try {
    const { barril_id, tipo_movimiento, ubicacion_origen, ubicacion_destino, usuario_responsable, observacion } = req.body;

    if (!barril_id || !tipo_movimiento || !ubicacion_origen || !ubicacion_destino || !usuario_responsable) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    }

    if (!mongoose.Types.ObjectId.isValid(barril_id)) {
      return res.status(400).json({ error: 'ID de barril no válido.' });
    }

    const barril = await Barril.findById(barril_id);
    if (!barril) {
      return res.status(404).json({ error: 'Barril no encontrado.' });
    }

    const nuevoMovimiento = new Movimiento({
      barril_id,
      tipo_movimiento,
      ubicacion_origen,
      ubicacion_destino,
      usuario_responsable,
      observacion
    });

    const guardado = await nuevoMovimiento.save();

    barril.historial_movimientos.push(guardado._id);
    await barril.save();

    res.status(201).json(guardado);
  } catch (error) {
    console.error('Error al crear el movimiento:', error);
    res.status(500).json({ error: 'Error interno al registrar movimiento.' });
  }
});

// Obtener todos los movimientos (admin, operario, gerente)
router.get('/', verificarToken, verificarCualquierRol('operario', 'gerente', 'admin'), async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate('barril_id', 'nombre estado ubicacion')
      .sort({ fecha_movimiento: -1 });

    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos.' });
  }
});

// Editar un movimiento (solo admin)
router.put('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_movimiento, ubicacion_origen, ubicacion_destino, observacion } = req.body;

    if (!tipo_movimiento || !ubicacion_origen || !ubicacion_destino) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben completarse.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de movimiento inválido.' });
    }

    const actualizado = await Movimiento.findByIdAndUpdate(
      id,
      {
        tipo_movimiento,
        ubicacion_origen,
        ubicacion_destino,
        observacion: observacion || "", // guarda aunque esté vacío
      },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ error: 'Movimiento no encontrado.' });
    }

    res.status(200).json(actualizado);
  } catch (error) {
    console.error('Error al editar movimiento:', error);
    res.status(500).json({ error: 'Error al actualizar movimiento.' });
  }
});


// Eliminar movimiento (solo admin)
router.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de movimiento inválido.' });
    }

    const eliminado = await Movimiento.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Movimiento no encontrado.' });
    }

    // Limpiar referencia en el barril
    await Barril.updateOne(
      { _id: eliminado.barril_id },
      { $pull: { historial_movimientos: eliminado._id } }
    );

    res.status(200).json({ message: 'Movimiento eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({ error: 'Error al eliminar movimiento.' });
  }
});

module.exports = router;
