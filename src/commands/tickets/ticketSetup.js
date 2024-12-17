const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ticketSetupSchema = require("../../schemas/ticketSetupSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Setup a ticket system for your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("feedback-channel")
        .setDescription("The channel where feedback will be sent")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName("ticket-channel")
        .setDescription("The channel where ticket will be created")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName("staff-role")
        .setDescription("The role that will be able to see tickets")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('ticket-type')
        .setDescription("Whether tickets will be sent as buttons or modal")
        .addChoices(
          { name: "Modal", value: "modal" },
          { name: "Button", value: "button" }
        )
        .setRequired(true)
    ),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],

  run: async (client, interaction) => {
    try {
      const { guild, options } = interaction;

      const staffRole = options.getRole("staff-role");
      const feedbackChannel = options.getChannel("feedback-channel");
      const ticketChannel = options.getChannel("ticket-channel");
      const ticketType = options.getString("ticket-type");

      await interaction.deferReply({ ephemeral: true });

      const buttonTicketCreateEmbed = new EmbedBuilder()
        .setTitle("Ticket System")
        .setDescription("Click the button below to create a ticket")
        .setColor("Green")
        .setFooter({ text: "Support Tickets" })
        .setTimestamp();

      const modalTicketCreateEmbed = new EmbedBuilder()
        .setTitle("Ticket System")
        .setDescription("Click the button below to create a ticket")
        .setColor("Green")
        .setFooter({ text: "Support Tickets" })
        .setTimestamp();

      const ticketSetupEmbed = new EmbedBuilder()
      .setTitle('Ticket System Setup')
        .setColor("DarkGreen")
        .setDescription("Ticket System has been setup successfully.")
        .addFields(
          { name: "Ticket Channel", value: `${ticketChannel}`, inline: true },
          {
            name: "Feedback Channel",
            value: `${feedbackChannel}`,
            inline: true,
          },
          { name: "Staff Role", value: `${staffRole}`, inline: true },
          { name: "Ticket Type", value: `${ticketType}`, inline: true }
        )
        .setTimestamp();

      const openTicketButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("supportTicketBtn")
          .setLabel("Open Ticket")
          .setStyle(ButtonStyle.Secondary),
      );

      let setupTicket = await ticketSetupSchema.findOne({
        ticketChannelID: ticketChannel.id,
      });

      if (setupTicket) {
        return await interaction.editReply({
          content: "This channel is already setup as a ticket channel",
        });
      } else {
        setupTicket = await ticketSetupSchema.create({
          guildID: guild.id,
          ticketChannelID: ticketChannel.id,
          feedbackChannelID: feedbackChannel.id,
          staffRoleID: staffRole.id,
          ticketType: ticketType,
        });
        
        await setupTicket.save().catch((err) => console.log(err));
      }

      if (ticketType === "button") {
        await ticketChannel.send({
          embeds: [buttonTicketCreateEmbed],
          components: [openTicketButton],
        });
      } else {
        await ticketChannel.send({
          embeds: [modalTicketCreateEmbed],
          components: [openTicketButton],
        });
      }

      return await interaction.editReply({
        embeds: [ticketSetupEmbed],
      });
    } catch (error) {
      console.log(error);
    }
  },
};
