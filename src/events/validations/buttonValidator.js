require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getButtons = require("../../utils/getButtons");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  const buttons = getButtons();

  try {
    const buttonObject = buttons.find((cmd) => cmd.data.name === interaction.commandName);
    if (!buttonObject) return;

    if (buttonObject.devOnly ) {
      if(!developersId.includes(interaction.member.id)){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (buttonObject.testMode) {
      if(interaction.guild.id!==testServerId){
        const rEmbed = new EmbedBuilder()
        .setColor(`${mConfig.embedColorError}`)
        .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({embeds:{rEmbed}, ephemeral:true});
        return;
      };
    };

    if (buttonObject.userPermissions?.length) {
      for (const permission of buttonObject.userPermissions) {
        if (member.permissions.has(permission)) {continue;}

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };

    if (buttonObject.botPermissions?.length) {
      for (const permission of buttonObject.botPermissions) {
        const bot = guild.members.me;
        if (bot.permissions.has(permission)) continue;

        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);

        return interaction.reply({ embeds: [rEmbed], ephemeral: true });
      };
    };
    if(interaction.message.interaction){
      if(interaction.message.interaction.user.id!==interaction.user.id){
        const rEmbed=new EmbedBuilder()
        .setColor(`$(mConfig.embedColorError)`)
        .setDescription(`${mConfig.cannotUseButton}`);
        interaction.reply({embeds:[rEmbed], ephemeral:true}) 
        return;
      };
    };
    
    await buttonObject.run(client,interaction);
  } catch (err) {
    console.log("[ERROR]".red + "Error in your chatInputCommandValidator.js file:");
    console.log(err);
  };
};