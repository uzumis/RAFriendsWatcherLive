# RetroAchievements Group Watcher

Este projeto é um sistema para monitorar conquistas de jogadores em grupo, exibindo tabelas, histórico e gerenciamento de usuários do RetroAchievement.
Este projeto é um sistema para monitorar conquistas de jogadores em grupo, exibindo tabelas, histórico e gerenciamento de usuários do RetroAchievement.

## Funcionalidades
- Visualização de conquistas recentes
- Tabela de líderes
- Gerenciamento de jogadores
- Limpeza de cache e histórico
- Backend em Node.js
- Frontend simples em HTML/CSS/JS

## Como usar
1. Instale o Node.js (veja instruções no start.cmd)
2. Copie o arquivo .env-example e renomeie para .env e coloque seu usuario e chave de API
3. Execute o script `start.cmd` para iniciar o backend e o live-server
4. Acesse o endereço informado no terminal


## Principais páginas HTML
- `index.html` — Página de notificações (ADICIONE NO SEU OBS)
- `checkHistory.html` — Histórico de conquistas - (Abrirá automaticamente ao iniciar o projeto)
- `widgetConquistas.html` — Widget de conquistas - (Opcional.. adicione no seu OBS, também)

## Estrutura
- `API/` - Scripts JS principais
- `service/` - Serviços Node.js
- `css/` - Estilos
- `*.json` - Dados gerados

## Requisitos
- Node.js
- npm
- live-server

## Observações
- Os arquivos de dados `.json` são gerados automaticamente se estiverem ausentes.
- Use o botão de gerenciamento para adicionar/remover jogadores.

## Licença
MIT

## Agradecimento
- Retroachievements pelo serviço e integração com jogos antigos e conquistas, além da sua documentação valiosa
- Todos os viewers do Rebuildando que me ajudaram testando o serviço
- Udonlord : um grande amigo que deu a ideia e pelos brainstorms.
