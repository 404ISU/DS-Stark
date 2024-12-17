const {PermissionFlagsBits}= require("discord.js");


module.exports={
  customId: 'lockTicketBtn',
  userPermissions: [PermissionFlagsBits.ManageThreads],
  botPermissions: [],
  run: async(client, interaction)=>{
    try {
      const {channel} =interaction;
      await interaction.deferReply({ephemeral:true});

      await channel.setLocked(true);


      return await interaction.editReply({
        content: 'This ticket has been locked'
      })
    } catch (error) {
      console.log(error)
    }
  }
}