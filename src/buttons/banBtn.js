// сами кнопки работают, можешь если хочешь потом их изменить(просто выдают ошибки, хотя сам а функция работает)
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "banBtn",
  userPermissions: [],
  bitPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    const embedAuthor = message.embeds[0]?.author;
    const fetchMembers = await guild.members.fetch({ query: embedAuthor.name, limit: 1 });
    const targetMember = fetchMembers.first();

    if (!targetMember) {
      const errorEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(`\`❌\` Could not find the user to ban.`);
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
        `\`❔\` What is the reason to ban ${targetMember.user.username}?\n\`❕\` You have 15 seconds to reply. After this time the moderation will be automatically canceled.\n\n\`💡\` To cancel the moderation, answer with \`cancel\`.`
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
      await targetMember.ban({ reason: `${reason}`, deleteMessageDays: 7 });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorError)
        .setDescription(`\`❌\` Failed to ban ${targetMember.user.username}.`);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const dataGD = await moderationSchema.findOne({ GuildID: guildId });
    const { LogChannelID } = dataGD || {};
    const loggingChannel = guild.channels.cache.get(LogChannelID);

    const lEmbed = new EmbedBuilder()
      .setColor("FFFFFF")
      .setTitle("\`❌\` User banned")
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`💡\` To unban ${targetMember.user.username}, use \`/unban ${targetMember.user.id}\`.`
      )
      .addFields(
        { name: "Banned by", value: `<@${user.id}>`, inline: true },
        { name: "Reason", value: `${reason}`, inline: true }
      )
      .setFooter({
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
        text: `${client.user.username} - Logging system`,
      });

    if (loggingChannel) {
      loggingChannel.send({ embeds: [lEmbed] });
    }

    rEmbed
      .setColor(mConfig.embedColorSucces)
      .setDescription(`\`✔\` Successfully banned ${targetMember.user.username}.`);
    await message.edit({ embeds: [rEmbed] });
    setTimeout(() => message.delete(), 2000);
  },
};
