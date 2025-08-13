export async function getRecentAchievo(username) {
    console.log(username);
  const response = await fetch(`http://localhost:1337/achievement?username=${encodeURIComponent(username)}`);
  if (!response.ok) return null;
          // Adiciona um delay de 500ms entre as requisições
        await new Promise(resolve => setTimeout(resolve, 600));
  return await response.json();
}

export async function watchAllPlayers(players, showAchievement) {
    for (const player of players) {
        console.log(player);
        const achievements = await getRecentAchievo(player.name);
        if (!achievements || achievements.length === 0) continue;
        console.log(`Recent achievements for ${player.name}:`, achievements);
        achievements.forEach((achievement) => {
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

                // Atualiza o último achievementId processado
                player.lastAchievementId = achievement.achievementId;
            }
        });


    }
}