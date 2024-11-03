const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder}=require("discord.js");
const moderationSchemas=require("../../schemas/moderation");
const mConfig=require(
  "../../messageConfig.json"
)

module.exports={
  data:new SlashCommandBuilder().setName("moderateSystem").setDescription("An advance moderate system").addSubcommand((s)=>s
  .setName("configure").setDescription("Configures the advance moderating system into the server").addChannelOption((o)=>o
  .setName("logging_channel").setDescription("the channel where all moderations will be logged.").setRequired(True).addChannelTypes(ChannelType.GuildText)
    )
  )
  .addSubcommand((s)=>s
    .setName("remove").setDescription("Remove the advance moderation system from the server")
  ).toJSON()
  ,
  userPermissions:[PermissionFlagsBits.Administrator],botPermissions:[],

  run:async(client, interaction)=>{
    const {options,guildId, guild}=interaction;
    const subcmd=options.getSubCommand();
    if(!["configure", "remove"].includes(subcmd)) return;
    const rEmbed=new EmbedBuilder()
    .setFooter({
      iconURL: `${client.user.displayAvatarURL({dynamic:true})}`,
      text:`${client.user.username}- Advanced moderation system`
    });

    switch(subcmd){
      case"configure":
      const loggingChannel=options.getChannel("logging_channel");
      let dataGO=await moderationSchemas.findOne({GuildID: guildId});
      if(!dataGO){
        rEmbed
        .setColor(mConfig.embedColorWarning)
        .setDescription("\`⌛\` New server Detected: Configuring the advanced moderation system...");
      
      await interaction.reply({embeds:[rEmbed], fetchReplay: true, ephemeral:true});

      dataGO=new moderationSchemas({
        GuildID: guildId,
        LoggingChannel: loggingChannel.id
      });

      dataGO.save();

      rEmbed
      .setColor(mConfig.embedColorSucces)
      .setDescription(`\`✔\`Successfully configured the advanced moderation system.`)
      .addFields(
        {name: "Logging channel", values: `${loggingChannel}`, inline:true}
      );

      setTimeout(()=>{
        interaction.editReplay({embeds:[rEmbed], ephemeral:true});
      },2_000
      );
    }else{
      await moderationSchemas.findOneAndUpdate({GuildID:guildId},{LoggingChannelID:loggingChannel.id});

      rEmbed
      .setColor(mConfig.embedColorSucces)
      .setDescription(`\`✔\`Successfully updated the advanced moderation system`)
      .addFields(
        {name: "Logging channel", values: `${loggingChannel}`, inline:true}
      );

    interaction.reply({embeds:[rEmbed],ephemeral:true});
    };
    break;

    case"remove":
    const removed=await moderationSchemas.findOneAndDelete({guildID:guildId});
    if(remove){
      rEmbed
      .setColor(mConfig.embedColorSucces)
      .setDescription(`\`✔\`Successfully removed the advanced moderation system`)
    }else{
      rEmbed
      .setColor(mConfig.embedColorError)
      .setDescription(`\`❌\`this server isn't configurated yet.\n\n``Use \`/moderatesystem configure\` to start configuring this server`);

    }

    interaction.reply({embeds:[rEmbed],ephemeral:true});
    break;
  };
},
}
