// registerAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado a MongoDB');
  crearAdmin();
}).catch((err) => {
  console.error('❌ Error de conexión:', err);
});

// Esquema del usuario
const userSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  password: String,
  rol: String,
});

const Usuario = mongoose.model('Usuario', userSchema);

// Crear admin
async function crearAdmin() {
  const email = 'admin@totem.cl';
  const passwordPlano = 'admin123';

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      console.log('⚠️ Ya existe un usuario con este correo.');
      mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(passwordPlano, 10);
    const nuevoUsuario = new Usuario({
      nombre: 'Administrador',
      email,
      password: hashedPassword,
      rol: 'admin',
    });

    await nuevoUsuario.save();
    console.log(`✅ Usuario administrador creado: ${email} / ${passwordPlano}`);
  } catch (err) {
    console.error('❌ Error al crear el usuario:', err.message);
  } finally {
    mongoose.disconnect();
  }
}
