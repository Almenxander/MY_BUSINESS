const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'my_business_clave_secreta_2026';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get('/test', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.get('/verificar-setup', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM usuarios';

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error del servidor' });
        }

        const hay_usuarios = result[0].total > 0;
        res.status(200).send({ configurado: hay_usuarios });
    });
}); // Error 2 corregido: ): → });

app.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE correo_electronico = ?';

    db.query(query, [correo], async (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error en el servidor' });
        }

        if (result.length === 0) {
            return res.status(401).send({ message: 'Correo o contraseña incorrectos' });
        }

        const clave_correcta = await bcrypt.compare(password, result[0].clave_unica);

        if (clave_correcta) {
            const token = jwt.sign(
                {
                    id: result[0].id_usuario,
                    nombre: result[0].nombre_completo,
                    rol: result[0].rol
                },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).send({
                message: '¡Bienvenido!',
                token: token,
                usuario: {
                    nombre: result[0].nombre_completo,
                    rol: result[0].rol
                }
            }); // Error 5 corregido: faltaba ;
        } else {
            res.status(401).send({ message: 'Correo o contraseña incorrectos' });
        }
    });
});

app.post('/crear-usuario', async (req, res) => {
    const { nombre_completo, correo_electronico, clave_unica, rol } = req.body;

    try {
        const clave_encriptada = await bcrypt.hash(clave_unica, 10);

        const query = `INSERT INTO usuarios 
            (nombre_completo, correo_electronico, clave_unica, rol) 
            VALUES (?, ?, ?, ?)`;

        db.query(query, [nombre_completo, correo_electronico, clave_encriptada, rol], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(400).send({ message: 'El correo que intenta registrar ya está registrado.' });
                } else {
                    res.status(500).send({ message: 'Error al crear el usuario' });
                }
            } else {
                res.status(201).send({ message: 'Usuario creado correctamente' });
            }
        });

    } catch (error) {
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.post('/productos', (req, res) => {
    const { sku, nombre_producto, categoria, precio_costo,
        precio_venta, tarifa_iva, cantidad_stock,
        stock_minimo, unidad_medida } = req.body;

    const query = `INSERT INTO productos 
        (sku, nombre_producto, categoria, precio_costo, 
         precio_venta, tarifa_iva, cantidad_stock, 
         stock_minimo, unidad_medida) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [sku, nombre_producto, categoria, precio_costo,
        precio_venta, tarifa_iva, cantidad_stock,
        stock_minimo, unidad_medida], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(400).send({ message: 'Ese SKU ya existe en el inventario' });
                } else {
                    res.status(500).send({ message: 'Error al guardar el producto' });
                }
            } else {
                res.status(201).send({ message: 'Producto guardado correctamente' });
            }
        });
});

app.get('/productos', (req, res) => {

    const query = `SELECT id_producto, sku, nombre_producto, 
                   categoria, precio_costo, precio_venta, tarifa_iva, 
                   cantidad_stock, stock_minimo, unidad_medida 
                   FROM productos ORDER BY nombre_producto ASC`;

    db.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Error al obtener productos' });
        } else {
            res.status(200).send(result);
        }
    });
});


app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM productos WHERE id_producto = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener producto:', err); // ← ver error
            res.status(500).send({ message: err.message });
        } else if (result.length === 0) {
            res.status(404).send({ message: 'Producto no encontrado' });
        } else {
            res.status(200).send(result[0]);
        }
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id_producto = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar:', err);
            res.status(500).send({ message: err.message }); 
        } else {
            res.status(200).send({ message: 'Producto eliminado correctamente' });
        }
    });
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_producto, categoria, precio_costo,
            precio_venta, tarifa_iva, cantidad_stock,
            stock_minimo, unidad_medida } = req.body;

    const query = `UPDATE productos SET 
        nombre_producto = ?, categoria = ?, precio_costo = ?,
        precio_venta = ?, tarifa_iva = ?, cantidad_stock = ?,
        stock_minimo = ?, unidad_medida = ?
        WHERE id_producto = ?`;

    db.query(query, [nombre_producto, categoria, precio_costo,
        precio_venta, tarifa_iva, cantidad_stock,
        stock_minimo, unidad_medida, id], (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar producto' });
        } else {
            res.status(200).send({ message: 'Producto actualizado correctamente' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
