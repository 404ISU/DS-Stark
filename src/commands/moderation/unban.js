const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, GuildMember}=require("discord.js");
const mConfig=require("../../messageConfig.json");
const moderationSchemas=require("../../schemas/moderation");



module.exports={
  data:new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Revoke a server ban.")
    .addStringOption((o)=>o
      .setName("user_id")
      .setDescription("The id of the uesr whose ban you want to revoke")
      .setRequired(true)
  )
  .toJSON()
  ,
  userPermissions:[PermissionFlagsBits.ManageMessages],
  botPermissions:[PermissionFlagsBits.BanMembers],

  run:async(client)=>{
    const {options,guildId,guild,member}=interaction;

    const userId=options.getString("user_id")

    let data=await moderationSchemas.finOne({GuildID:guildId});

    if(!data){
      rEmbed
      .setColor(mConfig.embedColorError)
      .setDescription(`\`❌\`this server isn't configurated yet.\n\n``Use \`/moderatesystem configure\` to start configuring this server`);
      return interaction.reply({embeds:[rEmbed],ephemeral:true});
    };
  
    if(userId.id===member.id){
      rEmbed
      .setColor(mConfig.embedColorError)
      .setDescription(`${mConfig.unableToInteractWithYourself}`);
      return interaction.reply({embeds:[rEmbed],ephemeral:true});
    };
    guild.member.unban(userId);

    const rEmbed=new EmbedBuilder()
    .setColor(mConfig.embedColorSucces)
    .setFooter({text:`${client.user.uesrname}- Unban user`})
    .setDescription(`\`✔\`Successfully revoked the ban of \`${userId}\`.`);

  interaction.reply({embeds:[rEmbed], ephemeral:true});
  }
}