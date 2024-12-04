const { EmbedBuilder, ActionRowBuilder, ButtonStyle,ButtonBuilder } = require("discord.js");


module.exports = {
  customId: "punishmentBtn",
  userPermissions: [],
  botPermissions: [],

  // кнопки наказание
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
      .setTitle("Punishments")
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` What punishent do you want to use againts ${targetMember.user.username}?`
      );

    const otherRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("banBtn")
        .setLabel("Server ban")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("kickBtn")
        .setLabel("Server kick")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("tempmuteBtn")
        .setLabel("Temp Mute")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("tempbanBtn")
        .setLabel("Temp Ban")
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
