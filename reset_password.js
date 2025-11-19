const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Usuario = require('./src/models/Usuario');

// Conectarse a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB para reset de contraseña');
    actualizarPassword();
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB', err);
  });

// Función para actualizar contraseña del operador
async function actualizarPassword() {
  try {
    const email = 'operador@totem.cl';
    const nuevaPassword = 'operador123';

    const hash = await bcrypt.hash(nuevaPassword, 10);
    const usuario = await Usuario.findOneAndUpdate(
      { email },
      { password: hash },
      { new: true }
    );

    if (!usuario) {
      console.log(`❌ No se encontró el usuario con email: ${email}`);
    } else {
      console.log(`✅ Contraseña actualizada correctamente para ${email}`);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error al actualizar la contraseña', err);
    mongoose.disconnect();
  }
}
