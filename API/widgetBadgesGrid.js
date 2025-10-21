
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('badgesGrid');

  let lastData = null;

  function renderBadges(achievements) {
    if (!achievements) return;
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
    // Reinicia o scroll sempre que renderizar badges
    grid.scrollTop = 0;
    direction = 1;
  }

  async function fetchAndUpdate() {
    try {
      const res = await fetch('/mainuser/achievements');
      if (!res.ok) return;
      const data = await res.json();
      if (JSON.stringify(data.achievements) !== JSON.stringify(lastData)) {
        lastData = data.achievements;
        renderBadges(data.achievements);
      }
    } catch (e) {
      // Não faz nada se der erro
    }
  }

  setInterval(fetchAndUpdate, 1000);
  fetchAndUpdate();

  // Auto scroll suave
  let direction = 1; // 1 = descendo, -1 = subindo
  let scrollInterval;
  function startAutoScroll() {
    scrollInterval = setInterval(() => {
      const maxScroll = grid.scrollHeight - grid.clientHeight;
      if (direction === 1) {
        grid.scrollTop += 1;
        if (grid.scrollTop >= maxScroll) direction = -1;
      } else {
        grid.scrollTop -= 1;
        if (grid.scrollTop <= 0) direction = 1;
      }
    }, 1); // velocidade do scroll
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
