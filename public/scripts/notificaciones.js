window.onload = async () => {
    const notificacionesList = document.getElementById("notificaciones-list");
  
    try {
      const response = await fetch("http://localhost:3000/api/notificaciones");
      const notificaciones = await response.json();
  
      notificaciones.forEach(notificacion => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>Tipo:</strong> ${notificacion.tipo_notificacion || "Sin tipo"}<br>
          Mensaje: ${notificacion.mensaje || "Sin mensaje"}<br>
          Fecha: ${new Date(notificacion.fecha).toLocaleString()}<br>
          Usuario receptor: ${notificacion.usuario_receptor?.join(", ") || "N/A"}
        `;
        notificacionesList.appendChild(li);
      });
    } catch (error) {
      console.error("Error al cargar las notificaciones:", error);
    }
  };
  