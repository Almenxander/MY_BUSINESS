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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});