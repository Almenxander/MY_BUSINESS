function verificar_sesion(rol_requerido) {
    const token = sessionStorage.getItem('token');
    const rol = sessionStorage.getItem('rol');

    if (!token) {
        alert('inicia sesion primero antes de ingresar');
        window.location.href = 'index.html';
        return;
    }

    if (rol_requerido && rol  !== rol_requerido) {
        alert('No tienes Permiso para acceder a esta página. ');
        window.location.href = 'index.html';
        return;
    }

    const nombre =sessionStorage.getItem('nombre');
    const elementos_nombre = document.querySelectorAll('.usuario_nombre');
    if (elementos_nombre.length > 0) {
        elementos_nombre.forEach(el => el.textContent = nombre); 
    }
}

function cerrar_sesion() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}