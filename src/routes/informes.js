const express = require('express');
const router = express.Router();
const Informe = require('../models/Informe');
const Movimiento = require('../models/Movimiento');
const { verificarToken, verificarRol, verificarCualquierRol } = require('../middlewares/auth');

// 📄 Obtener todos los informes (admin o gerente)
router.get('/', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  try {
    const informes = await Informe.find().sort({ anio: -1, mes: -1 });
    res.json(informes);
  } catch (err) {
    console.error("Error al obtener informes:", err.message);
    res.status(500).json({ message: "Error al obtener informes", details: err.message });
  }
});

// 🆕 Crear informe mensual agrupado por barril
router.post('/', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  const { tipo_informe, descripcion, mes, anio } = req.body;

  const mesNum = parseInt(mes);
  const anioNum = parseInt(anio);

  if (!mesNum || !anioNum || mesNum < 1 || mesNum > 12 || anioNum < 2000) {
    return res.status(400).json({ message: "Mes y año inválidos." });
  }

  const fechaInicio = new Date(anioNum, mesNum - 1, 1);
  const fechaFin = new Date(anioNum, mesNum, 0, 23, 59, 59);

  try {
    const movimientos = await Movimiento.find({
      fecha_movimiento: { $gte: fechaInicio, $lte: fechaFin }
    }).populate('barril_id');

    const movimientosPorBarril = new Map();

    for (const mov of movimientos) {
      if (!mov.barril_id || !mov.barril_id._id) continue;

      const id = mov.barril_id._id.toString();

      if (!movimientosPorBarril.has(id)) {
        movimientosPorBarril.set(id, {
          barril_id: mov.barril_id._id,
          movimientos: []
        });
      }

      movimientosPorBarril.get(id).movimientos.push({
        tipo_movimiento: mov.tipo_movimiento,
        ubicacion_origen: mov.ubicacion_origen,
        ubicacion_destino: mov.ubicacion_destino,
        usuario_responsable: mov.usuario_responsable,
        observacion: mov.observacion,
        fecha_movimiento: mov.fecha_movimiento
      });
    }

    const nuevoInforme = new Informe({
      tipo_informe: tipo_informe?.trim() || 'Informe Mensual',
      descripcion: descripcion?.trim() || `Informe del mes ${mesNum}/${anioNum}`,
      mes: mesNum,
      anio: anioNum,
      contenido: Array.from(movimientosPorBarril.values())
    });

    await nuevoInforme.save();
    res.status(201).json(nuevoInforme);
  } catch (err) {
    console.error("Error al crear informe:", err.message);
    res.status(500).json({ message: "Error al generar informe", details: err.message });
  }
});

// 🔍 Obtener informe por ID
router.get('/:id', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });
    res.json(informe);
  } catch (err) {
    console.error("Error al obtener informe:", err.message);
    res.status(500).json({ message: "Error al obtener informe", details: err.message });
  }
});

// ✏️ Actualizar informe
router.patch('/:id', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id);
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });

    const { tipo_informe, descripcion, contenido } = req.body;
    if (tipo_informe != null) informe.tipo_informe = tipo_informe;
    if (descripcion != null) informe.descripcion = descripcion;
    if (contenido != null) informe.contenido = contenido;

    const actualizado = await informe.save();
    res.json(actualizado);
  } catch (err) {
    console.error("Error al actualizar informe:", err.message);
    res.status(400).json({ message: "Error al actualizar informe", details: err.message });
  }
});

// 🗑️ Eliminar informe (solo admin)
router.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const informe = await Informe.findByIdAndDelete(req.params.id);
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });
    res.json({ message: 'Informe eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar informe:", err.message);
    res.status(500).json({ message: "Error al eliminar informe", details: err.message });
  }
});

// 📥 Exportar a Excel
router.get('/:id/excel', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe Barriles');

    sheet.columns = [
      { header: 'Barril', key: 'barril', width: 30 },
      { header: 'Tipo Movimiento', key: 'tipo', width: 20 },
      { header: 'Origen', key: 'origen', width: 20 },
      { header: 'Destino', key: 'destino', width: 20 },
      { header: 'Responsable', key: 'responsable', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Observación', key: 'observacion', width: 30 }
    ];

    informe.contenido.forEach(entry => {
      const nombreBarril = entry.barril_id?.nombre || 'Desconocido';
      entry.movimientos.forEach(mov => {
        sheet.addRow({
          barril: nombreBarril,
          tipo: mov.tipo_movimiento,
          origen: mov.ubicacion_origen,
          destino: mov.ubicacion_destino,
          responsable: mov.usuario_responsable,
          fecha: new Date(mov.fecha_movimiento).toLocaleString(),
          observacion: mov.observacion || ''
        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=informe_${informe.mes}_${informe.anio}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error al exportar a Excel:", err.message);
    res.status(500).json({ message: "Error al exportar informe a Excel", details: err.message });
  }
});

// 📄 Exportar a PDF
router.get('/:id/pdf', verificarToken, verificarCualquierRol('admin', 'gerente'), async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=informe_${informe.mes}_${informe.anio}.pdf`);
    doc.pipe(res);

    doc.fontSize(16).text(`Informe: ${informe.tipo_informe}`, { underline: true });
    doc.fontSize(12).text(`Descripción: ${informe.descripcion}`);
    doc.text(`Fecha: ${String(informe.mes).padStart(2, '0')}/${informe.anio}`);
    doc.moveDown();

    informe.contenido.forEach(entry => {
      const nombreBarril = entry.barril_id?.nombre || 'Barril desconocido';
      doc.fontSize(14).fillColor('#0b3d91').text(`Barril: ${nombreBarril}`);
      entry.movimientos.forEach(mov => {
        doc.fontSize(10).fillColor('black').text(`• ${mov.tipo_movimiento} | ${mov.ubicacion_origen} → ${mov.ubicacion_destino}`);
        doc.text(`  Responsable: ${mov.usuario_responsable} | Fecha: ${new Date(mov.fecha_movimiento).toLocaleString()}`);
        if (mov.observacion) doc.text(`  Observación: ${mov.observacion}`);
        doc.moveDown(0.3);
      });
      doc.moveDown(1);
    });

    doc.end();
  } catch (err) {
    console.error("Error al exportar a PDF:", err.message);
    res.status(500).json({ message: "Error al exportar informe a PDF", details: err.message });
  }
});

module.exports = router;
