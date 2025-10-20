import express from 'express';
import { buildAuthorization, getUserProfile, getGameInfoAndUserProgress } from "@retroachievements/api";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
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

    res.json({
      user: userProfile.user,
      title: gameInfoAndUserProgress.title,
      userCompletionHardcore: gameInfoAndUserProgress.userCompletionHardcore,
      numAchievements: gameInfoAndUserProgress.numAchievements,
      numAwardedToUserHardcore: gameInfoAndUserProgress.numAwardedToUserHardcore
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário', details: err.message });
  }
});

router.get('/achievements', async (req, res) => {
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

    res.json(gameInfoAndUserProgress.achievements);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar conquistas', details: err.message });
  }
});

export default router;