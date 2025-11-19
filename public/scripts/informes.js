window.onload = async () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const informesList = document.getElementById("informes-list");

  try {
    const response = await fetch("/api/informes", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("No se pudo cargar informes");

    const informes = await response.json();

    if (informes.length === 0) {
      informesList.innerHTML = `<tr><td colspan="6">No hay informes disponibles.</td></tr>`;
      return;
    }

    informes.forEach((informe, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${informe.tipo_informe || "N/A"}</td>
        <td>${String(informe.mes).padStart(2, '0')}/${informe.anio}</td>
        <td>${informe.descripcion}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="verContenido('${informe._id}')">
            <i class="bi bi-eye"></i>
          </button>
          ${(rol === "admin" || rol === "gerente") ? `
            <button class="btn btn-warning btn-sm" onclick="editInforme('${informe._id}')">
              <i class="bi bi-pencil-square"></i>
            </button>` : ""}
          ${rol === "admin" ? `
            <button class="btn btn-danger btn-sm" onclick="deleteInforme('${informe._id}')">
              <i class="bi bi-trash3"></i>
            </button>` : ""}
        </td>
        <td>
          <button class="btn btn-outline-success btn-sm me-1" onclick="exportarInforme('${informe._id}', 'excel')">
            <i class="bi bi-file-earmark-excel"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="exportarInforme('${informe._id}', 'pdf')">
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
        </td>
      `;
      informesList.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar los informes:", error);
    informesList.innerHTML = `<tr><td colspan="6" class="text-danger">Error al cargar informes</td></tr>`;
  }
};

document.getElementById("informe-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const tipo_informe = document.getElementById("tipo_informe")?.value;
  const descripcion = document.getElementById("informe-descripcion")?.value;
  const mes = parseInt(document.getElementById("mes-informe")?.value || 0);
  const anio = parseInt(document.getElementById("anio-informe")?.value || 0);

  if (!tipo_informe || !descripcion || !mes || !anio) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/informes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ tipo_informe, descripcion, mes, anio })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear informe");
    }

    bootstrap.Modal.getInstance(document.getElementById("informeModal")).hide();
    window.location.reload();
  } catch (error) {
    console.error("Error al crear el informe:", error);
    alert(error.message);
  }
});

async function deleteInforme(id) {
  const token = localStorage.getItem("token");
  if (!confirm("¿Estás seguro de que deseas eliminar este informe?")) return;

  try {
    const response = await fetch(`/api/informes/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("No se pudo eliminar el informe");

    alert("Informe eliminado correctamente.");
    window.location.reload();
  } catch (error) {
    console.error("Error al eliminar informe:", error);
    alert("Error al eliminar informe.");
  }
}

async function verContenido(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`/api/informes/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("No se pudo cargar el informe");

    const informe = await response.json();
    const contenidoText = typeof informe.contenido === "string"
      ? informe.contenido
      : JSON.stringify(informe.contenido, null, 2);

    document.getElementById("contenido-informe").textContent = contenidoText;
    new bootstrap.Modal(document.getElementById("contenidoModal")).show();
  } catch (error) {
    console.error("Error al cargar contenido del informe:", error);
    alert("No se pudo cargar el contenido.");
  }
}

function editInforme(id) {
  alert("Función de edición aún no implementada.");
}

async function exportarInforme(id, tipo) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`/api/informes/${id}/${tipo}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Error al exportar informe");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `informe_${id}.${tipo === "pdf" ? "pdf" : "xlsx"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error al exportar informe:", error);
    alert("No se pudo exportar el informe.");
  }
}
