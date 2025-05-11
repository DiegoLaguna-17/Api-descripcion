import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde .env
const GEMINI_KEY = 'AIzaSyApg0wYo2I2Kk4p1mkRItgyalpe4sxn1NQ';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
import cors from 'cors';

// Habilitar CORS
app.use(cors());


app.post('/describir_ruta', async (req, res) => {
    try {
        const { latitud_inicio, longitud_inicio, latitud_fin, longitud_fin } = req.body;

        if (!latitud_inicio || !longitud_inicio || !latitud_fin || !longitud_fin) {
            return res.status(400).json({ error: 'Faltan coordenadas en la petición.' });
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

        async function main() {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `dame una descripcion de la ruta entre estas dos ubicaciones: ${latitud_inicio} ${longitud_inicio} y ${latitud_fin} ${longitud_fin}, no quiero indicaciones de las rutas quiero una descripcion el ambiente y cosas turisticas de la ruta en menos de 200 caracteres, habla de la zona. no agregues de nuevo las coordenadas.`
                });
                console.log(response.text);
                res.json({ descripcion: response.text }); // Enviar la respuesta aquí
            } catch (error) {
                console.error('Error al obtener la descripción de GenAI:', error);
                res.status(500).json({ error: 'Error al obtener la descripción de la ruta.' });
            }
        }

        await main(); // Esperar a que main() se complete

    } catch (error) {
        console.error('Error al procesar la petición:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.get('/ejemplo_error', (req, res) => {
    res.status(404).json({ error: 'Elemento no encontrado' });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});