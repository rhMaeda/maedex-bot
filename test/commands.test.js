const test = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { Collection } = require('discord.js');
const { Queue } = require('distube');
const InteractionCreateEvent = require('../events/client/interactionCreate');
const VoiceStateUpdateEvent = require('../events/client/voiceStateUpdate');
const QueueCommand = require('../commands/queue');
const PlayCommand = require('../commands/play');
const SkipCommand = require('../commands/skip');
const ShuffleCommand = require('../commands/shuffle');
const StopCommand = require('../commands/stop');
const sendResponse = require('../sendResponse');

test('os comandos registráveis incluem as opções do play', () => {
  const definitions = readdirSync(join(__dirname, '../commands'))
    .filter(file => file.endsWith('.js'))
    .map(file => new (require(join(__dirname, '../commands', file)))().slashBuilder.toJSON());

  assert.deepEqual(definitions.map(command => command.name).sort(), ['autoplay', 'play', 'queue', 'shuffle', 'skip', 'stop']);
  const play = definitions.find(command => command.name === 'play');
  assert.deepEqual(play.options.map(option => option.name), ['input', 'skip', 'position']);
  assert.equal(play.options[2].min_value, 1);
  const skip = definitions.find(command => command.name === 'skip');
  assert.deepEqual(skip.options.map(option => option.name), ['position']);
  assert.equal(skip.options[0].min_value, 1);
});

test('somente usuários no mesmo canal de voz controlam a reprodução', async () => {
  let executions = 0;
  const replies = [];
  const event = new InteractionCreateEvent({
    commands: new Map([['skip', { inVoiceChannel: true, onChatInput: async () => { executions++; } }]]),
    distube: { getQueue: () => ({ voiceChannel: { id: 'bot-channel' } }) },
  });
  const interaction = channel => ({
    isChatInputCommand: () => true,
    commandName: 'skip',
    guildId: 'guild',
    member: { voice: { channel } },
    reply: async message => { replies.push(message); },
  });

  await event.run(interaction(null));
  await event.run(interaction({ id: 'other-channel' }));
  assert.equal(executions, 0);
  assert.match(replies[0].content, /Entre em um canal de voz/);
  assert.match(replies[1].content, /mesmo canal de voz/);

  await event.run(interaction({ id: 'bot-channel' }));
  assert.equal(executions, 1);

  event.client.distube.getQueue = () => undefined;
  await event.run(interaction(null));
  assert.equal(executions, 2);
});

test('com canal configurado, /play usado em outro canal publica a resposta e os avisos nele', async t => {
  const previous = process.env.MUSIC_CHANNEL_ID;
  process.env.MUSIC_CHANNEL_ID = 'music-channel';
  t.after(() => {
    if (previous === undefined) delete process.env.MUSIC_CHANNEL_ID;
    else process.env.MUSIC_CHANNEL_ID = previous;
  });

  const messages = [];
  const acknowledgements = [];
  let playOptions;
  const outputChannel = {
    id: 'music-channel',
    isTextBased: () => true,
    permissionsFor: () => ({ has: () => true }),
    send: async message => { messages.push(message); },
  };
  const client = {
    user: { id: 'bot' },
    commands: new Map(),
    distube: {
      getQueue: () => undefined,
      play: async (_voiceChannel, _song, options) => { playOptions = options; },
    },
  };
  client.commands.set('play', new PlayCommand(client));
  const event = new InteractionCreateEvent(client);
  const interaction = {
    isChatInputCommand: () => true,
    commandName: 'play',
    guildId: 'guild',
    channelId: 'other-channel',
    channel: { id: 'other-channel' },
    guild: { channels: { fetch: async () => outputChannel } },
    member: { voice: { channel: { id: 'voice-channel' } } },
    options: {
      getString: () => 'https://www.youtube.com/watch?v=0J2QdDbelmY',
      getBoolean: () => null,
      getInteger: () => null,
    },
    deferReply: async () => { interaction.deferred = true; },
    editReply: async message => { acknowledgements.push(message); },
  };

  await event.run(interaction);
  assert.equal(playOptions.textChannel, outputChannel);
  assert.equal(messages[0].content, '✅ Música iniciada ou adicionada à fila.');
  assert.match(acknowledgements[0], /music-channel/);
});

test('respostas de erro também são publicadas no canal configurado', async () => {
  let sent;
  let acknowledgement;
  await sendResponse({
    deferred: true,
    musicOutputChannel: { id: 'music-channel', send: async message => { sent = message; } },
    editReply: async message => { acknowledgement = message; },
  }, { content: '📭 A fila está vazia.', flags: 64 });

  assert.equal(sent.content, '📭 A fila está vazia.');
  assert.deepEqual(sent.allowedMentions, { parse: [] });
  assert.match(acknowledgement, /music-channel/);
});

test('a fila longa cabe em uma resposta do Discord', async () => {
  const songs = Array.from({ length: 30 }, (_, index) => ({
    name: 'Música ' + index + ' '.repeat(500),
    formattedDuration: '3:00',
  }));
  let response;
  const command = new QueueCommand({ distube: { getQueue: () => ({ songs }) } });
  await command.onChatInput({ guildId: 'guild', reply: async message => { response = message; } });

  assert.ok(response.length <= 2000);
  assert.match(response, /mais 20 música/);
  assert.doesNotMatch(response, /Música 10/);
});

test('skip informa quando não existe próxima música', async () => {
  const queue = {
    songs: [{}],
    autoplay: false,
    skip: () => { throw new Error('skip não deve ser chamado'); },
  };
  let response;
  const command = new SkipCommand({ distube: { getQueue: () => queue } });
  await command.onChatInput({ guildId: 'guild', options: { getInteger: () => null }, reply: async message => { response = message; } });

  assert.match(response.content, /Não há próxima música/);
});

test('skip sem número avança uma música; com número vai à posição exibida em /queue', async () => {
  const actions = [];
  const queue = {
    songs: Array.from({ length: 9 }, (_, index) => ({ name: `Música ${index}` })),
    skip: async () => { actions.push('skip'); },
    jump: async position => { actions.push(`jump ${position}`); },
  };
  const command = new SkipCommand({ distube: { getQueue: () => queue } });
  const interaction = position => ({
    guildId: 'guild',
    options: { getInteger: () => position },
    reply: async () => {},
  });

  await command.onChatInput(interaction(null));
  await command.onChatInput(interaction(7));
  assert.deepEqual(actions, ['skip', 'jump 7']);
});

test('jump(7) do DisTube seleciona a sétima próxima música', async () => {
  const songs = Array.from({ length: 9 }, (_, index) => ({ id: String(index) }));
  const queue = {
    songs: [...songs],
    previousSongs: [],
    options: { savePreviousSongs: false },
    _taskQueue: { queuing: async () => {}, resolve: () => {} },
    voice: { stop: () => {} },
  };

  assert.equal(await Queue.prototype.jump.call(queue, 7), songs[7]);
});

test('skip recusa número fora da fila sem alterar a reprodução', async () => {
  let response;
  const queue = {
    songs: [{}, {}, {}],
    jump: () => { throw new Error('jump não deve ser chamado'); },
  };
  const command = new SkipCommand({ distube: { getQueue: () => queue } });
  await command.onChatInput({
    guildId: 'guild',
    options: { getInteger: () => 7 },
    reply: async message => { response = message; },
  });

  assert.match(response.content, /música 7 não existe/);
});

test('shuffle embaralha somente quando há pelo menos duas músicas aguardando', async () => {
  const actions = [];
  const queue = { songs: [{}, {}, {}], shuffle: async () => { actions.push('shuffle'); } };
  const command = new ShuffleCommand({ distube: { getQueue: () => queue } });
  let response;
  const interaction = { guildId: 'guild', reply: async message => { response = message; } };

  await command.onChatInput(interaction);
  assert.deepEqual(actions, ['shuffle']);
  queue.songs.pop();
  await command.onChatInput(interaction);
  assert.match(response.content, /pelo menos duas próximas músicas/);
  assert.deepEqual(actions, ['shuffle']);
});

test('stop encerra a fila antes de desconectar o bot', async () => {
  const actions = [];
  const command = new StopCommand({
    distube: {
      getQueue: () => ({ stop: async () => { actions.push('stop'); } }),
      voices: { leave: () => { actions.push('leave'); } },
    },
  });
  await command.onChatInput({ guildId: 'guild', reply: async () => { actions.push('reply'); } });
  assert.deepEqual(actions, ['stop', 'leave', 'reply']);
});

test('o bot sai quando a última pessoa deixa o canal de voz', async () => {
  const actions = [];
  const members = new Collection([
    ['bot', { id: 'bot', user: { bot: true } }],
    ['person', { id: 'person', user: { bot: false } }],
  ]);
  const queue = {
    voiceChannel: { id: 'voice' },
    stop: async () => { actions.push('stop'); },
    voice: { leave: () => { actions.push('leave'); } },
    textChannel: { send: async () => { actions.push('send'); } },
  };
  const event = new VoiceStateUpdateEvent({ distube: { getQueue: () => queue } });
  const oldState = {
    id: 'person',
    channelId: 'voice',
    channel: { members },
    member: { user: { bot: false } },
    guild: { id: 'guild' },
  };
  members.set('other', { id: 'other', user: { bot: false } });
  await event.run(oldState, { channelId: null });
  assert.deepEqual(actions, []);

  members.delete('other');
  await event.run(oldState, { channelId: null });
  assert.deepEqual(actions, ['stop', 'leave', 'send']);
});
