require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Asegúrate de que db.js está bien configurado
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json()); // Para recibir JSON en las peticiones

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Registrar usuario
app.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar que los datos estén presentes
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // Insertar usuario en la base de datos (proteger "password")
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, "password") VALUES ($1, $2, $3) RETURNING *',
            [nombre, email, password]
        );

        res.status(201).json({ mensaje: "Usuario registrado con éxito", usuario: result.rows[0] });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios");
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        if (usuario.password !== password) { 
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
            JWT_SECRET,
            { expiresIn: "7d" } // El token dura 7 días
        );

        res.json({ mensaje: "Inicio de sesión exitoso", token, usuario });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});