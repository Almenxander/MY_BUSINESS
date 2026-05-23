const formulario = document.querySelector('#formulario_login');

formulario.addEventListener('submit', async (e) => {  // con este codigo.
    e.preventDefault(); //evitamos que la pagina se recargue sola

    const correo = document.getElementById('usuario_correo').value; //miramos lo que el usuario escribio en el correo.
    const clave = document.getElementById('usuario_clave').value; // miramos lo que el usuario escribio de contraseña.

    try {
        const respuesta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: correo,
                password: clave
            })
        });

        const datos = await respuesta.json();
        
       if (respuesta.ok) {
    sessionStorage.setItem('token', datos.token);
    sessionStorage.setItem('nombre', datos.usuario.nombre);
    sessionStorage.setItem('rol', datos.usuario.rol);

    alert("¡Bienvenido a MY BUSINESS!");
    const rol = datos.usuario.rol;

    if (rol === 'Dueño') {
        window.location.href = 'dueno.html';
    } else if (rol === 'Contador') {
        window.location.href = 'panel_administrativo.html';
    } else if (rol === 'Operario') {
        window.location.href = 'ventas.html';
    } else {
        window.location.href = 'panel_administrativo.html';
    }
}

    } catch (error) {
        console.error("Error al conectar:", error);
        alert("no se pudo conectar con el servidor. ¿encendiste el servidor en la terminal?");
    }
});