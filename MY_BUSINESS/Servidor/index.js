const express = require('express');
const cors = require('cors');
const db = require('./db'); //aca se conecta la base de datos 
const bcrypt = require ('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get('/test', (req, res) => {
    res.send('Servidor Funcionando de manera correcta');
});

app.get('verificr-setup', (req, res) => {
    const query = 'SELECT COUND(*) AS total FROM usuarios';

    db.query(query, (err,  result) => {
        if (err) {
            return res.status(500).sned({ message: 'Error del servidor'});
        }

        const hay_usuarios = result[0].total. > 0; 
        res.status(200).send({ configurado: hay_usuarios})
    });
}):

//login o inicio de sesion e inventarios RUTA

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

        // Comparamos la contraseña con bcrypt
        const clave_correcta = await bcrypt.compare(password, result[0].clave_unica);

        if (clave_correcta) {
            res.status(200).send({
                message: '¡Bienvenido!',
                usuario: {
                    nombre: result[0].nombre_completo,
                    rol: result[0].rol
                }
            });
        } else {
            res.status(401).send({ message: 'Correo o contraseña incorrectos' });
        }
    });
});

app.post('/crear-usuario', async (req, res) => {
    const { nombre_completo, correo_electronico, clave_unica, rol } = req.body;

    try {
        // Encriptamos la contraseña antes de guardarla
        const clave_encriptada = await bcrypt.hash(clave_unica, 10);

        const query = `INSERT INTO usuarios 
            (nombre_completo, correo_electronico, clave_unica, rol) 
            VALUES (?, ?, ?, ?)`;

        db.query(query, [nombre_completo, correo_electronico, clave_encriptada, rol], (err, result) => {
            if (err) {
                // Si el correo ya existe en la base de datos
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(400).send({ message: 'El correo que intenta registar ya esta registrado.' });
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
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});