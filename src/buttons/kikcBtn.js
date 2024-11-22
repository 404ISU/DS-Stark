// сами кнопки работают, можешь если хочешь потом их изменить(просто выдают ошибки, хотя сам а функция работает)
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "kickBtn",
  userPermissions: [],
  bitPermissions: [PermissionFlagsBits.KickMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    const embedAuthor = message.embeds[0]?.author;
    const fetchMembers = await guild.members.fetch({ query: embedAuthor.name, limit: 1 });
    const targetMember = fetchMembers.first();

    if (!targetMember) {
      const errorEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(`\`❌\` Could not find the user.`);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const rEmbed = new EmbedBuilder()
      .setColor("FFFFFF")
      .setFooter({ text: `${client.user.username} - Moderate user` })
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` What is the reason to kick ${targetMember.user.username}?\n\`❕\` You have 15 seconds to reply. After this time the moderation will be automatically canceled.\n\n\`💡\` To cancel the moderation, answer with \`cancel\`.`
      );

    await message.edit({ embeds: [rEmbed], components: [] });

    const filter = (m) => m.author.id === user.id;
    let reason = "No reason specified.";

    try {
      const reasonCollector = await channel.awaitMessages({
        filter,
        max: 1,
        time: 15_000,
        errors: ["time"],
      });

      const reasonObj = reasonCollector.first();
      if (reasonObj.content.toLowerCase() === "cancel") {
        reasonObj.delete();
        rEmbed
          .setColor(mConfig.embedColorError)
          .setDescription("\`❌\` Moderation canceled.");
        await message.edit({ embeds: [rEmbed] });
        setTimeout(() => message.delete(), 2000);
        return;
      }
      reason = reasonObj.content.trim() || "No reason specified.";
      reasonObj.delete();
    } catch {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription("\`❌\` Moderation canceled.");
      await message.edit({ embeds: [rEmbed] });
      setTimeout(() => message.delete(), 2000);
      return;
    }

    try {
      await targetMember.kick(reason);
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(`\`❌\` Failed to kick ${targetMember.user.username}.`);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const dataGD = await moderationSchema.findOne({ GuildID: guildId });
    const { LogChannelID } = dataGD || {};
    const loggingChannel = guild.channels.cache.get(LogChannelID);

    if (loggingChannel) {
      const lEmbed = new EmbedBuilder()
        .setColor("FFFFFF")
        .setTitle("\`❌\` User kicked")
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          { name: "Kicked by", value: `<@${user.id}>`, inline: true },
          { name: "Reason", value: `${reason}`, inline: true }
        )
        .setFooter({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          text: `${client.user.username} - Logging system`,
        });

      loggingChannel.send({ embeds: [lEmbed] });
    }

    rEmbed
      .setColor(mConfig.embedColorSucces)
      .setDescription(`\`✔\` Successfully kicked ${targetMember.user.username}.`);
    await message.edit({ embeds: [rEmbed] });
    setTimeout(() => message.delete(), 2000);
  },
};
