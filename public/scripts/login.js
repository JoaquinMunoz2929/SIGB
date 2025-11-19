document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, contraseña: password }) // tu backend usa "contraseña"
    });

    const data = await response.json();

    if (response.ok) {
      const { token, usuario } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redirección por rol
      switch (usuario.rol) {
        case 'admin':
          window.location.href = '/views/admin.html';
          break;
        case 'gerente':
          window.location.href = '/views/gerente.html';
          break;
        case 'operador':
          window.location.href = '/views/operador.html';
          break;
        default:
          alert('⚠️ Rol no reconocido');
      }
    } else {
      alert(data.message || '❌ Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('❌ Error al intentar iniciar sesión.');
  }

  // Limpiar formulario
  e.target.reset();
});
