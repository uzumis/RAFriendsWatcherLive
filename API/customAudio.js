// API/customAudio.js
// Endpoints para ler e salvar customaudio.json


import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_PATH = path.join(__dirname, '../customaudio.json');

// GET: retorna o JSON de áudios customizados
router.get('/', (req, res) => {
  fs.readFile(AUDIO_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler customaudio.json' });
    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (e) {
      res.status(500).json({ error: 'JSON inválido' });
    }
  });
});

// POST: atualiza o JSON de áudios customizados
router.post('/', (req, res) => {
  const newData = req.body;
  fs.writeFile(AUDIO_PATH, JSON.stringify(newData, null, 2), 'utf8', err => {
    if (err) return res.status(500).json({ error: 'Erro ao salvar customaudio.json' });
    res.json({ success: true });
  });
});

export default router;
