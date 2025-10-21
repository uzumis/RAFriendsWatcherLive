document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('badgesGrid');
  async function renderBadges() {
    try {
      const res = await fetch('/mainuser/achievements');
      if (!res.ok) throw new Error('Erro na requisição: ' + res.status);
      const data = await res.json();
      const achievements = data.achievements;
      grid.innerHTML = '';
      let achArray = Object.values(achievements);
      // Ordena: conquistas com dateEarnedHardcore primeiro
      achArray = achArray.sort((a, b) => {
        if (a.dateEarnedHardcore && !b.dateEarnedHardcore) return -1;
        if (!a.dateEarnedHardcore && b.dateEarnedHardcore) return 1;
        return 0;
      });
      achArray.forEach(achievement => {
        let badgeName = achievement.badgeName;
        if (!achievement.dateEarnedHardcore) {
          badgeName += '_lock';
        }
        const badgeUrl = `https://media.retroachievements.org/Badge/${badgeName}.png`;
        let borderColor = '#444';
        const pts = achievement.points;
        if (pts >= 10 && pts <= 24) borderColor = 'lime';
        else if (pts >= 25 && pts <= 49) borderColor = '#00aaff';
        else if (pts >= 50 && pts <= 99) borderColor = 'orange';
        else if (pts >= 100) borderColor = 'red';
        const badgeImg = document.createElement('img');
        badgeImg.src = badgeUrl;
        badgeImg.alt = '';
        badgeImg.className = 'badge-img';
        badgeImg.style.border = `2.5px solid ${borderColor}`;
        grid.appendChild(badgeImg);
      });
    } catch (error) {
      // Não altera nada na div se der erro
      console.error('Erro ao buscar badges:', error);
    }
  }
  await renderBadges();
  setInterval(renderBadges, 30000);
  // Auto scroll suave
  let direction = 1; // 1 = descendo, -1 = subindo
  let scrollInterval;
  function startAutoScroll() {
    const maxScroll = grid.scrollHeight - grid.clientHeight;
    scrollInterval = setInterval(() => {
      if (direction === 1) {
        grid.scrollTop += 1;
        if (grid.scrollTop >= maxScroll) direction = -1;
      } else {
        grid.scrollTop -= 1;
        if (grid.scrollTop <= 0) direction = 1;
      }
    }, 30); // velocidade do scroll
    // Verificação contínua se está scrollando
    setInterval(() => {
      const isScrolling = grid.scrollHeight > grid.clientHeight;
      console.log('Grid está scrollando?', isScrolling);
    }, 1000); // verifica a cada segundo
  }
  startAutoScroll();
  // Para o scroll ao sair da página
  window.addEventListener('beforeunload', () => clearInterval(scrollInterval));
});
