const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

// создаем команды с косой чертой с помощью данных
module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test if everything works")
    .setDMPermission(false)
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("user")
        .setDescription("configure a user")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("role")
            .setDescription("Configure a user'a role")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user to configure.")
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("nickname")
            .setDescription("Configure a user' nickname")
            .addStringOption((option) =>
              option
                .setName("nickname")
                .setDescription("The nickname the user should have.")
            )
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user to configure.")
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message")
        .setDescription("Configure a message")
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages], // Разрешения для пользователей
  botPermissions: [PermissionFlagsBits.Connect], // Разрешения для бота
  run: (click, interection) => {
    return interection.reply("This is a test command");
  },
};