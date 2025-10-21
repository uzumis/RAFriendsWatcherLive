// API/widgetDoingChievo.js
import { onSharedAchievementsUpdate, sharedAchievementsUsername } from './sharedAchievements.js';

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

function renderProgression(achievements, username) {
  document.getElementById('resultado').innerHTML = '';
  if (achievements && typeof achievements === 'object') {
    const achArray = Object.values(achievements).filter(a => !a.dateEarnedHardcore);
    if (achArray.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'conseguiu todas as conquistas';
      msg.style.color = '#ff0';
      msg.style.fontSize = '1.1em';
      msg.style.margin = '24px 0';
      document.getElementById('resultado').appendChild(msg);
      // Card especial de todas as conquistas
      document.getElementById('cardConquista').innerHTML = `
        <div style="background:#181818;border-radius:12px;padding:20px;box-shadow:0 2px 8px #000;width:350px;display:flex;align-items:center;gap:16px;font-family:sans-serif;">
          <span style='font-size:64px;margin-right:16px;'>🏆</span>
          <div style='flex:1;'>
            <div style='font-size:1em;font-weight:bold;color:#ff0;margin-bottom:8px;'>${username} conseguiu todas as conquistas!</div>
            <div style='font-size:1.2em;font-weight:bold;color:#0ff;'>Parabéns!</div>
            <div style='color:#fff;margin:8px 0;'>Você completou todos os desafios!</div>
            <div style='color:#ff0;font-size:1em;'>Troféu máximo!</div>
          </div>
        </div>
      `;
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
      for (let i = 0; i < achArray.length; i++) {
        const achievement = achArray[i];
        const item = document.createElement('li');
        item.style.marginBottom = '12px';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '12px';
        item.style.background = '#222';
        item.style.borderRadius = '8px';
        item.style.padding = '8px 12px';
        item.style.border = '1px solid #333';

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
        btn.textContent = achievement.title;
        btn.style.background = '#333';
        btn.style.color = '#0ff';
        btn.style.border = '1px solid #0ff';
        btn.style.borderRadius = '6px';
        btn.style.padding = '6px 12px';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          renderCard(achievement, username);
        };
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
      document.getElementById('resultado').appendChild(lista);
      // Seleciona a primeira conquista ao carregar
      if (lista.children.length > 0) {
        const btn = lista.children[0].querySelector('button');
        if (btn) btn.click();
      }
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
    }

    // Input de busca
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar conquista...';
    searchInput.style.margin = '10px 0';
    searchInput.style.width = '100%';
    searchInput.style.padding = '6px';
    searchInput.style.borderRadius = '6px';
    searchInput.style.border = '1px solid #0ff';
    searchInput.style.background = '#222';
    searchInput.style.color = '#0ff';
    document.getElementById('resultado').appendChild(searchInput);

    // Filtro da lista
    searchInput.addEventListener('input', function() {
      const termo = searchInput.value.toLowerCase(); 
      for (const item of lista.children) {
        const btn = item.querySelector('button');
        const achievement = achArray.find(a => a.title === btn.textContent);
        const titleMatch = btn.textContent.toLowerCase().includes(termo);
        const descMatch = achievement && achievement.description && achievement.description.toLowerCase().includes(termo);
        if (titleMatch || descMatch) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      }
    });
  } else {
    const msg = document.createElement('div');
    msg.textContent = 'Nenhuma conquista encontrada.';
    document.getElementById('resultado').appendChild(msg);
  }
}

// Sincroniza com dados compartilhados ao carregar o módulo
onSharedAchievementsUpdate((achievements, username) => {
  renderProgression(achievements, username || sharedAchievementsUsername);
});
