
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('mainUserCard');
  let lastValidData = null;

  async function fetchAndUpdate() {
    try {
      const res = await fetch('/mainuser');
      const data = await res.json();
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
      }
    } catch (err) {
      // Não faz nada se der erro
    }
  }

  setInterval(fetchAndUpdate, 1000);
  fetchAndUpdate();
});
