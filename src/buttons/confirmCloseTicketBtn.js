const {
  PermissionFlagsBits,
  EmbedBuilder
}=require("discord.js")
const ticketSetupSchema = require("../schemas/ticketSetupSchema");
const ticketSetup = require("../schemas/ticketSchema");
const ticketSchema = require("../schemas/ticketSchema");
const { error } = require("console");


module.exports={
  customId: 'confirmCloseTicketBtn',
  userPermissions: [PermissionFlagsBits.ManageThreads],
  botPermissions: [],

  run: async(client, interaction)=>{
    try {
      const { channel, guild } = interaction;


      const closingEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Closing Ticket')
       .setDescription('Are you sure you want to close this ticket? This action cannot be undone.')

      await channel.send({embeds: [closingEmbed]});

      await interaction.deferReply();


      const closedEmbed=new EmbedBuilder()
        .setColor('Red')
        .setTitle('Ticket Closed')
       .setDescription('This ticket has been closed')

      const setupTicket=await ticketSetupSchema.findOne({
        guildId: guild.id,
        channelId: channel.id,
      });

      if (!setupTicket) {
        return interaction.editReply({
          content: 'Ticket setup not found. Please check your configuration.',
          ephemeral: true
        });
      }
      

      const ticket = await ticketSchema.findOne({
        guildId: guild.id,
        channelId: channel.id,
        closed: false,
      });

      const staffRole = guild.roles.cache.get(setupTicket.staffRoleID);


      const hasRole = staffRole.members.has(ticket.ticketMemberID);

      if(!hasRole){
        ticket.membersAdded.map(async (member)=>{
          await channel.members.remove(member);
        });
        await channel.members.remove(ticket.ticketMemberID);
      }

      await ticketSchema.findOneAndUpdate({
        guildID: guild.id,
        ticketChannelID: channel.id,
        closed: false
      },{
        closed: true
      }, {new: true})

      await channel.setArchived(true);


      return await interaction.editReply({
        embeds: [closedEmbed],
      })
    }
    catch(error){
      console.log(error)
    }

}
}