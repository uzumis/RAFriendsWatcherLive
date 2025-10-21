import express from 'express';
import { buildAuthorization, getUserProfile, getGameInfoAndUserProgress } from "@retroachievements/api";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();


const cacheFile = path.join(process.cwd(), 'cache', 'cache-achievements.json');
let cacheData = null;
let lastUpdate = 0;

// Função para atualizar o cache a cada 30 segundos
async function updateAchievementsCache() {
  try {
    const username = process.env.ra_username;
    const webApiKey = process.env.webApiKey;
    const authorization = buildAuthorization({ username, webApiKey });
    const userProfile = await getUserProfile(authorization, { username });
    const gameInfoAndUserProgress = await getGameInfoAndUserProgress(
      authorization,
      {
        username,
        gameId: userProfile.lastGameId,
      }
    );
    cacheData = {
      username,
      user: userProfile.user,
      title: gameInfoAndUserProgress.title,
      userCompletionHardcore: gameInfoAndUserProgress.userCompletionHardcore,
      numAchievements: gameInfoAndUserProgress.numAchievements,
      numAwardedToUserHardcore: gameInfoAndUserProgress.numAwardedToUserHardcore,
      achievements: gameInfoAndUserProgress.achievements
    };
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    lastUpdate = Date.now();
  } catch (err) {
    console.error('Erro ao atualizar cache de conquistas:', err);
  }
}

// Atualiza o cache a cada 30 segundos
setInterval(updateAchievementsCache, 30000);
// Atualiza ao iniciar o servidor
updateAchievementsCache();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Se o cache existe e foi atualizado nos últimos 35 segundos, retorna do cache
    if (cacheData && Date.now() - lastUpdate < 35000) {
      // Retorna todos os dados do cache, exceto achievements
      const { achievements, ...userData } = cacheData;
      return res.json(userData);
    }
    // Se não, tenta ler do arquivo
    if (fs.existsSync(cacheFile)) {
      const fileData = fs.readFileSync(cacheFile, 'utf8');
      const json = JSON.parse(fileData);
      cacheData = json;
      const { achievements, ...userData } = json;
      return res.json(userData);
    }
    // Se não tem cache, retorna erro
    res.status(503).json({ error: 'Cache não disponível' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário', details: err.message });
  }
});

router.get('/achievements', async (req, res) => {
  try {
    // Se o cache existe e foi atualizado nos últimos 35 segundos, retorna do cache
    if (cacheData && Date.now() - lastUpdate < 35000) {
      return res.json({ username: cacheData.username, achievements: cacheData.achievements });
    }
    // Se não, tenta ler do arquivo
    if (fs.existsSync(cacheFile)) {
      const fileData = fs.readFileSync(cacheFile, 'utf8');
      const json = JSON.parse(fileData);
      cacheData = json;
      return res.json({ username: json.username, achievements: json.achievements });
    }
    // Se não tem cache, retorna erro
    res.status(503).json({ error: 'Cache não disponível' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar conquistas', details: err.message });
  }
});

export default router;