import express from 'express';
import fs from 'fs';
import { buildAuthorization, getUserAwards, getUserProfile } from '@retroachievements/api';

const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.username;
const webApiKey = process.env.webApiKey;
const authorization = buildAuthorization({ username, webApiKey });

router.post('/', async (req, res) => {
    const { players } = req.body;
    if (!players || !Array.isArray(players)) {
        return res.status(400).json({ error: 'Players array is required' });
    }

    try {
        const results = [];
        for (const player of players) {
            try {
                const userAwards = await getUserAwards(authorization, { username: player.name });
                if (!userAwards || !userAwards.visibleUserAwards) {
                    results.push({ player: player.name, platinum: null, userPhoto: null });
                    continue;
                }

                const userProfile = await getUserProfile(authorization, { username: player.name });

                const filteredAwards = userAwards.visibleUserAwards
                    .filter(award => award.awardType === "Mastery/Completion")
                    .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt));

                const latestPlatinum = filteredAwards[0];

                results.push({
                    player: player.name,
                    userPhoto: userProfile.userPic || null,
                    platinum: latestPlatinum
                        ? {
                            title: latestPlatinum.title,
                            consoleName: latestPlatinum.consoleName,
                            awardType: latestPlatinum.awardType,
                            awardedAt: latestPlatinum.awardedAt,
                            imageIcon: latestPlatinum.imageIcon
                        }
                        : null
                });
            } catch (err) {
                results.push({ player: player.name, platinum: null, userPhoto: null });
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/savePlatinum', (req, res) => {
    const {
        player,
        title,
        consoleName,
        awardedAt,
        imageIcon,
        userPhoto
    } = req.body;

    fs.readFile('./chievoData.json', 'utf8', (err, data) => {
        let platinums = [];
        if (!err && data) {
            try {
                platinums = JSON.parse(data);
                if (!Array.isArray(platinums)) platinums = [];
            } catch (e) {
                platinums = [];
            }
        }

        // Verificar se já existe uma platina com o mesmo jogador e título
        const jaExiste = platinums.some(c => c.player === player && c.title === title);
        if (jaExiste) {
            return res.status(200).send('Platina já cadastrada!');
        }

        // Adicionar a nova platina ao array
        platinums.push({
            player,
            title,
            iconUrl: imageIcon,
            chievoDesc: "Platina obtida!",
            chievoTimestamp: awardedAt,
            chievoPoints: 0, // Pontuação para platinas pode ser 0 ou personalizada
            gameName: title,
            gameConsole: consoleName,
            userPhoto
        });

        // Salvar o array atualizado no arquivo
        const platinumsStr = JSON.stringify(platinums, null, 2);

        fs.writeFile('./chievoData.json', platinumsStr, (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar platinas');
            }
            res.send('Platina salva com sucesso!');
        });
    });
});
export default router;