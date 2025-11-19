const Informe = require('../models/Informe');
const Movimiento = require('../models/Movimiento');
const Barril = require('../models/Barril');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Crear un nuevo informe mensual agrupado por barril
const crearInforme = async (req, res) => {
  try {
    const { tipo_informe, descripcion, mes, anio } = req.body;

    if (!tipo_informe || !descripcion || !mes || !anio) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    // Buscar todos los movimientos del mes indicado
    const movimientos = await Movimiento.find({
      fecha_movimiento: { $gte: inicioMes, $lte: finMes }
    }).populate('barril_id');

    if (!movimientos.length) {
      return res.status(404).json({ message: 'No hay movimientos para ese mes.' });
    }

    // Agrupar movimientos por barril_id
    const agrupados = new Map();

    movimientos.forEach(mov => {
      const barrilId = mov.barril_id?._id?.toString();
      if (!barrilId) return;

      if (!agrupados.has(barrilId)) {
        agrupados.set(barrilId, {
          barril_id: mov.barril_id._id,
          movimientos: []
        });
      }

      agrupados.get(barrilId).movimientos.push({
        tipo_movimiento: mov.tipo_movimiento,
        ubicacion_origen: mov.ubicacion_origen,
        ubicacion_destino: mov.ubicacion_destino,
        usuario_responsable: mov.usuario_responsable,
        observacion: mov.observacion,
        fecha_movimiento: mov.fecha_movimiento
      });
    });

    const nuevoInforme = new Informe({
      tipo_informe,
      descripcion,
      mes,
      anio,
      contenido: Array.from(agrupados.values())
    });

    await nuevoInforme.save();
    res.status(201).json(nuevoInforme);
  } catch (error) {
    console.error('Error al crear informe:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener todos los informes
const obtenerInformes = async (req, res) => {
  try {
    const informes = await Informe.find().sort({ anio: -1, mes: -1 });
    res.json(informes);
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({ message: 'Error al obtener informes' });
  }
};

// Obtener informe por ID
const obtenerInformePorId = async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });
    res.json(informe);
  } catch (error) {
    console.error('Error al obtener informe:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar informe
const eliminarInforme = async (req, res) => {
  try {
    const informe = await Informe.findByIdAndDelete(req.params.id);
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });
    res.json({ message: 'Informe eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar informe:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Exportar a PDF
const exportarInformePDF = async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=informe_${informe.mes}_${informe.anio}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text(`Informe: ${informe.tipo_informe}`, { align: 'center' });
    doc.moveDown().fontSize(12).text(`Descripción: ${informe.descripcion}`);
    doc.text(`Fecha: ${String(informe.mes).padStart(2, '0')}/${informe.anio}`);
    doc.moveDown();

    for (const entry of informe.contenido) {
      const nombre = entry.barril_id?.nombre || 'Barril desconocido';
      doc.fontSize(14).fillColor('#00662f').text(`Barril: ${nombre}`);
      entry.movimientos.forEach(m => {
        doc.fontSize(10).fillColor('black').text(`• ${m.tipo_movimiento} - ${m.ubicacion_origen} → ${m.ubicacion_destino}`);
        doc.text(`  Responsable: ${m.usuario_responsable} | Fecha: ${new Date(m.fecha_movimiento).toLocaleString()}`);
        if (m.observacion) doc.text(`  Observación: ${m.observacion}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    doc.end();
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ message: 'Error al generar PDF' });
  }
};

// Exportar a Excel
const exportarInformeExcel = async (req, res) => {
  try {
    const informe = await Informe.findById(req.params.id).populate('contenido.barril_id');
    if (!informe) return res.status(404).json({ message: 'Informe no encontrado' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe');

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
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ message: 'Error al generar Excel' });
  }
};

module.exports = {
  crearInforme,
  obtenerInformes,
  obtenerInformePorId,
  eliminarInforme,
  exportarInformePDF,
  exportarInformeExcel
};
