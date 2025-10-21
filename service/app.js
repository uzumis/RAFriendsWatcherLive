import express from 'express';
import cors from 'cors';

import achievementRoutes from './achievementService.js';
import platinumRoutes from './platinumService.js';
import playerRoutes from './playerService.js';
import adminRoutes from './adminService.js';
import customAudioRoutes from '../API/customAudio.js';
import uploadAudioRoutes from '../API/uploadAudio.js';
import mainUserRoutes from './mainUserService.js';

const app = express();
const PORT = 1337;

const username = process.env.ra_username;

app.use(express.static('.'));

app.use(cors());
app.use(express.json());

// Rotas
app.use('/achievement', achievementRoutes);
app.use('/platinums', platinumRoutes);
app.use('/players', playerRoutes);

app.use('/admin', adminRoutes);
app.use('/customaudio', customAudioRoutes);
app.use('/uploadaudio', uploadAudioRoutes);
app.use('/mainuser', mainUserRoutes);

app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});