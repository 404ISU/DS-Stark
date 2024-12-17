const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
}=require("discord.js");
const ticketSetupSchema= require("../schemas/ticketSetupSchema");
const ticketSchema =require("../schemas/ticketSchema");


module.exports={
  customId: 'supportTicketBtn',
  run: async(client,interaction)=>{
    try {
      const {channel, guild, member}=interaction;

      const ticketSetup = await ticketSetupSchema.findOne({
        guildId: guild.id,
        ticketChannelID: channel.id
      });

      if(!ticketSetup){
        return await interaction.editReply({
          content: "The ticket system has not been setup yet. Please contact an administrator to set it up"
        })
      }

      if(ticketSetup.ticketType === "modal"){
        const ticketModal = new ModalBuilder()
          .setTitle('Ticket system')
          .setCustomId('ticketMdl')
          .setComponents(
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                  .setLabel('Ticket subject')
                  .setCustomId('ticketSubject')
                  .setPlaceholder('Enter a subject for your ticket')
                  .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().setComponents(
              new TextInputBuilder()
                .setLabel('Ticket description')
                .setCustomId('ticketDesc')
                .setPlaceholder('Enter a description for your ticket')
                .setStyle(TextInputStyle.Paragraph)
            )
          );

          return interaction.showModal(ticketModal);
      }else{
        await interaction.deferReply({ephemeral: true});

        const ticketChannel = guild.channels.cache.find(
          ch=>ch.id=== ticketSetup.ticketChannelID
        )
        const staffRole=guild.roles.cache.get(ticketSetup.staffRoleID);
        const username= member.user.globalName ?? member.user.username;

        const ticketEmbed = new EmbedBuilder()
          .setColor('DarkGreen')
          .setAuthor({name: username, iconURL: member.user.displayAvatarURL()})
          .setTitle('Support Ticket')
          .setDescription('Staff will be with you shortly./\n Please explain your issue in as much detail as possible.')
          .setFooter({
            text: `${guild.name} - Ticket name`,
            iconURL: guild.iconURL()
          })
          .setTimestamp();

        const ticketButtons = new ActionRowBuilder().setComponents([
          new ButtonBuilder()
           .setCustomId('closeTicketBtn')
           .setStyle(ButtonStyle.Danger)
           .setLabel('Close Ticket'),
          new ButtonBuilder()
           .setCustomId('lockTicketBtn')
           .setStyle(ButtonStyle.Primary)
           .setLabel('Lock Ticket')
        ]);


        let ticket  = await ticketSchema.findOne({
          guildID: guild.id,
          ticketMemberID: member.id,
          parentTicketChannelID: ticketChannel.id,
          closed: false
        });


        const ticketCount = await ticketSchema.countDocuments({
          guildID: guild.id,
          ticketMemberID: member.id,
          parentTicketChannelID: ticketChannel.id,
          closed: false
        });


        if(ticket){
          return await interaction.editReply({
            content: "You already have a open ticket"
          });
        }

        const thread = await ticketChannel.threads.create({
          name: `${ticketCount + 1} - ${username}'s ticket`,
          type: ChannelType.PrivateThread
        });

        await thread.send({
          content: `${staffRole} - Ticket created by ${member}`,
          embeds: [ticketEmbed],
          components: [ticketButtons]
        });


        if(!ticket){
          ticket = await ticketSchema.create({
            guildID: guild.id,
            ticketMemberID: member.id,
            parentTicketChannelID: channel.id,
            ticketChannelID: thread.id,
            closed: false,
            memberAdded: []
          });

          await ticket.save().catch(err=> console.log(err));
        }

        return await interaction.editReply({
          content: `Your ticket has been created in ${thread}`
        });

      }
    } catch (error) {
      console.log(error)
    }

  }
}

