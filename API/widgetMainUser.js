document.addEventListener('DOMContentLoaded', async () => {
  const card = document.getElementById('mainUserCard');
  let lastValidData = null;
  async function renderMainUser() {
    try {
      const res = await fetch('/mainuser');
      const data = await res.json();
      // Verifica se os dados são válidos
      if (
        data &&
        typeof data === 'object' &&
        data.user &&
        data.title &&
        data.userCompletionHardcore &&
        data.numAwardedToUserHardcore !== undefined &&
        data.numAchievements !== undefined &&
        data.numAwardedToUserHardcore !== 'undefined' &&
        data.numAchievements !== 'undefined'
      ) {
        lastValidData = data;
        card.innerHTML = `
            <div class="main-user-stats">
              <div class="main-user-completion"><span>${data.userCompletionHardcore}</span></div>
              <div class="main-user-achievements"><span>${data.numAwardedToUserHardcore} / ${data.numAchievements}</span></div>
            </div>
        `;
      } else if (lastValidData) {
        const d = lastValidData;
        card.innerHTML = `
            <div class="main-user-stats">
              <div class="main-user-completion"><span>${d.userCompletionHardcore}</span></div>
              <div class="main-user-achievements"><span>${d.numAwardedToUserHardcore} / ${d.numAchievements}</span></div>
            </div>
        `;
      } else {
        card.innerHTML = `<div class="main-user-error">Erro ao carregar dados do usuário</div>`;
      }
    } catch (err) {
      if (lastValidData) {
        const d = lastValidData;
        card.innerHTML = `
            <div class="main-user-stats">
              <div class="main-user-completion"><span>${d.userCompletionHardcore}</span></div>
              <div class="main-user-achievements"><span>${d.numAwardedToUserHardcore} / ${d.numAchievements}</span></div>
            </div>
        `;
      } else {
        card.innerHTML = `<div class="main-user-error">Erro ao carregar dados do usuário</div>`;
      }
    }
  }
  await renderMainUser();
  setInterval(renderMainUser, 50000);
});
