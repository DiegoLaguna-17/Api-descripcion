import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_KEY || 'AIzaSyApg0wYo2I2Kk4p1mkRItgyalpe4sxn1NQ';
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/describir_ruta', async (req, res) => {
  try {
    const { latitud_inicio, longitud_inicio, latitud_fin, longitud_fin } = req.body;

    if (!latitud_inicio || !longitud_inicio || !latitud_fin || !longitud_fin) {
      return res.status(400).json({ error: 'Faltan coordenadas en la petición.' });
    }
    //key 1 7bfad773-8832-4eee-9d15-1a9d07c3a5c1
  // key 2 63b19cd4-a9f9-47bd-a58b-0273d67721fa
    const graphhopperApiKey = '63b19cd4-a9f9-47bd-a58b-0273d67721fa';
    const url = `https://graphhopper.com/api/1/route?point=${latitud_inicio},${longitud_inicio}&point=${latitud_fin},${longitud_fin}&vehicle=car&locale=es&key=${graphhopperApiKey}&points_encoded=false`;

    const response = await axios.get(url);
    const path = response.data.paths[0];
    const instrucciones = path.instructions.map(i => i.text).join(', ');
    console.log(instrucciones);

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      `Dame una descripción de la ruta entre estas dos ubicaciones: ${latitud_inicio} ${longitud_inicio} y ${latitud_fin} ${longitud_fin},`,
      `detalla el camino: '${instrucciones}' en base a las instrucciones habla un poco del camino, hazlo con 90 palabras y que tenga mas carisma , recuerda que la ciudad es La Paz`,
    ]);

    const text = await result.response.text(); // Usa await aquí
    console.log(text);

    res.json({ descripcion: text });

  } catch (error) {
    console.error('Error al procesar la petición:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
