const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType
}=require("discord.js");
const ticketSetupSchema = require("../schemas/ticketSetupSchema");
const ticketSchema =require("../schemas/ticketSchema");


module.exports={
  customId: 'ticketMdl',
  userPermissions:[],
  botPermissions:[],

  run:async(client, interaction)=>{
    try {
      const {fields, guild, member, channel}=interaction;

      const sub = fields.getTextInputValue('ticketSubject');
      const desc = fields.getTextInputValue('ticketDesc');

      await interaction.deferReply({ephemeral: true});

      const ticketSetup = await ticketSetupSchema.findOne({
        guildID: guild.id,
        ticketChannelID: channel.id,
      });
      if (!ticketSetup) {
        return await interaction.editReply({
          content: "Ticket setup not found for this channel. Please check your setup.",
        });
      }

      const ticketChannel = guild.channels.cache.find(ch=>ch.id === ticketSetup.ticketChannelID);
      const staffRole=guild.roles.cache.get(ticketSetup.staffRoleID);
      const username=member.user.globalName ?? member.user.username;



      const ticketEmbed = new EmbedBuilder()
        .setColor('DarkGreen')
        .setAuthor({name: username, iconURL:member.displayAvatarURL({dynamic:true})})
        .setDescription(`**Subject** ${sub}\n **Description** ${desc}`)
        .setFooter({
          text: `${guild.name} - Ticket`,
          iconURL: guild.iconURL()
        })
        .setTimestamp();

        const ticketButtons =new ActionRowBuilder().setComponents([
          new ButtonBuilder()
           .setCustomId('closeTicketBtn')
           .setStyle(ButtonStyle.Danger)
           .setLabel('Close Ticket'),
           new ButtonBuilder()
            .setCustomId('lockTicketBtn')
            .setStyle(ButtonStyle.Success)
            .setLabel('Lock ticket')
        ]);

        let ticket = await ticketSchema.findOne({
          guildID: guild.id,
          ticketMemberID: member.id,
          parentTicketChannelID: channel.id,
          closed: false
        });
        
        // Проверяем, если тикет существует
        if (ticket) {
          return await interaction.editReply({
            content: "You already have an open ticket"
          });
        }
        
        // Если тикета нет, создаем новый
        const thread = await ticketChannel.threads.create({
          name: `${ticketChannel.name} - ${username}'s ticket`,
          type: ChannelType.PrivateThread
        });
        
        await thread.send({
          content: `${staffRole} - ticket created by ${member}`,
          embeds: [ticketEmbed],
          components: [ticketButtons],
        });
        
        if (!ticket){
          ticket = await ticketSchema.create({
            guildID: guild.id,
            ticketMemberID: member.id,
            ticketChannelID: thread.id,
            parentTicketChannelID: channel.id,
            closed: false,
            membersAdded: []
          });
          
          await ticket.save().catch(err => console.log(err));
        }
        
        return await interaction.editReply({
          content: `Your ticket has been created in ${thread}`,
        });
        
    } catch (error) {
      console.log(error);
    }
  }
}