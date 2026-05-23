document.addEventListener('DOMContentLoaded', () => {
    verificar_sesion('Dueño');
    cargar_productos();

    const formulario_producto = document.querySelector('#formulario_producto');

    formulario_producto.addEventListener('submit', async (e) => {
        e.preventDefault();

        const boton = document.querySelector('#formulario_producto button[type="submit"]');
        const modo = boton.dataset.modo;
        const id = boton.dataset.id;

        const producto = {
            sku: document.getElementById('sku').value,
            nombre_producto: document.getElementById('nombre_producto').value,
            categoria: document.getElementById('categoria').value,
            precio_costo: document.getElementById('precio_costo').value,
            unidad_medida: document.getElementById('unidad_medida').value,
            precio_venta: document.getElementById('precio_venta').value,
            tarifa_iva: document.getElementById('tarifa_iva').value,
            cantidad_stock: document.getElementById('cantidad_stock').value,
            stock_minimo: document.getElementById('stock_minimo').value
        };

        try {
            let respuesta;

            if (modo === 'editar') {
                respuesta = await fetch(`http://localhost:3000/productos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(producto)
                });
            } else {
                respuesta = await fetch('http://localhost:3000/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(producto)
                });
            }

            const datos = await respuesta.json();

            if (respuesta.ok) {
                alert(modo === 'editar' ? '✅ Producto actualizado' : '✅ Producto guardado');
                formulario_producto.reset();
                boton.textContent = 'Guardar en el Inventario';
                delete boton.dataset.modo;
                delete boton.dataset.id;
                cargar_productos();
            } else {
                alert('Error: ' + datos.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar con el servidor');
        }
    });
});

async function cargar_productos() {
    try {
        const respuesta = await fetch('http://localhost:3000/productos');
        const productos = await respuesta.json();

        const tabla = document.getElementById('tabla_productos');
        tabla.innerHTML = '';

        if (productos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="8">No hay productos registrados</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const estado = producto.cantidad_stock <= producto.stock_minimo
                ? `<strong style="color:red">⚠️ Stock Bajo</strong>`
                : `<strong style="color:green">✅ Normal</strong>`;

            tabla.innerHTML += `
                <tr>
                    <td>${producto.sku}</td>
                    <td>${producto.nombre_producto}</td>
                    <td>${producto.categoria}</td>
                    <td>${producto.cantidad_stock}</td>
                    <td>$${Number(producto.precio_venta).toLocaleString('es-CO')}</td>
                    <td>${producto.tarifa_iva}%</td>
                    <td>${estado}</td>
                    <td>
                        <button type="button" onclick="editar_producto(${producto.id_producto})">Editar</button>
                        <button type="button" onclick="eliminar_producto(${producto.id_producto})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
};

async function eliminar_producto(id_producto) {
    const confirmar = confirm('¿Está seguro que desea eliminar este producto?');
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/productos/${id_producto}`, {
            method: 'DELETE'
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert('Producto eliminado correctamente');
            cargar_productos();
        } else {
            alert('Error: ' + datos.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor');
    }
};

async function editar_producto(id_producto) {
    try {
        const respuesta = await fetch(`http://localhost:3000/productos/${id_producto}`);
        const producto = await respuesta.json();

        document.getElementById('sku').value = producto.sku;
        document.getElementById('nombre_producto').value = producto.nombre_producto;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('unidad_medida').value = producto.unidad_medida;
        document.getElementById('precio_costo').value = producto.precio_costo;
        document.getElementById('precio_venta').value = producto.precio_venta;
        document.getElementById('tarifa_iva').value = parseFloat(producto.tarifa_iva);
        document.getElementById('cantidad_stock').value = producto.cantidad_stock;
        document.getElementById('stock_minimo').value = producto.stock_minimo;

        const boton = document.querySelector('#formulario_producto button[type="submit"]');
        boton.textContent = 'Actualizar Producto';
        boton.dataset.modo = 'editar';
        boton.dataset.id = id_producto;

        window.scrollTo(0, 0);
        alert('Edita los campos y haz clic en Actualizar Producto');

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo cargar el producto');
    }
};