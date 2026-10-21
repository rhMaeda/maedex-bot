const test = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { Collection } = require('discord.js');
const InteractionCreateEvent = require('../events/client/interactionCreate');
const VoiceStateUpdateEvent = require('../events/client/voiceStateUpdate');
const QueueCommand = require('../commands/queue');
const SkipCommand = require('../commands/skip');
const StopCommand = require('../commands/stop');

test('os comandos registráveis incluem as opções do play', () => {
  const definitions = readdirSync(join(__dirname, '../commands'))
    .filter(file => file.endsWith('.js'))
    .map(file => new (require(join(__dirname, '../commands', file)))().slashBuilder.toJSON());

  assert.deepEqual(definitions.map(command => command.name).sort(), ['autoplay', 'play', 'queue', 'skip', 'stop']);
  const play = definitions.find(command => command.name === 'play');
  assert.deepEqual(play.options.map(option => option.name), ['input', 'skip', 'position']);
  assert.equal(play.options[2].min_value, 1);
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
  await command.onChatInput({ guildId: 'guild', reply: async message => { response = message; } });

  assert.match(response.content, /Não há próxima música/);
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
