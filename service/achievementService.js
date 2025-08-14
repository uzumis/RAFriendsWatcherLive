import express from 'express';
import fs from 'fs/promises'; // Usando a versão de Promises do fs para simplificar
import { buildAuthorization, getGame, getUserRecentAchievements } from '@retroachievements/api';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const username = process.env.username;
const webApiKey = process.env.webApiKey;

const authorization = buildAuthorization({ username, webApiKey });

let users = [];
const achievementsCache = new Map();
const gameDataCache = new Map();

// Função para carregar o arquivo userData.json na inicialização
async function loadUserData() {
    try {
        const data = await fs.readFile('./userData.json', 'utf8');
        users = JSON.parse(data);
        console.log('userData.json carregado com sucesso.');
    } catch (err) {
        console.error('Erro ao carregar userData.json:', err);
        users = [];
    }
}

// Função para obter conquistas com cache
async function getCachedAchievements(username) {
    if (achievementsCache.has(username)) {
        const cached = achievementsCache.get(username);
        // Retorna o cache se for recente (ex.: 1 minuto)
        if (Date.now() - cached.timestamp < 60000) {
            return cached.data;
        }
    }

    const achievements = await getUserRecentAchievements(authorization, { username });
    achievementsCache.set(username, { data: achievements, timestamp: Date.now() });
    return achievements;
}

// Função para obter dados do jogo com cache
async function getCachedGameData(gameId) {
    if (gameDataCache.has(gameId)) {
        return gameDataCache.get(gameId);
    }

    const gameData = await getGame(authorization, { gameId });
    gameDataCache.set(gameId, gameData);
    return gameData;
}

// Retry com backoff exponencial
async function fetchWithRetry(fetchFunction, args, retries = 5, delay = 1000) {
    try {
        return await fetchFunction(...args);
    } catch (err) {
        if (err.response?.status === 429 && retries > 0) {
            console.warn(`Too Many Requests. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(fetchFunction, args, retries - 1, delay * 2); // Aumenta o delay exponencialmente
        }
        throw err;
    }
}

// Endpoint para obter conquistas
router.get('/', async (req, res) => {
    loadUserData();
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'username required' });

    try {
        const userProfile = users.find(user => user.name === username);
        if (!userProfile) {
            console.error(`Perfil do usuário não encontrado para o username: ${username}`);
            return res.status(404).json({ error: 'Perfil do usuário não encontrado' });
        }

        const achievements = await getUserRecentAchievements(authorization, { username });
        if (!achievements || achievements.length === 0) return res.json([]);

        const results = await Promise.all(
            achievements.map(async (achievement) => {
                const gameData = await getCachedGameData(achievement.gameId);
                return {
                    achievementId: achievement.AchievementID || achievement.achievementId,
                    title: achievement.Title || achievement.title,
                    iconUrl: achievement.badgeUrl,
                    chievoDesc: achievement.description,
                    chievoTimestamp: achievement.date,
                    chievoPoints: achievement.points,
                    gameData: {
                        gameTitle: gameData.gameTitle,
                        consoleName: gameData.consoleName,
                    },
                    userId: userProfile.userId,
                    userPhoto: userProfile.userPic,
                };
            })
        );

        res.json(results);
    } catch (err) {
        console.error('Erro ao processar conquistas:', err);
        res.status(500).json({ error: 'Erro ao processar conquistas' });
    }
});

// Endpoint para salvar conquistas
router.post('/', async (req, res) => {
    const {
        player,
        title,
        iconUrl,
        chievoDesc,
        chievoTimestamp,
        achievementId,
        chievoPoints,
        gameName,
        gameConsole,
        userId,
        userPhoto
    } = req.body;

    try {
        const data = await fs.readFile('./chievoData.json', 'utf8').catch(() => '[]');
        const conquistas = JSON.parse(data);

        // Verificar duplicatas com base em múltiplos campos
        const jaExiste = conquistas.some(c =>
            c.player === player &&
            c.title === title &&
            c.chievoTimestamp === chievoTimestamp &&
            c.achievementId === achievementId
        );

        if (jaExiste) {
            console.log(`Conquista já cadastrada: ${title} (${achievementId})`);
            return res.status(200).send('Conquista já cadastrada!');
        }

        // Adicionar nova conquista
        conquistas.push({
            player,
            title,
            iconUrl,
            chievoDesc,
            chievoTimestamp,
            achievementId,
            chievoPoints,
            gameName,
            gameConsole,
            userId,
            userPhoto
        });

        await fs.writeFile('./chievoData.json', JSON.stringify(conquistas, null, 2));
        res.send('Conquista salva com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar conquista:', err);
        res.status(500).send('Erro ao salvar conquistas');
    }
});

// Endpoint para obter conquistas salvas
router.get('/chievoData.json', async (req, res) => {
    try {
        const data = await fs.readFile('./chievoData.json', 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (err) {
        console.error('Erro ao ler conquistas:', err);
        res.status(500).send('Erro ao ler conquistas');
    }
});

router.get('/exists/:achievementId', async (req, res) => {
    const { achievementId } = req.params;

    try {
        const data = await fs.readFile('./chievoData.json', 'utf8');
        const achievements = JSON.parse(data);
        const exists = achievements.some(a => a.achievementId === parseInt(achievementId, 10));
        res.json(exists);
    } catch (error) {
        console.error('Erro ao verificar conquista:', error);
        res.status(500).json(false);
    }
});

router.delete('/:achievementId', async (req, res) => {
    const { achievementId } = req.params;
    try {
        const data = await fs.readFile('./chievoData.json', 'utf8');
        let conquistas = JSON.parse(data);

        const initialLength = conquistas.length;
        conquistas = conquistas.filter(c => String(c.achievementId) !== String(achievementId));

        if (conquistas.length === initialLength) {
            return res.status(404).send('Conquista não encontrada.');
        }

        await fs.writeFile('./chievoData.json', JSON.stringify(conquistas, null, 2));
        res.send('Conquista excluída com sucesso!');
    } catch (err) {
        console.error('Erro ao excluir conquista:', err);
        res.status(500).send('Erro ao excluir conquista');
    }
});

loadUserData();

export default router;