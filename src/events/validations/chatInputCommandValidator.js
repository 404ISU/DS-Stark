require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find((cmd) => cmd.data.name === interaction.commandName);
    if (!commandObject) return;

    if (commandObject.devOnly ) {
      if(!developersId.includes(interaction.member.id)){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (commandObject.testMode) {
      if(interaction.guild.id!==testServerId){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (commandObject.userPermissions?.length) {
      for (const permission of commandObject.userPermissions) {
        if (interaction.member.permissions.has(permission)){
          continue;
        }

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) continue;

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };

    if (interaction.isChatInputCommand()) {
      if (!commandObject.run) return interaction.reply({ content: "`⚠️` This command does not have a run function!", ephemeral: true });

      await commandObject.run(client, interaction);
    } else if (interaction.isAutocomplete()) {
      if (!commandObject.autocomplete) return interaction.respond([{ name: "No autocomplete handling found, this is a fallback option.", value: "fallbackAutoComplete" }]);

      await commandObject.autocomplete(client, interaction);
    };
  } catch (err) {
    console.log("[ERROR]".red + "Error in your chatInputCommandValidator.js file:");
    console.log(err);
  };
};