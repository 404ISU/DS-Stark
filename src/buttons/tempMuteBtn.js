const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputStyle,
  TextInputBuilder,
} = require("discord.js");

module.exports = {
  customId: "tempmuteBtn",
  userPermissions: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],

  run: async (client, interaction) => {
    // кикнуть чела в голосовом канале
    try {
      const tempMuteModal = new ModalBuilder()
        .setTitle("Temp Mute")
        .setCustomId("tempmuteMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Time")
              .setCustomId("tempmuteTime")
              .setPlaceholder("h for hour, d for day, m for month, y for year")
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Reason")
              .setCustomId("tempmuteReason")
              .setPlaceholder("Reasoning to tempmute this user")
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      return await interaction.showModal(tempMuteModal);
    } catch (error) {
      console.log(error);
    }
  },
};