import express from 'express';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { buildAuthorization, getUserProfile } from '@retroachievements/api';

const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.username;
const webApiKey = process.env.webApiKey;
const authorization = buildAuthorization({ username, webApiKey });

const userDataPath = './userData.json';



// Função para ler o arquivo userData.json
function readUserData() {
    try {
        const data = fs.readFileSync(userDataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Função para salvar dados no userData.json
function writeUserData(data) {
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
    fs.readFile('./players.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler a lista de jogadores');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});
// Endpoint para obter ou atualizar o perfil de um usuário
router.get('/:username', async (req, res) => {
    const { username } = req.params;

    // Verifica se o perfil já está no userData.json
    const users = readUserData();
    const existingUser = users.find(user => user.name === username);

    if (existingUser) {
        return res.json(existingUser);
    }

    try {
        // Obtém o perfil do usuário da API externa
        const userProfile = await getUserProfile(authorization, { username });
        const newUser = {
            userId: userProfile.ulid,
            name: username,
            userPic: userProfile.userPic,
        };

        // Salva o novo perfil no userData.json
        users.push(newUser);
        writeUserData(users);

        res.json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const playersFile = './players.json';

router.get('/', async (req, res) => {
    try {
        const data = await fsPromise.readFile(playersFile, 'utf8');
        const players = JSON.parse(data);
        res.json(players);
    } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
        res.status(500).send('Erro ao carregar jogadores.');
    }
});

// Adicionar jogador
router.post('/', async (req, res) => {
    const { name } = req.body;

    try {
        const data = await fsPromise.readFile(playersFile, 'utf8');
        const players = JSON.parse(data);
        players.push({ name });
        await fsPromise.writeFile(playersFile, JSON.stringify(players, null, 2));
        res.status(201).send('Jogador adicionado com sucesso.');
    } catch (error) {
        console.error('Erro ao adicionar jogador:', error);
        res.status(500).send('Erro ao adicionar jogador.');
    }
});

// Atualizar jogador
router.put('/:index', async (req, res) => {
    const { index } = req.params;
    const { name } = req.body;

    try {
        const data = await fsPromise.readFile(playersFile, 'utf8');
        const players = JSON.parse(data);
        players[index].name = name;
        await fsPromise.writeFile(playersFile, JSON.stringify(players, null, 2));
        res.send('Jogador atualizado com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar jogador:', error);
        res.status(500).send('Erro ao atualizar jogador.');
    }
});

// Excluir jogador
router.delete('/:index', async (req, res) => {
    const { index } = req.params;

    try {
        const data = await fsPromise.readFile(playersFile, 'utf8');
        const players = JSON.parse(data);
        players.splice(index, 1);
        await fsPromise.writeFile(playersFile, JSON.stringify(players, null, 2));
        res.send('Jogador excluído com sucesso.');
    } catch (error) {
        console.error('Erro ao excluir jogador:', error);
        res.status(500).send('Erro ao excluir jogador.');
    }
});


export default router;