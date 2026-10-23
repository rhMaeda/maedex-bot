const { MessageFlags } = require('discord.js');

module.exports = async function sendResponse(interaction, response) {
  const content = typeof response === 'string' ? response : response.content;
  const channel = interaction.musicOutputChannel;

  if (!channel) {
    if (interaction.deferred) return interaction.editReply(content);
    if (interaction.replied) return interaction.followUp(response);
    return interaction.reply(response);
  }

  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  }

  try {
    await channel.send({ content, allowedMentions: { parse: [] } });
  } catch (error) {
    console.error('Falha ao enviar mensagem no canal configurado:', error);
    return interaction.editReply('❌ Não consegui enviar a resposta no canal configurado. Confira as permissões do bot.');
  }
  return interaction.editReply(`📨 Resposta enviada em <#${channel.id}>.`);
};
