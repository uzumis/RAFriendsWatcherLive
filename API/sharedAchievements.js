// API/sharedAchievements.js

let sharedAchievementsData = null;
let sharedAchievementsUsername = '';
let sharedAchievementsListeners = [];

async function fetchSharedAchievements() {
  try {
    const response = await fetch('/mainuser/achievements');
    if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
    const data = await response.json();
    const username = (data.username || '').toUpperCase();
    const achievements = data.achievements;
    // Só atualiza se mudou
    if (JSON.stringify(sharedAchievementsData) !== JSON.stringify(achievements)) {
      sharedAchievementsData = achievements;
      sharedAchievementsUsername = username;
      sharedAchievementsListeners.forEach(fn => fn(achievements, username));
    }
  } catch (error) {
    console.error('Erro ao buscar conquistas compartilhadas:', error);
  }
}

function onSharedAchievementsUpdate(fn) {
  sharedAchievementsListeners.push(fn);
  // Chama imediatamente se já tem dados
  if (sharedAchievementsData) fn(sharedAchievementsData, sharedAchievementsUsername);
}

// Atualiza a cada 30 segundos
fetchSharedAchievements();
setInterval(fetchSharedAchievements, 30000);

export { onSharedAchievementsUpdate, fetchSharedAchievements, sharedAchievementsData, sharedAchievementsUsername };