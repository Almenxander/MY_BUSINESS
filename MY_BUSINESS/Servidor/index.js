const express = require('express');
const cors = require('cors');
const db = require('./db'); //aca se concta la base de datos 

const app = express();
app.use(cors());
app.use(express.json())

const PORT = 3000;

app.get('/test', (req, res) => {
    res.send('Servidor Funcionando de manera correcta');
});

//login o inicio de sesion e inventarios

app.listen(PORT, () => {
    console.log('servidor corriendo en el https://localhost: ${PORT}');
});