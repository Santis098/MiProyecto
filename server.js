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
            'INSERT INTO usuarios (nombre, email, "password", configuracion_home, meta_ahorro) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, email, password, configuracion_home || '{}', 0]
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

        res.json({ 
            mensaje: "Inicio de sesión exitoso", 
            token, 
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                configuracion_home: usuario.configuracion_home,
                meta_ahorro: usuario.meta_ahorro || 0,  // ✅ Ahora siempre enviamos `meta_ahorro`
                tipo_moneda: usuario.tipo_moneda

            }
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Obtener datos del usuario autenticado
app.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query("SELECT id, nombre, email, meta_ahorro FROM usuarios WHERE id = $1", [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener meta de ahorro de un usuario por ID
app.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT meta_ahorro FROM usuarios WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo meta_ahorro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar la meta de ahorro de un usuario
app.put('/user/:id/savings', async (req, res) => {
    try {
        const { id } = req.params;
        const { meta_ahorro } = req.body;
        
        if (!meta_ahorro || isNaN(meta_ahorro) || meta_ahorro <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        await pool.query("UPDATE usuarios SET meta_ahorro = $1 WHERE id = $2", [meta_ahorro, id]);
        res.json({ success: true, meta_ahorro });
    } catch (error) {
        console.error('Error actualizando meta_ahorro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


app.put('/user/:id/currency', async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_moneda } = req.body;

        if (!tipo_moneda || (tipo_moneda !== 'COP' && tipo_moneda !== 'USD')) {
            return res.status(400).json({ error: 'Tipo de moneda inválido' });
        }

        await pool.query("UPDATE usuarios SET tipo_moneda = $1 WHERE id = $2", [tipo_moneda, id]);
        res.json({ success: true, tipo_moneda });
    } catch (error) {
        console.error('Error actualizando tipo_moneda:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
