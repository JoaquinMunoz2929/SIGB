window.onload = async () => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/views/login.html'; // Redirigir a login si no hay token
        return;
    }

    // Verificar token con el backend
    try {
        const response = await fetch("/api/auth/verificar", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Token inválido');
        const data = await response.json();
        const usuario = data.usuario;
        mostrarUsuario(usuario);
    } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem('token');
        window.location.href = '/views/login.html'; // Redirigir a login si el token es inválido
    }

    // Cargar barriles
    cargarBarriles();

    // Manejar creación de barriles
    const createBarrilForm = document.getElementById("create-barrel-form");
    createBarrilForm.addEventListener("submit", crearBarril);
};

// Mostrar nombre y rol del usuario en la interfaz
function mostrarUsuario(usuario) {
    const nombreUsuario = document.getElementById("nombre-usuario");
    if (nombreUsuario) {
        nombreUsuario.textContent = `Bienvenido, ${usuario.nombre} (${usuario.rol})`;
    }
    // Aquí puedes agregar más lógica si deseas personalizar la navegación
}

// Cargar barriles
async function cargarBarriles() {
    const barrilesList = document.getElementById("barriles-list");
    try {
        const response = await fetch("http://localhost:3000/api/barriles", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar los barriles.");
        }

        const barriles = await response.json();
        if (barriles.length === 0) {
            barrilesList.innerHTML = "<li class='list-group-item'>No hay barriles registrados.</li>";
            return;
        }

        barriles.forEach(barril => {
            const li = document.createElement("li");
            li.classList.add("list-group-item", "mb-2", "p-3", "border", "rounded");
            li.innerHTML = `
                <strong>${barril.nombre}</strong><br>
                Estado: ${barril.estado}<br>
                Ubicación: ${barril.ubicacion}<br>
                Fecha de registro: ${new Date(barril.fecha_registro).toLocaleString()}
            `;
            barrilesList.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar los barriles:", error);
        barrilesList.innerHTML = "<li class='list-group-item text-danger'>Error al cargar los barriles. Intenta nuevamente.</li>";
    }
}

// Crear barril
async function crearBarril(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const estado = document.getElementById("estado").value;
    const ubicacion = document.getElementById("ubicacion").value;

    if (!nombre || !estado || !ubicacion) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const newBarril = { nombre, estado, ubicacion };

    try {
        const response = await fetch("http://localhost:3000/api/barriles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(newBarril),
        });

        if (!response.ok) {
            throw new Error("Error al crear el barril.");
        }

        const barrilCreado = await response.json();
        const barrilesList = document.getElementById("barriles-list");

        const li = document.createElement("li");
        li.classList.add("list-group-item", "mb-2", "p-3", "border", "rounded");
        li.innerHTML = `
            <strong>${barrilCreado.nombre}</strong><br>
            Estado: ${barrilCreado.estado}<br>
            Ubicación: ${barrilCreado.ubicacion}<br>
            Fecha de registro: ${new Date(barrilCreado.fecha_registro).toLocaleString()}
        `;
        barrilesList.appendChild(li);

        createBarrilForm.reset();
    } catch (error) {
        console.error("Error al crear el barril:", error);
        alert("Ocurrió un error al crear el barril. Por favor, inténtalo nuevamente.");
    }
}
