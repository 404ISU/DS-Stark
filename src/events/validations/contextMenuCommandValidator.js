require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenusCommand()) return;
  const localContextMenus = getLocalContextMenus();

  try {
    const menuObject = localContextMenus.find((cmd) => cmd.data.name === interaction.commandName);
    if (!menuObject) return;

    if (menuObject.devOnly ) {
      if(!developersId.includes(interaction.member.id)){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (menuObject.testMode) {
      if(interaction.guild.id!==testServerId){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (menuObject.userPermissions?.length) {
      for (const permission of menuObject.userPermissions) {
        if (member.permissions.has(permission)) {continue;}

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };

    if (menuObject.botPermissions?.length) {
      for (const permission of menuObject.botPermissions) {
        const bot = guild.members.me;
        if (bot.permissions.has(permission)) continue;

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };

    if (interaction.isChatInputCommand()) {
      if (!menuObject.run) return interaction.reply({ content: "`⚠️` This command does not have a run function!", ephemeral: true });

      await menuObject.run(client, interaction);
    } else if (interaction.isAutocomplete()) {
      if (!menuObject.autocomplete) return interaction.respond([{ name: "No autocomplete handling found, this is a fallback option.", value: "fallbackAutoComplete" }]);

      await menuObject.autocomplete(client, interaction);
    };
  } catch (err) {
    console.log("[ERROR]".red + "Error in your chatInputCommandValidator.js file:");
    console.log(err);
  };
};