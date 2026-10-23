# Política de Privacidade — Maedex Bot

**Última atualização:** 23 de outubro de 2026

Esta política explica como o Maedex Bot trata informações ao funcionar em servidores do Discord. O responsável pelo bot é o mantenedor do projeto [rhMaeda/maedex-bot](https://github.com/rhMaeda/maedex-bot). Para contato e pedidos relativos a dados, use as [Issues do repositório](https://github.com/rhMaeda/maedex-bot/issues).

## 1. Dados envolvidos

Para atender aos comandos, o bot recebe do Discord os dados necessários da interação, como identificadores do servidor, canal e usuário, além da participação em canal de voz. Ele processa o texto ou link informado em `/play`, os comandos de controle da fila e metadados das músicas encontradas (por exemplo, título, duração e endereço).

O código atual não usa a permissão de ler mensagens comuns do servidor, não grava o áudio das pessoas no canal de voz e não mantém um banco de dados de perfis ou histórico de reprodução. Tokens e cookies usados para acessar provedores são configurados pelo operador do bot; o bot não solicita credenciais dos usuários.

## 2. Para que usamos esses dados

Os dados são usados para verificar se a pessoa está no canal de voz correto, buscar e reproduzir músicas, manter a fila, responder aos comandos e diagnosticar falhas. O bot não usa esses dados para publicidade nem os vende.

## 3. Onde as informações aparecem e são compartilhadas

- **Discord:** respostas, títulos de músicas e avisos de reprodução podem ser publicados no canal de texto configurado pelo servidor e ficar visíveis a seus membros. Quem usa um comando pode receber também uma confirmação privada do Discord no canal de origem.
- **Provedores de música:** termos de busca e links solicitados podem ser consultados no YouTube, Spotify ou SoundCloud para localizar metadados e áudio. Esses serviços tratam as consultas segundo suas próprias políticas.
- **Servidor de hospedagem:** o processo do bot usa memória e logs da VPS para executar comandos e registrar erros.

O bot não transmite intencionalmente identificadores de usuários do Discord aos provedores de música para criar perfis. O uso do Discord e dos provedores também está sujeito às respectivas políticas de privacidade, como a [política do Discord](https://discord.com/privacy), a [política do Google/YouTube](https://policies.google.com/privacy) e a [política do Spotify](https://www.spotify.com/legal/privacy-policy/).

## 4. Armazenamento e retenção

A fila e o estado de reprodução ficam na memória do processo e são descartados quando a fila termina, é interrompida ou o bot reinicia. O bot não salva esses dados em um banco de dados próprio.

Logs de operação podem conter nome e ID de servidor, mensagens de erro e, conforme a falha, termos ou links usados em comandos. Eles ficam na VPS até serem removidos ou rotacionados pela configuração de logs do servidor; o código não estabelece um prazo fixo de retenção. Mensagens já publicadas em canais permanecem no Discord conforme as configurações do servidor e as regras da plataforma; o bot não as apaga automaticamente.

## 5. Seus pedidos e escolhas

Você pode deixar de usar o bot. Administradores podem remover o bot do servidor e apagar mensagens nos canais conforme suas permissões. Para pedir informações, correção ou exclusão de dados controlados pelo mantenedor, abra uma [Issue](https://github.com/rhMaeda/maedex-bot/issues) descrevendo o pedido sem publicar informações sensíveis. Se for necessário verificar sua identidade ou fornecer detalhes privados, combine um meio reservado com o mantenedor antes de enviá-los.

Pedidos referentes a dados armazenados pelo próprio Discord ou por provedores de música devem ser dirigidos também a esses serviços. Solicitações serão avaliadas conforme as possibilidades técnicas e a legislação aplicável.

## 6. Segurança e alterações

O acesso à hospedagem e às credenciais do bot deve ser restrito ao operador. Nenhuma transmissão ou armazenamento é isento de riscos. Mudanças relevantes nesta política serão publicadas neste arquivo com nova data de atualização.
