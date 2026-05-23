document.addEventListener('DOMContentLoaded', () => {
    verificar_sesion('Dueño');
});

const formulario_crear_usuario = document.querySelector('#formulario_crear_usuario');

formulario_crear_usuario.addEventListener('submit', async (e) => {
    e.preventDefault();    

    const nombre_completo = document.getElementById('nombre_completo').value;
    const correo_electronico = document.getElementById('correo_electronico').value;
    const clave_unica = document.getElementById('clave_unica').value;
    const rol = document.getElementById('rol_empleados').value;

    try {
        const respuesta = await fetch('http://localhost:3000/crear-usuario', {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify ({
                nombre_completo,
                correo_electronico,
                clave_unica,
                rol
            })
        });
        
        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert (' Usuario creado de manera correcta');
            formulario_crear_usuario.reset(); //esta linea limpea el formulario para que alguien escriva de nuevo otra respuesta.
        } else { 
            alert(' Error : ' + datos.message); 
        } 
       } catch (error) {
        console.error('Error', error);
        alert('No se Pudo Conectar con el Servidor');
       }
});
