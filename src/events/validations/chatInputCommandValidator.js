const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalComands = require("../../utils/getLocalComands");

module.exports = async (client, interection) => {
  if (interection.isChatInputCommand) return;
  const localComands = getLocalComands();
  const commandObject = localComands.find(
    (cmd) => cmd.data.name === interection.commandName
  );
  if (!commandObject) return;
  const createEmbed = (color, description) =>
    new EmbedBuilder().setColor(color).setDescription(description);

  if (commandObject.devOnly && !developersId.includes(interection.member.id)) {
    const rEmbed = createEmbed(mConfig.embedColorError, mConfig.comandDevOnly);
    return interection.reply({ embeds: [rEmbed], ephemeral: true });
  }

  if (commandObject.testMode && interection.guild.id !== testServerId) {
    const rEmbed = createEmbed(mConfig.embedColorError, mConfig.comandTestMode);
    return interection.reply({ embeds: [rEmbed], ephemeral: true });
  }

  for (const permission of commandObject.usePermissions || []) {
    if (!interection.member.permission.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorError,
        mConfig.userNoPremissions
      );
      return interection.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }
  const bot = interection.guild.me;
  for (const permission of commandObject.botPermissions || []) {
    if (!bot.member.permission.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorError,
        mConfig.botNoPremissions
      );
      return interection.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }
  try {
    await commandObject.run(client, interection);
  } catch (error) {
    console.log(`ошибка в команде валидации: \n ${error}`.red);
  }
};
