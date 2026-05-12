const mysql = require('mysql2')

//conectamos la base de datos 

const conectcion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my_business_db'
});

conectcion.connect((err) => {
    if (err) {
        console.error ('Error al conectar la base de datos DB:', err.message);
        return; 
    }
    console.log('conectado con exito a la base de datos MY_BUSINESS_DB');
});
module.exports = conectcion