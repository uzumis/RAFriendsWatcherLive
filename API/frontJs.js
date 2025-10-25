// CONSTANTES GLOBAIS
const RA_URL = "https://retroachievements.org/";
const NOTIFICATION_QUEUE = [];
const SHOWN_ACHIEVEMENTS = new Set();
const SHOWN_PLATINUMS = new Set();
let isShowingNotification = false;

// IDs dos elementos do DOM usados
const DOM_IDS = {
    STANDARD: 'standard-achievement',
    POPUP: 'achievement-popup',
    TEXT: 'achievement-text',
    TITLE: 'conquista-titulo',
    ICON: 'achievement-icon',
    PLAYER: 'chievo-player',
    USER_PHOTO: 'userPhoto',
    CHOCOLATE: 'chocolate-branco',
    SPECIAL: 'special-achievement',
    AUDIO: 'achievement-sound',
    FIFTY: 'fifty',
    PLATINUM_AUDIO: 'platinum-sound'
};

// Funções utilitárias
export async function fetchWithRetry(url, options = {}, retries = 5, delay = 1000) {
    let response;
    while (retries > 0) {
        try {
            response = await fetch(url, options);
            if (response.status === 429) {
                console.warn(`Too Many Requests. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries--;
                continue;
            }
            return response;
        } catch (err) {
            console.error(`Fetch failed: ${err.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
        }
    }
    throw new Error('Failed to fetch after retries');
}

export async function fetchPlayers() {
    try {
        const res = await fetch('http://localhost:1337/players');
        const players = await res.json();
        // Reutilização de variáveis e boas práticas
        for (const player of players) {
            try {
                await fetchWithRetry(`http://localhost:1337/players/${player.name}`, {}, 3, 1000);
            } catch (err) {
                console.error(`Error fetching data for ${player.name}:`, err);
            }
        }
        return players;
    } catch (err) {
        console.error('Error fetching players:', err);
        return [];
    }
}

export async function watchAllPlayers(players, showAchievement) {
    for (const player of players) {
        const achievements = await getRecentAchievo(player.name);
        if (!achievements || achievements.length === 0) continue;
        for (const achievement of achievements) {
            if (
                achievement &&
                achievement.achievementId &&
                achievement.achievementId !== player.lastAchievementId
            ) {
                showAchievement({
                    player: player.name,
                    title: achievement.title,
                    iconUrl: achievement.iconUrl,
                    chievoDesc: achievement.chievoDesc,
                    chievoTimestamp: achievement.chievoTimestamp,
                    achievementId: achievement.achievementId,
                    chievoPoints: achievement.chievoPoints,
                    gameName: achievement.gameData.gameTitle,
                    gameConsole: achievement.gameData.consoleName,
                    userId: achievement.userId,
                    userPhoto: achievement.userPhoto,
                });
                player.lastAchievementId = achievement.achievementId;
            }
        }
    }
}

export async function getRecentAchievo(username) {
    const response = await fetch(`http://localhost:1337/achievement?username=${encodeURIComponent(username)}`);
    if (!response.ok) return null;
    await new Promise(resolve => setTimeout(resolve, 600));
    return await response.json();
}

// Notificações
function showNotification(notification) {
    NOTIFICATION_QUEUE.push(notification);
    processNotificationQueue();
}

async function processNotificationQueue() {
    if (isShowingNotification || NOTIFICATION_QUEUE.length === 0) return;
    isShowingNotification = true;
    const { type, data } = NOTIFICATION_QUEUE.shift();
    if (type === 'achievement') {
        await processAchievement(data);
    } else if (type === 'platinum') {
        await processPlatinum(data);
    }
    isShowingNotification = false;
    if (NOTIFICATION_QUEUE.length > 0) {
        processNotificationQueue();
    }
}

async function processAchievement(achievement) {
    const { achievementId, player, title, iconUrl, chievoDesc, chievoTimestamp, chievoPoints, gameName, gameConsole, userPhoto } = achievement;
    try {
        const response = await fetch(`http://localhost:1337/achievement/exists/${achievementId}`);
        const exists = await response.json();
        if (exists) return;
    } catch (error) {
        console.error('Erro ao verificar conquista no backend:', error);
        return;
    }
    // Reutilização de variáveis DOM
    const popup = document.getElementById(DOM_IDS.POPUP);
    const text = document.getElementById(DOM_IDS.TEXT);
    const cabe = document.getElementById(DOM_IDS.TITLE);
    const icon = document.getElementById(DOM_IDS.ICON);
    const playerElement = document.getElementById(DOM_IDS.PLAYER);
    const userPhotoElement = document.getElementById(DOM_IDS.USER_PHOTO);
    userPhotoElement.src = RA_URL + userPhoto;
    cabe.innerHTML = `${gameName} - ${gameConsole} <br>`;
    cabe.style.fontWeight = 'bold';
    playerElement.innerHTML = `<strong>${player}</strong>`;
    text.innerHTML = `${title}`;
    icon.src = RA_URL + iconUrl;
    popup.style.display = 'flex';
    const chocolateBranco = document.getElementById(DOM_IDS.CHOCOLATE);
    const specialAchievement = document.getElementById(DOM_IDS.SPECIAL);
    let audio = document.getElementById(DOM_IDS.AUDIO);
    const superAchievement = document.getElementById(DOM_IDS.FIFTY);
    // Garante que nenhum som fique tocando junto
    [chocolateBranco, specialAchievement, audio, superAchievement].forEach(aud => {
        if (aud) {
            aud.pause();
            aud.currentTime = 0;
        }
    });
    let played = false;
    // Sempre tenta tocar o custom, mas se não houver, usa o padrão para todas as raridades
    let customPlayed = false;
    if (player === 'lulinhaa' && chocolateBranco) {
        chocolateBranco.play();
        customPlayed = true;
    } else if (Number(chievoPoints) === 25 && specialAchievement) {
        specialAchievement.play();
        customPlayed = true;
    } else if (Number(chievoPoints) >= 50 && superAchievement) {
        superAchievement.play();
        customPlayed = true;
    } else if (audio) {
        audio.play();
        customPlayed = true;
    }
    if (!customPlayed) {
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = DOM_IDS.AUDIO;
            audio.src = './som/chievosound.mp3';
            document.body.appendChild(audio);
        } else {
            audio.src = './som/chievosound.mp3';
        }
        audio.currentTime = 0;
        audio.play();
    }
    await new Promise(resolve => setTimeout(resolve, 6000));
    popup.style.display = 'none';
    try {
        const response = await fetch('http://localhost:1337/achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player,
                title,
                iconUrl: RA_URL + iconUrl,
                chievoDesc,
                chievoTimestamp,
                chievoPoints,
                gameName,
                gameConsole,
                achievementId,
                userPhoto: RA_URL + userPhoto
            })
        });
        if (!response.ok) {
            console.error('Erro ao salvar conquista:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição POST:', error);
    }
}

async function processPlatinum(platinum) {
    const { player, title, consoleName, awardedAt, imageIcon, userPhoto } = platinum;
    const platinumKey = `${player}-${title}-${awardedAt}`;
    if (SHOWN_PLATINUMS.has(platinumKey)) return;
    try {
        const response = await fetch('http://localhost:1337/achievement/chievoData.json');
        if (response.ok) {
            const chievos = await response.json();
            const alreadyExists = chievos.some(c =>
                c.player === player &&
                c.title === title &&
                c.gameConsole === consoleName
            );
            if (alreadyExists) return;
        }
    } catch (error) {
        console.error('Erro ao verificar chievoData.json:', error);
    }
    SHOWN_PLATINUMS.add(platinumKey);
    // Reutilização de variáveis DOM
    const popup = document.getElementById(DOM_IDS.POPUP);
    const text = document.getElementById(DOM_IDS.TEXT);
    const cabe = document.getElementById(DOM_IDS.TITLE);
    const userPhotoElement = document.getElementById(DOM_IDS.USER_PHOTO);
    const icon = document.getElementById(DOM_IDS.ICON);
    const playerElement = document.getElementById(DOM_IDS.PLAYER);
    userPhotoElement.src = RA_URL + userPhoto;
    icon.src = RA_URL + imageIcon;
    playerElement.innerHTML = `<strong>🎉${player}🎉</strong>`;
    cabe.innerHTML = `🎉 PLATINOU o jogo! 🎉`;
    cabe.style.fontWeight = 'bold';
    text.innerHTML = `${title} - ${consoleName}<br>`;
    popup.classList.add('platinum-popup');
    popup.style.display = 'flex';
    const audio = document.getElementById(DOM_IDS.PLATINUM_AUDIO);
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    await new Promise(resolve => setTimeout(resolve, 6000));
    popup.style.display = 'none';
    popup.classList.remove('platinum-popup');
    try {
        const response = await fetch('http://localhost:1337/platinums/savePlatinum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player,
                title,
                consoleName,
                awardedAt,
                imageIcon: RA_URL + imageIcon,
                userPhoto: RA_URL + userPhoto
            })
        });
        if (!response.ok) {
            console.error('Erro ao salvar platina:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição POST:', error);
    }
}

function showAchievement(achievement) {
    showNotification({ type: 'achievement', data: achievement });
}

async function checkPlatinums() {
    let players = await fetchPlayers();
    if (!players || players.length === 0) return;
    const now = new Date();
    const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const targetDate = offsetDate.toISOString().split('T')[0];
    try {
        const response = await fetch('http://localhost:1337/platinums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players })
        });
        if (!response.ok) return;
        const results = await response.json();
        for (const { player, platinum, userPhoto } of results) {
            if (platinum) {
                const awardedDate = new Date(platinum.awardedAt).toISOString().split('T')[0];
                if (awardedDate === targetDate) {
                    showNotification({
                        type: 'platinum',
                        data: {
                            player,
                            title: platinum.title,
                            consoleName: platinum.consoleName,
                            awardedAt: platinum.awardedAt,
                            imageIcon: platinum.imageIcon,
                            userPhoto: userPhoto
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error checking platinums:', error);
    }
}

async function startWatching() {
    let players = await fetchPlayers();
    if (!players || players.length === 0) return;
    async function watchPlayersWithDelay() {
        players = await fetchPlayers();
        await watchAllPlayers(players, showAchievement);
        setTimeout(watchPlayersWithDelay, 10000);
    }
    watchPlayersWithDelay();
    setInterval(checkPlatinums, 60000);
}

// Inicialização automática
startWatching();