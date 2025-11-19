const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtener todos los usuarios (solo admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-password'); // sin mostrar la contraseña
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ msg: "Error al obtener los usuarios" });
  }
};

// Crear nuevo usuario (solo admin)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ msg: "Faltan datos requeridos" });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol
    });

    await nuevoUsuario.save();
    res.status(201).json({ msg: "Usuario creado correctamente" });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ msg: "Error al registrar el usuario" });
  }
};

// Eliminar usuario (solo admin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    await Usuario.findByIdAndDelete(id);
    res.json({ msg: "Usuario eliminado correctamente" });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ msg: "Error al eliminar el usuario" });
  }
};

// (Opcional futuro) Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.rol = rol || usuario.rol;

    await usuario.save();
    res.json({ msg: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ msg: "Error al actualizar usuario" });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  eliminarUsuario,
  actualizarUsuario
};
