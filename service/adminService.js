import express from 'express';
import fs from 'fs/promises';

const router = express.Router();

// Endpoint para apagar o cache dos jogadores
router.post('/clear-cache', async (req, res) => {
  try {
    await fs.writeFile('./userData.json', '[]');
    console.log('Cache dos jogadores apagado com sucesso.');
    res.status(200).send('Cache dos jogadores apagado com sucesso.');
  } catch (error) {
    console.error('Erro ao apagar o cache dos jogadores:', error);
    res.status(500).send('Erro ao apagar o cache dos jogadores.');
  }
});

// Endpoint para limpar o histórico de jogadores
router.post('/clear-history', async (req, res) => {
  try {
    await fs.writeFile('./chievoData.json', '[]');
    console.log('Histórico de jogadores apagado com sucesso.');
    res.status(200).send('Histórico de jogadores apagado com sucesso.');
  } catch (error) {
    console.error('Erro ao limpar o histórico de jogadores:', error);
    res.status(500).send('Erro ao limpar o histórico de jogadores.');
  }
});

export default router;