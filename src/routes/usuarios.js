const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarCualquierRol } = require('../middlewares/auth');

// Obtener todos los usuarios (solo admin)
router.get('/', verificarToken, verificarCualquierRol('admin'), async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-password');
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener los usuarios' });
  }
});

// Crear nuevo usuario (solo admin)
router.post('/', verificarToken, verificarCualquierRol('admin'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'El usuario ya existe' });

    const hashed = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ nombre, email, password: hashed, rol });

    await nuevoUsuario.save();
    res.status(201).json({ msg: 'Usuario creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar el usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verificarToken, verificarCualquierRol('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
});

// Editar usuario (solo admin)
router.put('/:id', verificarToken, verificarCualquierRol('admin'), async (req, res) => {
  try {
    const { nombre, rol } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, rol },
      { new: true }
    );
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json({ msg: 'Usuario actualizado', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el usuario' });
  }
});

module.exports = router;
