let lastWidgetIds = new Set();
function renderWidget(conquistas) {
  const ul = document.getElementById('widget-conquistas');
  ul.innerHTML = '';
  // Mostra apenas as 3 conquistas mais recentes
  conquistas.slice(-3).reverse().forEach(c => {
    const li = document.createElement('li');
    li.classList.add('widget-fadein');
    if (c.chievoDesc === "Platina obtida!") {
      li.classList.add('platinum');
      li.innerHTML = `
       
        <img src="${c.iconUrl}" alt="${c.title}">
        <span class= "container-platinum">
        <small>${c.player}</small>
        <strong>${c.title}</strong><br>
        </span>
      `;
    } else {
      li.innerHTML = `
        
        <img src="${c.iconUrl}" alt="${c.title}">
        <span class= "container-achievement">
        <small>${c.player}</small>
        <span><strong>${c.title}</strong><br>
        <small>${c.gameName} - (${c.chievoPoints} pts)</small>
        </span>
      `;
    }
    ul.appendChild(li);
  });
}
async function fetchAndUpdateWidget() {
  const res = await fetch('http://localhost:1337/achievement/chievoData.json');
  const conquistas = await res.json();
  const currentIds = new Set(conquistas.map(c => c.achievementId + '-' + c.chievoTimestamp));
  if (currentIds.size !== lastWidgetIds.size || [...currentIds].some(id => !lastWidgetIds.has(id))) {
    renderWidget(conquistas);
    lastWidgetIds = currentIds;
  }
}
fetchAndUpdateWidget();
setInterval(fetchAndUpdateWidget, 5000);
