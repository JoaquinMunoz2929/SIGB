// public/scripts/authCheck.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");

  // Redirección si no hay token o rol
  if (!token || !rol) {
    window.location.href = "/views/login.html";
    return;
  }

  // Mostrar nombre y rol si hay un elemento con ese ID
  const nombreUsuario = document.getElementById("nombreUsuario");
  if (nombreUsuario) {
    nombreUsuario.textContent = `${nombre} (${rol})`;
  }

  // Ocultar elementos según el rol
  if (rol === "operador") {
    document.querySelectorAll(".admin-only, .gerente-only").forEach(el => el.remove());
  } else if (rol === "gerente") {
    document.querySelectorAll(".admin-only, .operador-only").forEach(el => el.remove());
  }

  // Botón logout funcional
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/views/login.html";
    });
  }
});
