require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Registrar usuario
app.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, configuracion_home } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, "password", configuracion_home) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, email, password, configuracion_home || '{}']
        );

        res.status(201).json({ mensaje: "Usuario registrado con éxito", usuario: result.rows[0] });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Login usuario
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

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ mensaje: "Inicio de sesión exitoso", token, usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            configuracion_home: usuario.configuracion_home
        }});
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
