require("colors");

const { testServerId } = require("../../config.json");
const commandComparin = require("../../utils/commandComparing");
const getApplicationComands = require("../../utils/getApplicationComands");
const getLocalComands = require("../../utils/getLocalComands");
const consolelog = require("./consoleLog");

module.exports = async (client) => {
  try {
    const [localComands, applicationCommands] = await Promise.all([
      getLocalComands(),
      getApplicationComands(client, testServerId),
    ]);

    for (const localComand of localComands) {
      const { data, deleted } = localComand;
      const {
        name: commandName,
        description: commandDescription,
        options: commandOptions,
      } = data;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (deleted) {
        if (existingCommand) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`Deleted command: ${commandName}`.red);
        } else {
          console.log(
            `Command "${commandName}" была пропущена, свойство удалено, установлено значение true`
              .grey
          );
        }
      } else if (existingCommand) {
        if (commandComparin(existingCommand, localComand)) {
          await applicationCommands.edit(existingCommand.id, {
            name: commandName,
            description: commandDescription,
            options: commandOptions,
          });
          console.log(
            `Обновлена команда "${commandName}": ${commandDescription}`.yellow
          );
        }
      } else {
        await applicationCommands.create({
          name: commandName,
          description: commandDescription,
          options: commandOptions,
        });
        console.log(
          `Создана команда "${commandName}": ${commandDescription}`.green
        );
      }
    }
  } catch (error) {
    console.log(`ошибка в команде: \n ${error}`.red);
  }
};
