const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  customId: "tempmuteMdl",
  userPermissions: [PermissionFlagsBits.BanMembers],
  banPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    try {
      const { message, guildId, guild, fields } = interaction;

      // Получение пользователя из embed
      const embedAuthor = message.embeds[0].author;
      const guildMembers = await guild.members
        .fetch({
          query: embedAuthor.name,
          limit: 1,
        })
        .catch((err) => console.error("Ошибка получения участников:", err));
      const targetMember = guildMembers.first();

      if (!targetMember) {
        return interaction.followUp({
          content: "Не удалось найти пользователя для мьюта.",
          ephemeral: true,
        });
      }

      const muteTime = fields.getTextInputValue("tempmuteTime");
      const muteReason = fields.getTextInputValue("tempmuteReason");

      // Парсинг продолжительности мьюта
      function parseDuration(durationString) {
        const regex = /(\d+)([hmd])/g;
        let duration = 0;
        let match;

        while ((match = regex.exec(durationString))) {
          const value = parseInt(match[1]);
          const unit = match[2];

          switch (unit) {
            case "h":
              duration += value * 60 * 60 * 1000; // Часы в миллисекунды
              break;
            case "d":
              duration += value * 24 * 60 * 60 * 1000; // Дни в миллисекунды
              break;
            case "m":
              duration += value * 30.44 * 24 * 60 * 60 * 1000; // Месяцы в миллисекунды
              break;
          }
        }
        return duration;
      }

      const muteDuration = parseDuration(muteTime);
      const muteEndTime = Math.floor((Date.now() + muteDuration) / 1000);

      const mEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(
          `${targetMember.user.username} временно замучен по причине: ${muteReason}! **(Мут завершится: <t:${muteEndTime}:R>)**`
        );

      await interaction.deferReply();

      // Получение данных из базы
      const dataGD = await moderationSchema.findOne({ GuildID: guildId });
      if (!dataGD || !dataGD.MuteRoleID) {
        return interaction.followUp({
          content: "Роль для мьюта не настроена. Пожалуйста, настройте её.",
          ephemeral: true,
        });
      }

      const muteRoleId = dataGD.MuteRoleID;
      const muteRole = guild.roles.cache.get(muteRoleId);

      if (!muteRole) {
        return interaction.followUp({
          content: "Роль для мьюта не найдена на сервере. Проверьте настройки.",
          ephemeral: true,
        });
      }

      // Добавление роли
      await targetMember.roles
        .add(muteRole, `Tempmuted for ${muteReason}`)
        .catch((err) => {
          console.error("Ошибка добавления роли:", err);
          throw new Error("Не удалось добавить роль для мьюта.");
        });

      // Таймер для снятия роли
      setTimeout(async () => {
        await targetMember.roles.remove(muteRole).catch((err) => {
          console.error("Ошибка снятия роли:", err);
        });
      }, muteDuration);

      // Отправка сообщения о мьюте
      await interaction.followUp({ embeds: [mEmbed] });

      // Логирование
      const { LogChannelID } = dataGD;
      const loggingChannel = guild.channels.cache.get(LogChannelID);

      if (loggingChannel) {
        const lEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorSucces)
          .setTitle("`❕` Пользователь временно замучен")
          .setAuthor({
            name: targetMember.user.username,
            iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
          })
          .addFields(
            {
              name: "Замучен",
              value: `<@${targetMember.id}>`,
              inline: true,
            },
            {
              name: "Причина",
              value: `${muteReason}`,
              inline: true,
            },
            {
              name: "Длительность",
              value: `**Мут завершится: <t:${muteEndTime}:R>**`,
              inline: false,
            }
          )
          .setFooter({
            iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
            text: `${client.user.username}- Logging system`,
          });

        await loggingChannel.send({ embeds: [lEmbed] });
      }
    } catch (error) {
      console.error("Ошибка в tempmuteMdl:", error);
      await interaction.followUp({
        content: "Произошла ошибка при выполнении команды. Попробуйте ещё раз.",
        ephemeral: true,
      });
    }
  },
};
