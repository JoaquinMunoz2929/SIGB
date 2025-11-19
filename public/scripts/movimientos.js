document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");

  if (!token) {
    window.location.href = "/views/login.html";
    return;
  }

  document.getElementById("nombreUsuario").textContent = `${nombre} (${rol})`;
  document.querySelectorAll(`.${rol}-only`).forEach(el => el.style.display = "block");

  if (rol !== "admin" && rol !== "operador") {
    alert("No tienes permisos para esta sección");
    window.location.href = "/views/login.html";
    return;
  }

  const movimientosList = document.getElementById("movimientos-list");
  const formNuevo = document.getElementById("form-movimiento");

  async function cargarMovimientos() {
    try {
      const res = await fetch("/api/movimientos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      movimientosList.innerHTML = "";

      if (!Array.isArray(data)) throw new Error("Datos inválidos");

      data.forEach((mov, index) => {
        movimientosList.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${mov.barril_id?.nombre || mov.barril_id?._id || 'Sin nombre'}</td>
            <td>${new Date(mov.fecha_movimiento).toLocaleDateString()}</td>
            <td>${mov.ubicacion_origen} → ${mov.ubicacion_destino}</td>
            <td>${mov.tipo_movimiento}</td>
            <td>${mov.usuario_responsable}</td>
            <td>${mov.observacion || '-'}</td>
            ${rol === "admin" ? `
              <td>
                <button class="btn btn-warning btn-sm" onclick="editarMovimiento('${mov._id}', '${mov.tipo_movimiento}', '${mov.ubicacion_origen}', '${mov.ubicacion_destino}', \`${mov.observacion || ''}\`)">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarMovimiento('${mov._id}')">Eliminar</button>
              </td>` : "<td>—</td>"}
          </tr>
        `;
      });
    } catch (err) {
      console.error(err);
      movimientosList.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Error al cargar movimientos.</td></tr>`;
    }
  }

  async function cargarBarrilesDisponibles() {
    try {
      const res = await fetch("/api/barriles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudieron cargar los barriles");

      const data = await res.json();
      const select = document.getElementById("barril_id");
      select.innerHTML = '<option value="">Selecciona Barril</option>';

      data.forEach(b => {
        const option = document.createElement("option");
        option.value = b._id;
        option.textContent = `${b.nombre} (${b.estado})`;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Error al cargar barriles:", err);
      alert("Error al cargar la lista de barriles.");
    }
  }

  cargarMovimientos();
  cargarBarrilesDisponibles();

  formNuevo.addEventListener("submit", async (e) => {
    e.preventDefault();
    const movimiento = {
      barril_id: document.getElementById("barril_id").value,
      tipo_movimiento: document.getElementById("tipo_movimiento").value,
      ubicacion_origen: document.getElementById("ubicacion_origen").value,
      ubicacion_destino: document.getElementById("ubicacion_destino").value,
      usuario_responsable: document.getElementById("usuario_responsable").value,
      observacion: document.getElementById("observacion").value,
    };

    try {
      const res = await fetch("/api/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(movimiento)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al registrar movimiento");
      }

      alert("Movimiento registrado");
      formNuevo.reset();
      bootstrap.Modal.getInstance(document.getElementById("modalMovimiento")).hide();
      cargarMovimientos();
    } catch (err) {
      alert(err.message);
    }
  });

  window.eliminarMovimiento = async (id) => {
    if (!confirm("¿Deseas eliminar este movimiento?")) return;
    try {
      const res = await fetch(`/api/movimientos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("Movimiento eliminado");
      cargarMovimientos();
    } catch (err) {
      alert(err.message);
    }
  };

  window.editarMovimiento = (id, tipo, origen, destino, observacion = "") => {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-tipo").value = tipo;
    document.getElementById("edit-origen").value = origen;
    document.getElementById("edit-destino").value = destino;
    document.getElementById("edit-observacion").value = observacion;
    new bootstrap.Modal(document.getElementById("editarMovimientoModal")).show();
  };

  document.getElementById("formEditarMovimiento")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const tipo = document.getElementById("edit-tipo").value;
    const origen = document.getElementById("edit-origen").value;
    const destino = document.getElementById("edit-destino").value;
    const observacion = document.getElementById("edit-observacion").value;

    try {
      const res = await fetch(`/api/movimientos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tipo_movimiento: tipo, ubicacion_origen: origen, ubicacion_destino: destino, observacion })
      });

      if (!res.ok) throw new Error("No se pudo actualizar");
      alert("Movimiento actualizado");
      bootstrap.Modal.getInstance(document.getElementById("editarMovimientoModal")).hide();
      cargarMovimientos();
    } catch (err) {
      alert(err.message);
    }
  });
});
