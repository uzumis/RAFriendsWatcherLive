let lastChievoCount = 0;
let lastChievoIds = new Set();

function renderChievos(conquistas) {
  
  const ulConquistas = document.getElementById('conquistas-list');
  const leaderboard = document.querySelector('#leaderboard ul');

  ulConquistas.innerHTML = '';
  leaderboard.innerHTML = '';

  const playerPoints = {};
  const playersWithPlatinumToday = new Set();
  const today = new Date().toISOString().split('T')[0];

  conquistas.forEach(c => {
    if (!playerPoints[c.player]) {
      playerPoints[c.player] = {
        points: 0,
        userPhoto: c.userPhoto
      };
    }
    if (c.chievoDesc === "Platina obtida!" && c.chievoTimestamp.startsWith(today)) {
      playersWithPlatinumToday.add(c.player);
    } else {
      playerPoints[c.player].points += c.chievoPoints;
    }
  });

  const sortedPlayers = Object.entries(playerPoints)
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 100);

  sortedPlayers.forEach(([player, data], index) => {
    const li = document.createElement('li');
    li.innerHTML = `
    <a target="_blank" rel="noopener noreferrer" href="https://retroachievements.org/user/${player}" target="_blank">
      <div class="player-info">
        <img src="${data.userPhoto}" alt="${player}" class="${playersWithPlatinumToday.has(player) ? 'highlight' : ''}">
        <strong>${index + 1}. ${player}</strong>
         <span class="points">${data.points} pontos</span>
      </div>
     
    </a>
    `;
    leaderboard.appendChild(li);
  });

  conquistas.slice().reverse().forEach(c => {
    const li = document.createElement('li');
    const data = new Date(c.chievoTimestamp);
    data.setHours(data.getHours() - 3);

    // Botão de excluir
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '✖';
    deleteBtn.title = 'Excluir conquista';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = '#ff4d4d';
    deleteBtn.style.fontSize = '1.5rem';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '10px';
    deleteBtn.style.right = '10px';

    // Container para posicionar o botão
    li.style.position = 'relative';
    li.classList.add('achievement');
deleteBtn.addEventListener('click', async () => {
  const confirmDelete = confirm('Tem certeza que deseja excluir esta conquista?');
  if (!confirmDelete) return;
  try {
    let res;
    if (c.chievoDesc === "Platina obtida!") {
      // Exclui platina
      res = await fetch('http://localhost:1337/platinums', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: c.player, title: c.title })
      });
    } else {
      // Exclui conquista normal
      res = await fetch(`http://localhost:1337/achievement/${c.achievementId}`, {
        method: 'DELETE'
      });
    }
    if (res.ok) {
      li.remove();
    } else {
      alert('Erro ao excluir conquista.');
    }
  } catch (err) {
    alert('Erro ao excluir conquista.');
  }
});

    if (c.chievoDesc === "Platina obtida!") {
      li.classList.add('platinum');
      li.innerHTML = `
        <span class="info">
          <img src="${c.iconUrl}" alt="${c.title}" width="128" height="128" style="vertical-align:middle;margin-right:8px;">
          <strong>${c.title}</strong> <br> (${c.gameConsole})<br>
          <em>${c.chievoDesc}</em><br>
          <span class="player">
            Obtida em: ${data.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}<br>
            Jogador: <span class="player-name">${c.player}</span>
          </span>
        </span>
      `;
    } else {
      li.innerHTML = `
      <a href="https://retroachievements.org/achievement/${c.achievementId}" target="_blank" rel="noopener noreferrer">
        <span class="info">
          <img src="${c.iconUrl}" alt="${c.title}" width="128" height="128" style="vertical-align:middle;margin-right:8px;">
          <strong>${c.title}</strong> <br> (${c.gameName} - ${c.gameConsole})<br>
          <em>${c.chievoDesc} - ${c.chievoPoints} pontos</em><br>
          <span class="player">
            Obtida em: ${data.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })}<br>
            Jogador: <span class="player-name">${c.player}</span>
          </span>
        </span>
        </a>
      `;
      
    }
    li.appendChild(deleteBtn);
    ulConquistas.appendChild(li);
  });
}

async function fetchAndUpdateChievos() {
  const res = await fetch('http://localhost:1337/achievement/chievoData.json');
  const conquistas = await res.json();
  // Verifica se há conquistas novas
  const currentIds = new Set(conquistas.map(c => c.achievementId + '-' + c.chievoTimestamp));
  if (currentIds.size !== lastChievoIds.size || [...currentIds].some(id => !lastChievoIds.has(id))) {
    renderChievos(conquistas);
    lastChievoIds = currentIds;
  }
}


// Inicializa a tela
fetchAndUpdateChievos();
setInterval(fetchAndUpdateChievos, 5000);

async function fetchWithRetry(url, options = {}, retries = 5, delay = 1000) {
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      console.warn(`Too Many Requests. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    }
    return res;
  } catch (err) {
    console.error(`Fetch failed: ${err.message}`);
    throw err;
  }
}

async function fetchPlayers() {
  try {
    const res = await fetch('http://localhost:1337/players');
    const players = await res.json();

    for (const player of players) {
      console.log(`Player: ${player.name}`);
      try {
        const res = await fetchWithRetry(`http://localhost:1337/players/${player.name}`, {}, 5, 1000);
        const data = await res.json();
        console.log(`Data for ${player.name}:`, data.name || data);
      } catch (err) {
        console.error(`Error fetching data for ${player.name}:`, err);
      }
    }
    return players;

  } catch (err) {
    console.error('Error fetching players:', err);
  }
}

// Aguarda o DOM estar pronto antes de adicionar event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Apagar o cache dos jogadores
  document.getElementById('clear-cache').addEventListener('click', async () => {
    const confirmPick = confirm(`Você tem certeza que deseja apagar o cache dos jogadores? Isso irá remover todos os dados armazenados em cache e forçar uma nova coleta de dados.`);
    if (!confirmPick) return;
    try {
      const response = await fetch('http://localhost:1337/admin/clear-cache', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Cache dos jogadores apagado com sucesso!');
        fetchPlayers();
      } else {
        console.error('Erro ao apagar o cache dos jogadores:', response.statusText);
        alert('Erro ao apagar o cache dos jogadores.');
      }
    } catch (error) {
      console.error('Erro na requisição para apagar o cache dos jogadores:', err);
      alert('Erro ao apagar o cache dos jogadores.');
    }
  });

  // Limpar o histórico de jogadores
  document.getElementById('clear-history').addEventListener('click', async () => {
    const confirmPick = confirm(`Você tem certeza que deseja limpar o histórico de conquistas e platinas? Isso irá remover todos os dados de conquistas e platinas dos jogadores e inclusive a tabela de conquistadores.`);
    if (!confirmPick) return;
    try {
      const response = await fetch('http://localhost:1337/admin/clear-history', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Histórico de conquistas e platinas apagado com sucesso!');
        window.location.reload();
      } else {
        console.error('Erro ao limpar o histórico de jogadores:', response.statusText);
        alert('Erro ao limpar o histórico de jogadores.');
      }
    } catch (error) {
      console.error('Erro na requisição para limpar o histórico de jogadores:', error);
      alert('Erro ao limpar o histórico de jogadores.');
    }
  });
  const modal = document.getElementById('player-modal');
  const playerList = document.getElementById('player-list');
  const newPlayerInput = document.getElementById('new-player-name');



  // Carrega a lista de jogadores
  async function loadPlayers() {
    try {
      const response = await fetch('http://localhost:1337/players');
      const players = await response.json();

      playerList.innerHTML = '';
      players.forEach((player, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.marginBottom = '10px';
        li.style.padding = '10px';
        li.style.background = '#2e3650';
        li.style.borderRadius = '8px';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = player.name;
        nameInput.style.flex = '1';
        nameInput.style.marginRight = '10px';
        nameInput.style.padding = '5px';
        nameInput.style.borderRadius = '8px';
        nameInput.style.border = 'none';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.style.marginRight = '5px';
        saveButton.style.padding = '5px 10px';
        saveButton.style.background = '#3a4260';
        saveButton.style.color = '#fff';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '8px';
        saveButton.style.cursor = 'pointer';

        saveButton.addEventListener('click', async () => {
          try {
            await fetch(`http://localhost:1337/players/${index}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: nameInput.value })
            });
            alert('Jogador atualizado com sucesso!');
            await fetch('http://localhost:1337/admin/clear-cache', {
              method: 'POST'
            });
            loadPlayers();
          } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            alert('Erro ao atualizar jogador.');
          }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.style.padding = '5px 10px';
        deleteButton.style.background = '#ff4d4d';
        deleteButton.style.color = '#fff';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '8px';
        deleteButton.style.cursor = 'pointer';

        deleteButton.addEventListener('click', async () => {
          try {
            await fetch(`http://localhost:1337/players/${index}`, {
              method: 'DELETE'
            });
            alert('Jogador excluído com sucesso!');
            await fetch('http://localhost:1337/admin/clear-cache', {
              method: 'POST'
            });

            loadPlayers();
            fetchPlayers();
          } catch (error) {
            console.error('Erro ao excluir jogador:', error);
            alert('Erro ao excluir jogador.');
          }
        });

        li.appendChild(nameInput);
        li.appendChild(saveButton);
        li.appendChild(deleteButton);
        playerList.appendChild(li);
      });
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      alert('Erro ao carregar jogadores.');
    }
  }

  loadPlayers();

  // Adicionar novo jogador
  document.getElementById('add-player').addEventListener('click', async () => {
    const newPlayerName = newPlayerInput.value.trim();
    if (!newPlayerName) {
      alert('Digite um nome para o jogador.');
      return;
    }

    try {
      await fetch('http://localhost:1337/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName })
      });
      alert('Jogador adicionado com sucesso!');
      newPlayerInput.value = '';
      await fetch('http://localhost:1337/admin/clear-cache', {
        method: 'POST'
      });
      loadPlayers(); // Recarrega a lista
      fetchPlayers();
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      alert('Erro ao adicionar jogador.');
    }
  });

  // Fechar o modal
  document.getElementById('manage-players').addEventListener('click', () => {
    modal.style.display = 'block';
    loadPlayers();
  });
  document.getElementById('close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.querySelectorAll('.copy-link-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = window.location.origin + '/' + btn.getAttribute('data-url');
      try {
        await navigator.clipboard.writeText(url);
        const modal = document.getElementById('copy-modal');
        modal.style.display = 'block';
        setTimeout(() => {
          modal.style.display = 'none';
        }, 1500);
      } catch (err) {
        alert('Erro ao copiar o link.');
      }
    });
  });
  document.getElementById('export-chievo').addEventListener('click', async () => {
    const res = await fetch('http://localhost:1337/achievement/chievoData.json');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chievoData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('export-players').addEventListener('click', async () => {
    const res = await fetch('http://localhost:1337/players');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'players.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-chievo').addEventListener('click', () => {
    const input = document.getElementById('file-input');
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const obj = JSON.parse(text); // <-- Converte para objeto
        await fetch('http://localhost:1337/achievement/importChievo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obj) // <-- Envia como JSON
        });
        alert('Conquistas importadas com sucesso!');
        fetchAndUpdateChievos();
      } catch (err) {
        alert('Erro ao importar conquistas.');
      }
    };
    input.click();
  });

  document.getElementById('import-players').addEventListener('click', () => {
    const input = document.getElementById('file-input');
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const obj = JSON.parse(text); // <-- Converte para objeto
        await fetch('http://localhost:1337/players/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obj) // <-- Envia como JSON
        });
        alert('Jogadores importados com sucesso!');
        fetchPlayers();
      } catch (err) {
        alert('Erro ao importar jogadores.');
      }
    };
    input.click();
  });
});

