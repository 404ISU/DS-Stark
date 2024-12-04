const { EmbedBuilder, ActionRowBuilder, ButtonStyle,ButtonBuilder } = require("discord.js");

module.exports = {
  customId: "otherBtn",
  userPermissions: [],
  botPermissions: [],

  // кнопка для перехода к другим кнопкам
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    await interaction.deferReply({ephemeral:false})

    try {
    const embedAuthor = message.embeds[0].author;
    const guildMembers = await guild.members
      .fetch({
        query: embedAuthor.name,
        limit: 1,
      })
      const targetMember=guildMembers.first();

    const Oembed = new EmbedBuilder()
      .setTitle("Other Options")
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` What action do you want to use againts ${targetMember.user.username}?`
      );

    const otherRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("nickBtn")
        .setLabel("Manage nick")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("addroleBtn")
        .setLabel("Add role")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("cancelBtn")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({embeds:[Oembed], components:[otherRow]})
    } 
    catch (error) {
      console.log(error);
    }
  },
};
