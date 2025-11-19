window.onload = async () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");

  if (!token || rol !== "admin") {
    alert("No tienes permisos para ver esta sección.");
    return (window.location.href = "/views/login.html");
  }

  document.getElementById("nombreUsuario").textContent = `${nombre} (${rol})`;

  await cargarUsuarios();
};

// Cargar usuarios y pintar tabla
async function cargarUsuarios() {
  const usuariosList = document.getElementById("usuarios-list");
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("No autorizado");

    const usuarios = await response.json();
    usuariosList.innerHTML = "";

    usuarios.forEach((usuario, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>${usuario.rol}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editarUsuario('${usuario._id}', '${usuario.nombre}', '${usuario.rol}')">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${usuario._id}')">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      `;
      usuariosList.appendChild(row);
    });

  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    usuariosList.innerHTML = `<tr><td colspan="5" class="text-danger">Error al cargar usuarios.</td></tr>`;
  }
}

// Crear nuevo usuario
document.getElementById("form-nuevo-usuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nuevo-nombre").value.trim();
  const email = document.getElementById("nuevo-email").value.trim();
  const password = document.getElementById("nuevo-contraseña").value.trim();
  const rol = document.getElementById("nuevo-rol").value;
  const token = localStorage.getItem("token");

  if (!nombre || !email || !password || !rol) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, email, password, rol }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al registrar usuario");
    }

    alert("Usuario registrado exitosamente.");
    document.getElementById("form-nuevo-usuario").reset();
    document.querySelector("#modalNuevoUsuario .btn-close").click();
    await cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
    console.error("Registro fallido:", error);
  }
});

// Eliminar usuario
async function eliminarUsuario(id) {
  const confirmar = confirm("¿Estás seguro de eliminar este usuario?");
  if (!confirmar) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "No se pudo eliminar el usuario");
    }

    alert("Usuario eliminado correctamente");
    await cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
    console.error("Error al eliminar usuario:", error);
  }
}

// Editar usuario (futura implementación)
function editarUsuario(id, nombreActual, rolActual) {
  alert(`Función editar aún no implementada. ID: ${id}, Nombre: ${nombreActual}, Rol: ${rolActual}`);
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "/views/login.html";
}

// Redirigir según rol
function redirectByRole(event) {
  event.preventDefault();
  const rol = localStorage.getItem("rol");
  if (["admin", "gerente", "operador"].includes(rol)) {
    window.location.href = "/views/index.html";
  } else {
    logout();
  }
}
