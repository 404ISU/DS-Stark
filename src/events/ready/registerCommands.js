require("colors");

const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const { testServerId } = require("../../config.json");
// const consolelog = require("./consoleLog");

module.exports = async (client) => {
  try {
    const localCommands=getLocalCommands()
    const applicationComands = await 
      getApplicationCommands(client, testServerId);

      // прогоняем какие локальные команды существуют
    for (const localCommand of localCommands) {
      const { data } = localCommand;
      const commandName=data.name;
      const commandDescription=data.description;
      const commandOptions=data.options;
      // ищем существующуие команды по имени
      const existingCommand = await applicationComands.cache.find(
        (cmd) => cmd.name === commandName
      );

        if (existingCommand) {
          // если команда удалена
          if(localCommand.deleted){
          await applicationComands.delete(existingCommand.id);
          console.log(`[COMAND REGISTERY]Команда удалена: ${commandName}`.red);
          continue;
          };
          // если команда изменена
          if(commandComparing(existingCommand,localCommand)){
            await applicationComands.edit(existingCommand.id, {
              name: commandName,
              description: commandDescription,
              options: commandOptions,
            });
            console.log(
              `[COMAND REGISTERY] Обновлена команда ${commandName}`.yellow
            );
          };
        } else {
          if(localCommand.deleted){
            console.log(
            `[COMAND REGISTERY] Command ${commandName} была пропущена, свойство удалено, установлено значение true`
              .grey
          );
          continue
          };
          await applicationComands.create({name: commandName,
            description: commandDescription,
            options: commandOptions,});
          console.log(
          `Создана команда ${commandName}`.green
        );
      };
      };
    }
   catch (error) {
    console.log(`ошибка в команде: \n ${error}`.red);
  }
};
