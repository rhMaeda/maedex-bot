# Maedex Bot

Bot de música para Discord com comandos de barra. Aceita links e buscas de YouTube, Spotify e SoundCloud por meio do DisTube.

## Preparação

1. Instale Node.js 22 ou superior e execute `npm ci`. No Linux, instale também o FFmpeg do sistema (`sudo apt install ffmpeg` no Ubuntu).
2. Copie `.env.example` para `.env` e preencha o token do bot, o ID da aplicação (`CLIENT_ID`) e o ID do servidor (`GUILD_ID`).
3. Convide o bot para o servidor com os escopos `bot` e `applications.commands`. Ele precisa de acesso ao canal de texto e de permissão para conectar e falar no canal de voz.
4. Execute `npm run deploy` para registrar os comandos nesse servidor.
5. Execute `npm start` para iniciar o bot. Durante o desenvolvimento, use `npm run dev`.

Após mudar a definição de um comando, execute `npm run deploy` novamente.

## Comandos

| Comando | Uso |
| --- | --- |
| `/play input:<link ou nome>` | Toca ou adiciona uma música à fila. `skip` interrompe a atual e toca a nova agora; `position` define sua posição na fila. Use apenas uma dessas opções por vez. |
| `/skip` | Pula para a próxima música. |
| `/stop` | Para a reprodução e desconecta o bot. |
| `/autoplay` | Liga ou desliga a reprodução automática. |
| `/queue` | Mostra até dez músicas da fila; pode ser usado fora do canal de voz. |

Para controlar a reprodução, entre no mesmo canal de voz do bot. Execute `npm test` para verificar os fluxos locais.
O bot sai do canal de voz quando a fila termina ou a última pessoa sai.
