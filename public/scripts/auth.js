document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return window.location.href = "/views/login.html";
  }

  try {
    const res = await fetch("/api/auth/verificar", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Token inválido");
    }

    const data = await res.json();
    const usuario = data.usuario;

    // Mostrar nombre del usuario
    const userLabel = document.getElementById("nombre-usuario");
    if (userLabel) userLabel.textContent = usuario.nombre;

    // Mostrar u ocultar elementos según el rol
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = (usuario.rol === "admin") ? "block" : "none";
    });

    document.querySelectorAll(".gerente-only").forEach(el => {
      el.style.display = (usuario.rol === "admin" || usuario.rol === "gerente") ? "block" : "none";
    });

    document.querySelectorAll(".operador-only").forEach(el => {
      el.style.display = (usuario.rol === "operador") ? "block" : "none";
    });

  } catch (err) {
    console.warn("Autenticación fallida:", err.message);
    localStorage.removeItem("token");
    window.location.href = "/views/login.html";
  }
});
