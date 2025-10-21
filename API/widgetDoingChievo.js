// API/widgetDoingChievo.js
// Busca do backend a cada segundo
let lastData = null;
let lastUsername = '';
let lastSelectedAchievementTitle = null;
let userSelectedCard = false;
let meme = [
  "está querendo a conquista",
  "está sofrendo por uma conquista",
  "não consegue a conquista",
  "quer muito a conquista",
  "deseja ardentemente a conquista",
  "está chorando por uma conquista",
  "está aborrecido pela conquista",
  "não desiste em ter a conquista",
  "já sonhou com essa conquista umas 3 vezes",
  "pediu ajuda até pro chatGPT pra conseguir essa conquista",
  "prometeu que vai dormir só depois de pegar essa conquista",
  "está quase fazendo promessa pra conseguir essa conquista",
  "já pensou em desistir, mas a conquista não deixa",
  "está em modo hardcore só pra essa conquista",
  "essa conquista virou meta de vida",
  "está nervoso pra essa conquista",
  "essa conquista está no topo da lista de desejos",
  "já pediu conselho pra guru da conquista",
  "essa conquista virou meme no grupo",
  "está em busca da lendária conquista perdida",
  "essa conquista está mais difícil que final de Dark Souls"
];

// Elementos globais
const resultadoDiv = document.getElementById('resultado');
let searchInput = document.getElementById('doingChievoSearchInput');
if (!searchInput) {
  searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'doingChievoSearchInput';
  searchInput.placeholder = 'Buscar conquista...';
  searchInput.style.margin = '10px 0';
  searchInput.style.width = '100%';
  searchInput.style.padding = '6px';
  searchInput.style.borderRadius = '6px';
  searchInput.style.border = '1px solid #0ff';
  searchInput.style.background = '#222';
  searchInput.style.color = '#0ff';
  resultadoDiv.appendChild(searchInput);
}
let achArrayGlobal = [];
let showMissableOnly = false;

function renderProgression(achievements, username, selectedTitle) {
  resultadoDiv.innerHTML = '';
  // Botão filtro missable
  const missableBtn = document.createElement('button');
  missableBtn.textContent = showMissableOnly ? 'Mostrar todas' : 'Mostrar só conquistas perdíveis (missable)';
  missableBtn.style.margin = '0 0 10px 0';
  missableBtn.style.background = '#222';
  missableBtn.style.color = '#ff0';
  missableBtn.style.border = '1px solid #ff0';
  missableBtn.style.borderRadius = '6px';
  missableBtn.style.padding = '6px 12px';
  missableBtn.style.cursor = 'pointer';
  missableBtn.onclick = function() {
    showMissableOnly = !showMissableOnly;
    missableBtn.textContent = showMissableOnly ? 'Mostrar todas' : 'Mostrar só conquistas perdíveis (missable)';
    const lista = document.getElementById('conquistaLista');
    if (lista) {
      for (const item of lista.children) {
        const btn = item.querySelector('button');
        // Verifica se é missable
        const isMissable = btn && btn.innerHTML.includes("! (M)");
        if (showMissableOnly) {
          item.style.display = isMissable ? 'flex' : 'none';
        } else {
          item.style.display = 'flex';
        }
      }
    }
  };
  resultadoDiv.appendChild(missableBtn);
  resultadoDiv.appendChild(searchInput);
  if (achievements && typeof achievements === 'object') {
    // Corrige o nome do usuário para primeira letra maiúscula
    const formatUsername = u => u ? u.charAt(0).toUpperCase() + u.slice(1) : '';
    achArrayGlobal = Object.values(achievements);
    let filteredArray = achArrayGlobal;
    if (showMissableOnly) {
      filteredArray = achArrayGlobal.filter(a => a.type === 'missable');
    }
    const usernameFormatted = formatUsername(username);
    if (filteredArray.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = showMissableOnly ? 'Nenhuma conquista missable encontrada.' : 'conseguiu todas as conquistas';
      msg.style.color = '#ff0';
      msg.style.fontSize = '1.1em';
      msg.style.margin = '24px 0';
      resultadoDiv.appendChild(msg);
      // Card especial de todas as conquistas
      if (!showMissableOnly) {
        document.getElementById('cardConquista').innerHTML = `
          <div style="background:#181818;border-radius:12px;padding:20px;box-shadow:0 2px 8px #000;width:350px;display:flex;align-items:center;gap:16px;font-family:sans-serif;">
            <span style='font-size:64px;margin-right:16px;'>🏆</span>
            <div style='flex:1;'>
              <div style='font-size:1em;font-weight:bold;color:#ff0;margin-bottom:8px;'>${usernameFormatted} conseguiu todas as conquistas!</div>
              <div style='font-size:1.2em;font-weight:bold;color:#0ff;'>Parabéns!</div>
              <div style='color:#fff;margin:8px 0;'>Você completou todos os desafios!</div>
              <div style='color:#ff0;font-size:1em;'>Troféu máximo!</div>
            </div>
          </div>
        `;
      }
    } else {
      const lista = document.createElement('ul');
      lista.style.listStyle = 'none';
      lista.style.padding = '0';
      lista.style.margin = '20px 0';
      lista.id = 'conquistaLista';
      lista.style.height = '250px';
      lista.style.maxHeight = '250px';
      lista.style.overflowY = 'auto';
      lista.style.background = '#181818';
      lista.style.borderRadius = '8px';
      lista.style.border = '1px solid #333';
      for (let i = 0; i < filteredArray.length; i++) {
        const achievement = filteredArray[i];
        const item = document.createElement('li');
        item.style.marginBottom = '12px';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '12px';
        item.style.background = '#222';
        item.style.borderRadius = '8px';
        item.style.padding = '8px 12px';
        item.style.border = '1px solid #333';
        item.style.display = 'flex';

        // Imagem
        const img = document.createElement('img');
        let badgeName = achievement.badgeName;
        if (!achievement.dateEarnedHardcore) {
          badgeName += '_lock';
        }
        img.src = `https://media.retroachievements.org/Badge/${badgeName}.png`;
        img.alt = 'Badge';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.borderRadius = '6px';
        img.style.border = '2px solid #444';
        img.style.background = '#222';
        item.appendChild(img);

        // Conteúdo
        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        // Título (botão)
        const btn = document.createElement('button');
        btn.style.background = '#333';
        btn.style.color = '#0ff';
        btn.style.border = '1px solid #0ff';
        btn.style.borderRadius = '6px';
        btn.style.padding = '6px 12px';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          userSelectedCard = true;
          renderCard(achievement, usernameFormatted);
        };
        // Texto do botão
        btn.innerHTML = achievement.title;
        if (achievement.type === 'missable') {
          btn.innerHTML += " <span style='color:#f00;font-weight:bold;'>! (M)</span>";
        }
        contentDiv.appendChild(btn);

        // Descrição
        const desc = document.createElement('div');
        desc.textContent = achievement.description;
        desc.style.color = '#fff';
        desc.style.fontSize = '0.95em';
        desc.style.marginTop = '4px';
        contentDiv.appendChild(desc);

        item.appendChild(contentDiv);
        lista.appendChild(item);
      }
      resultadoDiv.appendChild(lista);
      // Seleciona o card previamente clicado, se existir na lista
      let selectedBtn = null;
      if (selectedTitle) {
        for (let item of lista.children) {
          const btn = item.querySelector('button');
          if (btn && btn.textContent.replace(/ <span.*$/, '') === selectedTitle) {
            selectedBtn = btn;
            break;
          }
        }
      }
      // Se a conquista selecionada não está mais na lista, atualiza automaticamente para a primeira
      if (!selectedBtn && lista.children.length > 0) {
        userSelectedCard = false;
        selectedBtn = lista.children[0].querySelector('button');
        if (selectedBtn) selectedBtn.click();
      }
      // Se o card selecionado existir, não faz nada (mantém o card atual)
    }

    // Função para renderizar card
    function renderCard(achievement, username) {
      let badgeName = achievement.badgeName;
      if (!achievement.dateEarnedHardcore) {
        badgeName += '_lock';
      }
      document.getElementById('cardConquista').innerHTML = `
        <div style="background:#181818;border-radius:12px;padding:20px;box-shadow:0 2px 8px #000;width:350px;display:flex;align-items:center;gap:16px;font-family:sans-serif;">
          <img src='https://media.retroachievements.org/Badge/${badgeName}.png' alt='Badge' style='width:64px;height:64px;border-radius:8px;border:2px solid #444;background:#222;'>
          <div style='flex:1;'>
            <div style='font-size:1em;font-weight:bold;color:#ff0;margin-bottom:8px;'>${username} ${meme[Math.floor(Math.random()*meme.length)]}:</div>
            <div style='font-size:1.2em;font-weight:bold;color:#0ff;'>${achievement.title}</div>
            <div style='color:#fff;margin:8px 0;'>${achievement.description}</div>
            <div style='color:#ff0;font-size:1em;'>${achievement.points} pontos</div>
          </div>
        </div>
      `;
      lastSelectedAchievementTitle = achievement.title;
    }
  } else {
    const msg = document.createElement('div');
    msg.textContent = 'Nenhuma conquista encontrada.';
    resultadoDiv.appendChild(msg);
  }
}

// Filtro da lista (listener único)
searchInput.addEventListener('input', function() {
  const termo = searchInput.value.toLowerCase();
  const lista = document.getElementById('conquistaLista');
  if (!lista) return;
  // Usa o array filtrado conforme o filtro missable
  let searchArray = achArrayGlobal;
  if (showMissableOnly) {
    searchArray = achArrayGlobal.filter(a => a.type === 'missable');
  }
  for (const item of lista.children) {
    const btn = item.querySelector('button');
    // Título limpo, sem o span de missable
    const btnTitle = btn.textContent.replace(/ <span.*$/, '');
    const achievement = searchArray.find(a => a.title === btnTitle);
    const titleMatch = btn.textContent.toLowerCase().includes(termo);
    // Busca pela descrição do objeto ou, se não existir, pelo texto do DOM
    let descText = '';
    if (achievement && achievement.description) {
      descText = achievement.description.toLowerCase();
    } else {
      const descDiv = item.querySelector('div');
      if (descDiv) descText = descDiv.textContent.toLowerCase();
    }
    const descMatch = descText.includes(termo);
    if (titleMatch || descMatch) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  }
});




async function fetchAndUpdate() {
  try {
    const res = await fetch('/mainuser/achievements');
    if (!res.ok) return;
    const data = await res.json();
    // Só atualiza se mudou
    if (JSON.stringify(data.achievements) !== JSON.stringify(lastData)) {
      lastData = data.achievements;
      lastUsername = data.username;
      renderProgression(data.achievements, data.username, lastSelectedAchievementTitle);
    }
  } catch (e) {
    // Não faz nada se der erro
  }
}

setInterval(fetchAndUpdate, 1000);
fetchAndUpdate();
