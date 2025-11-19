const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Mostrar la URI de MongoDB solo en desarrollo
if (process.env.NODE_ENV !== "production") {
  console.log("🔧 MONGO_URI:", process.env.MONGO_URI);
}

// Middleware globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos: JS, CSS, imágenes
app.use(express.static(path.join(__dirname, "public")));

// Conexión a MongoDB con reconexión automática
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    console.log("🔄 Reintentando conexión en 5 segundos...");
    setTimeout(connectToMongoDB, 5000);
  }
};
connectToMongoDB();

// Rutas principales de la API
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/usuarios", require("./src/routes/usuarios"));
app.use("/api/barriles", require("./src/routes/barriles"));
app.use("/api/movimientos", require("./src/routes/movimientos"));
app.use("/api/informes", require("./src/routes/informes"));
app.use("/api/notificaciones", require("./src/routes/notificaciones"));

// Redirección raíz
app.get("/", (req, res) => {
  res.redirect("/views/login.html");
});

// Servir vistas HTML desde public/views
app.get("/views/:page", (req, res) => {
  const { page } = req.params;
  const filePath = path.join(__dirname, "public", "views", `${page}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ No se pudo cargar la vista: ${page}`, err.message);
      res.status(404).sendFile(path.join(__dirname, "public", "views", "404.html"));
    }
  });
});

// Fallback para archivos no encontrados
app.use((req, res) => {
  res.status(404).json({ message: "❌ Ruta no encontrada" });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("💥 Error interno:", err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
