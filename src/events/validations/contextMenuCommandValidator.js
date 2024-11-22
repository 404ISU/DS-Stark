require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand()) return; // Убедимся, что взаимодействие - контекстное меню
  const localContextMenus = getLocalContextMenus();

  try {
    const menuObject = localContextMenus.find((cmd) => cmd.data.name === interaction.commandName);
    if (!menuObject) return;

    const { guild, member, user } = interaction; // Извлечение member, guild и user

    // Проверка: команда только для разработчиков
    if (menuObject.devOnly) {
      if (!developersId.includes(member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorError)
          .setDescription(mConfig.commandDevOnly);
        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      }
    }

    // Проверка: команда только для тестового сервера
    if (menuObject.testMode) {
      if (guild.id !== testServerId) {
        const rEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorError)
          .setDescription(mConfig.commandTestMode);
        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      }
    }

    // Проверка прав пользователя
    if (menuObject.userPermissions?.length) {
      for (const permission of menuObject.userPermissions) {
        if (!member.permissions.has(permission)) {
          const rEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setDescription(mConfig.userNoPermissions);
          return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        }
      }
    }

    // Проверка прав бота
    if (menuObject.botPermissions?.length) {
      const bot = guild.members.me;
      for (const permission of menuObject.botPermissions) {
        if (!bot.permissions.has(permission)) {
          const rEmbed = new EmbedBuilder()
            .setColor(mConfig.embedColorError)
            .setDescription(mConfig.botNoPermissions);
          return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        }
      }
    }

    // Обработка команды или автозаполнения
    if (interaction.isChatInputCommand()) {
      if (!menuObject.run) {
        return interaction.reply({
          content: "`⚠️` This command does not have a run function!",
          ephemeral: true,
        });
      }
      await menuObject.run(client, interaction);
    } else if (interaction.isAutocomplete()) {
      if (!menuObject.autocomplete) {
        return interaction.respond([
          {
            name: "No autocomplete handling found, this is a fallback option.",
            value: "fallbackAutoComplete",
          },
        ]);
      }
      await menuObject.autocomplete(client, interaction);
    }
  } catch (err) {
    console.log("[ERROR]".red + " Error in your chatInputCommandValidator.js file:");
    console.log(err);
  }
};
