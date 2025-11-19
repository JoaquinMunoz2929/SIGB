const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Barril = require("../models/Barril");

const {
  verificarToken,
  verificarRol,
  verificarCualquierRol
} = require("../middlewares/auth");

// 📦 GET - Obtener todos los barriles (admin, gerente, operador)
router.get("/", verificarToken, verificarCualquierRol('admin', 'gerente', 'operador'), async (req, res) => {
  try {
    const barriles = await Barril.find();
    if (!barriles || barriles.length === 0) {
      return res.status(404).json({ message: "No hay barriles registrados." });
    }
    res.status(200).json(barriles);
  } catch (err) {
    console.error("❌ Error al obtener barriles:", err);
    res.status(500).json({ error: "Error interno del servidor al obtener barriles" });
  }
});

// ➕ POST - Crear nuevo barril (solo admin y operador)
router.post("/", verificarToken, verificarCualquierRol('admin', 'operador'), async (req, res) => {
  const { nombre, estado, ubicacion } = req.body;

  if (!nombre || !estado || !ubicacion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const estadosValidos = ["En uso", "Vacío", "Mantenimiento"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado inválido. Debe ser 'En uso', 'Vacío' o 'Mantenimiento'."
    });
  }

  try {
    const nuevoBarril = new Barril({ nombre, estado, ubicacion });
    const guardado = await nuevoBarril.save();
    res.status(201).json(guardado);
  } catch (err) {
    console.error("❌ Error al crear barril:", err);
    res.status(500).json({ error: "Error al guardar el barril en la base de datos." });
  }
});

// ✏️ PATCH - Actualizar barril (solo admin y operador)
router.patch("/:id", verificarToken, verificarCualquierRol('admin', 'operador'), async (req, res) => {
  const { id } = req.params;
  const { nombre, estado, ubicacion } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de barril no válido." });
  }

  const estadosValidos = ["En uso", "Vacío", "Mantenimiento"];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado inválido. Debe ser 'En uso', 'Vacío' o 'Mantenimiento'."
    });
  }

  if (!nombre && !estado && !ubicacion) {
    return res.status(400).json({ error: "Debe ingresar al menos un campo para actualizar." });
  }

  try {
    const actualizado = await Barril.findByIdAndUpdate(
      id,
      { nombre, estado, ubicacion },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: "Barril no encontrado." });
    }

    res.status(200).json(actualizado);
  } catch (err) {
    console.error("❌ Error al actualizar barril:", err);
    res.status(500).json({ error: "Error al actualizar barril en la base de datos." });
  }
});

// 🗑️ DELETE - Eliminar barril (solo admin)
router.delete("/:id", verificarToken, verificarRol('admin'), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID no válido." });
  }

  try {
    const eliminado = await Barril.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ message: "Barril no encontrado." });
    }

    res.status(200).json({ message: "Barril eliminado correctamente." });
  } catch (err) {
    console.error("❌ Error al eliminar barril:", err);
    res.status(500).json({ error: "Error al eliminar barril en la base de datos." });
  }
});

module.exports = router;
