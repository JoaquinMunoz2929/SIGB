document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");

  const tabla = $('#tablaBarriles').DataTable({
    pageLength: 14,
    scrollX: true,
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
    },
    responsive: true,
    destroy: true
  });

  const nuevoForm = document.getElementById("nuevo-barril-form");
  const modal = new bootstrap.Modal(document.getElementById("nuevoBarrilModal"));
  const btnGuardar = nuevoForm.querySelector("button[type='submit']");

  if (!token || (rol !== "admin" && rol !== "operador")) {
    alert("Acceso denegado");
    window.location.href = "/views/login.html";
    return;
  }

  const cargarBarriles = async () => {
    try {
      const res = await fetch("/api/barriles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      tabla.clear(); // Limpia la tabla antes de volver a llenarla

      data.forEach((barril, index) => {
        const acciones = `
          <button class="btn btn-sm btn-warning" onclick="editarBarril('${barril._id}', '${barril.nombre}', '${barril.estado}', '${barril.ubicacion}')">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarBarril('${barril._id}')">
            <i class="bi bi-trash"></i>
          </button>
        `;

        tabla.row.add([
          index + 1,
          barril.nombre,
          barril.estado,
          barril.ubicacion,
          new Date(barril.fecha_registro).toLocaleDateString(),
          acciones
        ]);
      });

      tabla.draw();
    } catch (err) {
      console.error("Error al cargar barriles:", err);
      alert("Error al cargar barriles");
    }
  };

  cargarBarriles();

  nuevoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnGuardar.disabled = true;

    const id = document.getElementById("barril-id").value;
    const nombre = document.getElementById("barril-nombre").value.trim();
    const estado = document.getElementById("barril-estado").value;
    const ubicacion = document.getElementById("barril-ubicacion").value.trim();

    const datos = { nombre, estado, ubicacion };

    try {
      const res = await fetch(id ? `/api/barriles/${id}` : "/api/barriles", {
        method: id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const resultado = await res.json();

      if (!res.ok) throw new Error(resultado.message || "Error en la solicitud");

      nuevoForm.reset();
      document.getElementById("barril-id").value = "";
      modal.hide();
      cargarBarriles();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      btnGuardar.disabled = false;
    }
  });

  window.editarBarril = (id, nombre, estado, ubicacion) => {
    document.getElementById("barril-id").value = id;
    document.getElementById("barril-nombre").value = nombre;
    document.getElementById("barril-estado").value = estado;
    document.getElementById("barril-ubicacion").value = ubicacion;
    document.getElementById("nuevoBarrilModalLabel").textContent = "Editar Barril";
    modal.show();
  };

  window.eliminarBarril = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este barril?")) return;

    try {
      const res = await fetch(`/api/barriles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Error al eliminar");

      cargarBarriles();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
});
