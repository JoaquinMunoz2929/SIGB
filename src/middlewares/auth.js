const jwt = require('jsonwebtoken');

/**
 * Verifica si el token JWT está presente y es válido.
 * Añade los datos decodificados (ej: _id, rol) al objeto req.user.
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado: token no proporcionado o formato incorrecto',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message,
    });
  }
};

/**
 * Verifica si el usuario tiene exactamente el rol especificado.
 * @param {string} rolEsperado - Rol requerido para acceder.
 */
const verificarRol = (rolEsperado) => {
  return (req, res, next) => {
    if (!req.user || req.user.rol !== rolEsperado) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: se requiere rol '${rolEsperado}'`,
      });
    }
    next();
  };
};

/**
 * Verifica si el usuario tiene alguno de los roles permitidos.
 * @param {...string} rolesPermitidos - Lista de roles válidos.
 */
const verificarCualquierRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarCualquierRol,
};
