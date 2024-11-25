const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  // удаляем сообщения в канале
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes a specific number of messages provided")
    // количество сообщений
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("Amount of messages to delete from the channel")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    // чьи сообщения удаляем
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("Messages to be deleted from a specific user in a channel")
    ),
  // разрешения для пользователя и для бота
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  // обработчик команды
  run: async (client, interaction) => {
    const options = interaction.options;
    let amount = options.getInteger("amount");
    const target = options.getUser("target");
    const channel = interaction.channel; // Получаем текущий канал
    const multiMsg = amount === 1 ? "message" : "messages";

    // проверка на правильность количества сообщений
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "The number of messages must be between 1 and 100.",
        ephemeral: true,
      });
    }

    try {
      // кол-во сообщений которые написал пользователь
      const channelMessages = await channel.messages.fetch();
      // если здесь ничего нет
      if (channelMessages.size === 0) {
        return await interaction.reply({
          content: "There are no messages in this channel to delete.",
          ephemeral: true,
        });
      }

      // если выбрали больше чем есть фактически, присваиваем максимальное значение уже написанных сообщений
      if (amount > channelMessages.size) amount = channelMessages.size;

      const clearEmbed = new EmbedBuilder().setColor(mConfig.embedColorSucces);

      // обработчик загрузки между выполнением команд
      await interaction.deferReply({ ephemeral: true });

      let messagesToDelete = [];

      // если указан человек, то удалятся только его сообщения
      if (target) {
        messagesToDelete = channelMessages.filter((m) => m.author.id === target.id).first(amount);
        clearEmbed.setDescription(`✔️ Successfully cleared ${messagesToDelete.length} ${multiMsg} from ${target} in ${channel}`);

      }
      // если не указан человек, то просто удалятся сообщения из канала
      else {
        messagesToDelete = channelMessages.first(amount);
        clearEmbed.setDescription(`✔️ Successfully cleared ${messagesToDelete.length} ${multiMsg} in ${channel}`);
      }

      // если в массиве для удаления что-то есть, то оно удаляется
      if (messagesToDelete.length > 0) {
        await channel.bulkDelete(messagesToDelete, true);
      }

      await interaction.editReply({ embeds: [clearEmbed] });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "An error occurred while clearing messages.",
        ephemeral: true,
      });
    }
  },
};
