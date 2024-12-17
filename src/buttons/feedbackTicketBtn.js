const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
}=require("discord.js")

module.exports={
  customId: 'feedbackTicketBtn',
  userPermissions: [],
  botPermissions: [],

  run: async(client, interaction)=>{
    try {
      const feedbackTicketModal = new ModalBuilder()
        .setTitle('Feedback on Ticket')
        .setCustomId('feedbackTicketMdl')
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel('Rating')
              .setCustomId('ratingTicketMsg')
              .setPlaceholder('Enter a rating between 1-5 ')
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel('Feedback Message')
              .setCustomId('feedbackTicketMsg')
              .setPlaceholder('Enter your feedback here')
              .setStyle(TextInputStyle.Paragraph)
        ));

        return interaction.showModal(feedbackTicketModal)
    } catch (error) {
      console.log(error)
    }
  }
}