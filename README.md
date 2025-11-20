# SIGB – Sistema Integral de Gestión de Barriles  
El sistema permite gestionar de forma centralizada los barriles de la Cervecería Totem, registrando su ciclo de vida, movimientos, notificaciones y reportes, con control de acceso por roles.

---

## 1. Descripción general

El **SIGB** es una aplicación web basada en Node.js + Express que permite:

- Registrar barriles y su estado (lleno, vacío, en tránsito, etc.).
- Gestionar movimientos de barriles (envíos, devoluciones, pérdidas, mantención).
- Generar informes periódicos por barril y por periodo, con exportación a **Excel** y **PDF**.
- Enviar y visualizar notificaciones relevantes (por ejemplo, barriles críticos).
- Administrar usuarios con distintos **roles** y permisos:
  - `admin`: acceso total (usuarios, barriles, movimientos, informes, notificaciones).
  - `gerente`: acceso a informes, visualización de datos y estadísticas.
  - `operador`: registro y actualización de movimientos y barriles.

El objetivo es mejorar la trazabilidad de los barriles, reducir pérdidas y contar con información confiable para la toma de decisiones.

---

## 2. Tecnologías utilizadas

- **Backend**
  - Node.js
  - Express
  - MongoDB + Mongoose
  - JSON Web Tokens (JWT) – autenticación
  - Bcryptjs – hash de contraseñas
  - Dotenv – variables de entorno
  - Body-parser – parseo de requests
  - Cors – configuración de orígenes permitidos
  - ExcelJS – generación de reportes en Excel
  - PDFKit – generación de reportes en PDF

- **Frontend**
  - HTML5, CSS3
  - Bootstrap (diseño responsivo)
  - JavaScript en `/public/scripts`
  - Vistas HTML en `/public/views` (login, barriles, movimientos, informes, notificaciones, usuarios, etc.)

- **Otros**
  - Git + GitHub para control de versiones

---

## 3. Estructura del proyecto

```text
SIGB/
├─ public/
│  ├─ views/          # Vistas HTML (login, barriles, movimientos, informes, etc.)
│  ├─ scripts/        # JS del frontend (barriles.js, movimientos.js, usuarios.js, ...)
│  └─ styles/         # CSS y recursos estáticos
├─ src/
│  ├─ models/         # Modelos Mongoose (Barril, Movimiento, Informe, Usuario, Notificacion, ...)
│  ├─ routes/         # Rutas Express organizadas por recurso
│  └─ middlewares/    # Autenticación, autorización por rol, manejo de errores, etc.
├─ .env               # Variables de entorno (NO se sube a GitHub)
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ server.js          # Punto de entrada del servidor Express
└─ requirements.txt   # Requisitos de software/documentación


4. Requisitos previos
Node.js
 v18 o superior
npm
MongoDB
 (local o en la nube – Atlas)
Git (opcional, para clonar el repositorio)

5. Instalación y ejecución
5.1. Clonar el repositorio
git clone https://github.com/JoaquinMunoz2929/SIGB.git
cd SIGB

5.2. Instalar dependencias
npm install

5.3. Configurar variables de entorno
Crear un archivo .env en la raíz del proyecto con, al menos:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cerveceria_totem
JWT_SECRET=clave_super_secreta_cambiar
JWT_EXPIRES_IN=1d
Este archivo está excluido del repositorio mediante .gitignore para proteger credenciales.

5.4. Ejecutar la aplicación

Modo normal:
node server.js
o, si agregas un script en package.json:
"scripts": {
  "start": "node server.js"
}
entonces:
npm start
Luego abrir en el navegador:
http://localhost:3000
