// кароче все работает, но мульти бан пока не получится сделать
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const moderationSchemas = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");
const suspiciousUsers = require("../../suspiciousUsers.json"); // level 3
//  если закоментировать по левелам, то эти команды пропадут
module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderatesystem")
    .setDescription("An advanced moderation system")
    .addSubcommand(
      (subcommand) =>
        subcommand
          .setName("configure")
          .setDescription(
            "Configures the advanced moderation system into the server"
          )
          .addChannelOption(
            (option) =>
              option
                .setName("logging_channel")
                .setDescription(
                  "The channel where all moderations will be logged."
                )
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // Указан тип
          )
          .addBooleanOption((option) => // level 2
          option
              .setName("multi_guilded")
              .setDescription(
                "Adds your server on the list of allowing multi-guilded moderation"
              )
              .setRequired(true)
          ) // level 2
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove the advanced moderation system from the server")
    ),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],

  run: async (client, interaction) => {
    try {
      const { options, guildId, guild } = interaction;
      
      const subcommand = options.getSubcommand();
      const rEmbed = new EmbedBuilder().setFooter({
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
        text: `${client.user.username} - Advanced moderation system`,
      });

      switch(subcommand){
        case "configure":
          const multiGuilded=options.getBoolean("multi_guilded"); // level 2


          const loggingChannel=options.getChannel("logging_channel");

          let dataGD = await moderationSchemas.findOne({GuildID: guildId});

          if(!dataGD){
            rEmbed
              .setColor(mConfig.embedColorWarning)
              .setDescription("`⌛` New server detected: Configuring the advanced moderation system...");

              await interaction.reply({
                embeds:[rEmbed],
                fetchReply:true,
                ephemeral:true,
              });

              dataGD = new moderationSchemas({
                GuildID: guildId,
                MultiGuilded: multiGuilded, // level 2
                LoggingChannelID: loggingChannel.id,
                
              });
              dataGD.save();

              rEmbed
                .setColor(mConfig.embedColorSucces)
                .setDescription("`✔` Successfully configured the advanced moderation system.")
                .addFields({
                  // level 2
                  name: "Multi-guilded",
                  value: `${multiGuilded ? "Yes" : "No"}`,
                  inline: true,
                }
                // level 2
                ,{
                  name: "Logging channel",
                  value: `${loggingChannel}`,
                  inline: true,
                });

                setTimeout(()=>{
                  interaction.editReply({
                    embeds: [rEmbed],
                    ephemeral: true,
                  });}, 2_000);

                  // level 3

                  let i;
                  for(i=0; i< suspiciousUsers.ids.length; i++){
                    try {
                      const suspiciousUser = await guild.members.fetch(suspiciousUsers.ids[i]);

                      await guild.bans.create(suspiciousUser, {deleteMessageSeconds: 60 * 60 * 24 * 7 , reason: "Suspicious user listed by developer"});

                      const lEmbed=new EmbedBuilder()
                      .setColor(White)
                      .setTitle("`❌` User banned")
                      .setAuthor({ name:suspiciousUser.user.username,
                        iconURL: suspiciousUser.user.displayAvatarURL({
                          dynamic: true,
                        })
                      })
                      .addFields({
                        name: "Banned by",
                        value: `<@${client.user.id}>`,
                        inline: true,
                      },
                    {
                      name: "Reason",
                      value: `\`Suspicious user listed by developer. Please contact the developer if this is a mistake\``,
                      inline: true,
                    })
                    .setFooter({iconURL:`${client.user.displayAvatarURL({dynamic:true})}`, text: `${client.user.username} - Logging system`,});

                    loggingChannel.send({embeds:[lEmbed]});
                    } catch (error) {
                      continue
                    }
                  }
                  // level 3
                }else{ 
                  await moderationSchemas.findOneAndUpdate(
                    {GuildID: guildId},
                    {MultiGuilded:multiGuilded,LogChannelID: loggingChannel.id } // multiguilded level 2
                  );

                  rEmbed
                   .setColor(mConfig.embedColorSucces)
                   .setDescription("`✔` Successfully updated the advanced moderation system.")
                   .addFields(
                    {
                      // level 2
                      name: "Multi-guilded",
                      value: `\`${multiGuilded ? "Yes" : "No"}\``,
                      inline: true,
                    },
                    // level 2
                    {
                      name: "Logging channel",
                      value: `${loggingChannel}`,
                      inline: true,
                    });

                    interaction.reply({embeds:[rEmbed], ephemeral:true});
                }
                break;
                case "remove":
                  const removed = await moderationSchemas.findOneAndUpdate({
                    GuildID: guildId,
                  });
                  if(removed){
                    rEmbed
                     .setColor(mConfig.embedColorSucces)
                     .setDescription(
                        "`\`✔\` Successfully removed the advanced moderation system."
                      );
                  }else{
                    rEmbed
                    .setColor(mConfig.embedColorError)
                    .setDescription(`\`❌\` This server isn't configured yet. \n\n 💡\`Use \ /moderatessystem configure\` to start  configuring this server `);
                  }
                  interaction.reply({ embeds: [rEmbed], ephemeral: true });
                  break;
          }
      }catch (error) {
        console.error(`Error in moderation system: ${error.message}`, error);
        interaction.reply({
          content: "`❌` An unexpected error occurred. Please try again later.",
          ephemeral: true,
        });
      }
    }
  };
