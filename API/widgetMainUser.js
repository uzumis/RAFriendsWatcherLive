document.addEventListener('DOMContentLoaded', async () => {
  const card = document.getElementById('mainUserCard');
  try {
    const res = await fetch('/mainuser');
    const data = await res.json();
    card.innerHTML = `
      <div class="main-user-widget">
        <div class="main-user-title">${data.user}</div>
        <div class="main-user-game">Jogando: <span>${data.title}</span></div>
        <div class="main-user-completion">Completion Hardcore: <span>${data.userCompletionHardcore}%</span></div>
        <div class="main-user-achievements">Conquistas: <span>${data.numAwardedToUserHardcore} / ${data.numAchievements} (hardcore)</span></div>
      </div>
    `;
  } catch (err) {
    card.innerHTML = `<div class="main-user-error">Erro ao carregar dados do usuário</div>`;
  }
});
