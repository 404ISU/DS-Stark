const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchemas = require("../../schemas/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Revoke a server ban.")
    .addStringOption((o) =>
      o
        .setName("user_id")
        .setDescription("The ID of the user whose ban you want to revoke.")
        .setRequired(true)
    ),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;

    const userId = options.getString("user_id");

    // Проверка конфигурации сервера
    let data = await moderationSchemas.findOne({ GuildID: guildId });
    if (!data) {
      const rEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(
          "`❌` This server isn't configured yet.\n\nUse `/moderatesystem configure` to start configuring this server."
        );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    try {
      // Снятие бана
      await guild.members.unban(userId);

      const rEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorSucces)
        .setFooter({
          text: `${client.user.username} - Unban User`,
        })
        .setDescription(`\`✔\` Successfully revoked the ban of user with ID: \`${userId}\`.`);

      interaction.reply({ embeds: [rEmbed], ephemeral: true });
    } catch (error) {
      // Обработка ошибок, если пользователь не найден или другая ошибка
      const rEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(`\`❌\` Failed to revoke the ban. Please ensure the user ID is correct.`);

      interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  },
};
