const mysql = require('mysql2')

//conectamos la base de datos 

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my_business_db'
});

conexion.connect((err) => {
    if (err) {
        console.error ('Error al conectar la base de datos DB:', err.message);
        return; 
    }
    console.log('conectado con exito a la base de datos MY_BUSINESS_DB');
});
module.exports = conexion