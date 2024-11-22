
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const moderationSchemas = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderatesystem")
    .setDescription("An advanced moderation system")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("configure")
        .setDescription("Configures the advanced moderation system into the server")
        .addChannelOption((option) =>
          option
            .setName("logging_channel")
            .setDescription("The channel where all moderations will be logged.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText) // Указан тип
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove the advanced moderation system from the server")
        
    ),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],

  run: async (client, interaction) => {
    try {
      const { options, guildId } = interaction;

      const subcommand = options.getSubcommand();
      const rEmbed = new EmbedBuilder()
        .setFooter({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          text: `${client.user.username} - Advanced moderation system`,
        });

      if (subcommand === "configure") {
        const loggingChannel = options.getChannel("logging_channel");
        let data = await moderationSchemas.findOne({ GuildID: guildId });

        if (!data) {
          rEmbed
            .setColor(mConfig.embedColorWarning)
            .setDescription("`⌛` New server detected: Configuring the advanced moderation system...");
          await interaction.reply({ embeds: [rEmbed], ephemeral: true });

          data = new moderationSchemas({
            GuildID: guildId,
            LoggingChannel: loggingChannel.id,
          });

          await data.save();

          rEmbed
            .setColor(mConfig.embedColorSucces)
            .setDescription("`✔` Successfully configured the advanced moderation system.")
            .addFields({ name: "Logging channel", value: `${loggingChannel}`, inline: true });

          return interaction.editReply({ embeds: [rEmbed], ephemeral: true });
        } else {
          await moderationSchemas.findOneAndUpdate(
            { GuildID: guildId },
            { LoggingChannelID: loggingChannel.id }
          );

          rEmbed
            .setColor(mConfig.embedColorSucces)
            .setDescription("`✔` Successfully updated the advanced moderation system.")
            .addFields({ name: "Logging channel", value: `${loggingChannel}`, inline: true });

          return interaction.reply({ embeds: [rEmbed], ephemeral: true });
        }
      } else if (subcommand === "remove") {
        const removed = await moderationSchemas.findOneAndDelete({ GuildID: guildId });

        if (removed) {
          rEmbed
            .setColor(mConfig.embedColorSucces)
            .setDescription("`✔` Successfully removed the advanced moderation system.");
        } else {
          rEmbed
            .setColor(mConfig.embedColorError)
            .setDescription(
              "`❌` This server isn't configured yet.\n\nUse `/moderatesystem configure` to start configuring this server."
            );
        }

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      }
    } catch (err) {
      console.error("[ERROR] An error occurred in the 'moderatesystem' command:", err);
      await interaction.reply({
        content: "`❌` An unexpected error occurred while executing this command.",
        ephemeral: true,
      });
    }
  },
};
