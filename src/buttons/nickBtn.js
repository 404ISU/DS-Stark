const moderationSchema = require("../schemas/moderation"); 
const mConfig = require("../messageConfig.json");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

// кнопка управления никнеймами
module.exports = {
  customId: "nickBtn",
  userPermissions: [PermissionFlagsBits.ManageNicknames],
  botPermissions: [PermissionFlagsBits.ManageNicknames],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    const embedAuthor = message.embeds[0].author;
    const guildMembers = await guild.members
      .fetch({
        query: embedAuthor.name,
        limit: 1,
      })
      const targetMember=guildMembers.first();

    const tagline = Math.floor(Math.random() * 1000) + 1;

    const rEmbed = new EmbedBuilder()
      .setColor("White")
      .setFooter({ text: `${client.user.uesrname}- Moderate user `})
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(`\`❔\`Whats is the reason to moderate the nickname of ${targetMember.user.username}?
        \`❕\` You have 15 seconds to reply. After this time the moderation will be automatically canceled.\n\n\`💡\` To continue without a reason, answer with \-\`
        \`💡\` To cancel the moderation action, answer with \cancel\`
        .`);

    message.edit({ embeds: [rEmbed], components: [] });

    const filter = (m) => m.author.id === user.id;
    const reasonCollector = await channel
      .awaitMessages({ filter, max: 1, time: 15_000, errors: ["time"] })
      .then((reason) => {
        // если отмена, то не меняем ник
        if (reason.first().content.toLowerCase() === "cancel") {
          reason.first().delete();

          rEmbed
            .setColor(`${mConfig.embedColorError}`)
            .setColor(`\`❌\` Moderation action canceled.`);

          // сколько будет показываться сообщение об отмене изменения ника прежде чем удалится
          message.edit({ embeds: [rEmbed] });
          setTimeout(() => {message.delete()}, 2000);
          return;
        }
        return reason;
      }).catch(()=>{
        rEmbed
            .setColor(mConfig.embedColorError)
            .setDescription(`\`❌\` Moderation action expired.`);

          // сколько будет показываться сообщение об отмене изменения ника прежде чем удалится
          message.edit({ embeds: [rEmbed] });
          setTimeout(() => {message.delete()}, 2000);
          return;
      });

      // создаем объект причины
      const reasonObj=reasonCollector?.first();

      if(!reasonObj) return;

      let reason =reasonObj.content;

      // изменить ник без указания причины
      if(reasonObj.content === '-') reason="No reason specifed";

      // находим из бд
      let dataGD =await moderationSchema.findOne({GuildID: guildId})
      if(!dataGD) return;

      // смена ника
      await targetMember.setNickname(`Moderated Nickname ${tagline}`);

      // проверим что сервер авторизирован
      const {LogChannelID}=dataGD;
      const loggingChannel=guild.channels.cache.get(LogChannelID)

      
      const lEmbed=new EmbedBuilder()
        .setColor("White")
        .setTitle("❕ Moderated Nickname")
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(`\`💡\` I moderated the users nickname - Moderate Nickname`)
        .addFields(
          {name: "Changed by", value: `<@${user.id}>`, inline: true},
          {name: "Reason", value: `${reason}`, inline: true})
        .setFooter({iconURL:`${client.user.displayAvatarURL({dynamic:true})}`,
          text: `${client.user.username}- Logging system.`});
          
          loggingChannel.send({embeds: [lEmbed]})


          // пишем что ник изменен
          rEmbed.setColor(`${mConfig.embedColorSucces}`).setDescription(`\`✔\`Successfully moderated the users name to ${targetMember.user.username}`);

          message.edit({embeds: [rEmbed]});
          setTimeout(() => {message.delete()}, 2000);

  },
};