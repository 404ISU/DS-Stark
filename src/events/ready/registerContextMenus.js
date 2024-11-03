require("colors");


const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");
const { testServerId } = require("../../config.json");


module.exports = async (client) => {
  try {
    const localContextMenus=getLocalContextMenus()
    const applicationContextMenus = await 
      getApplicationContextMenus(client, testServerId);

      // прогоняем какие локальные команды существуют
    for (const localContextMenu of localContextMenus) {

      const { data } = localContextMenu;
      const contextMenuName=data.name;
      const contextMenuType=data.type;

      // ищем существующуие команды по имени
      const existingContextMenu = await applicationContextMenus.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

        if (existingContextMenu) {
          // если команда удалена
          if(localContextMenu.deleted){
          await applicationContextMenus.delete(existingContextMenu.id);
          console.log(`[COMAND REGISTERY]Deleted command: ${contextMenuName}`.red);
          continue;
          };
        } else {
          if(localContextMenu.deleted){
            console.log(
            `[COMAND REGISTERY] Command ${contextMenuName} была пропущена, свойство удалено, установлено значение true`
              .grey
          );
          continue
          };
          await applicationContextMenus.create({name: contextMenuName, type:contextMenuType});
          console.log(
          `Создана команда ${contextMenuName}`.green
        );
      };
      };
    }
   catch (error) {
    console.log(`ошибка в команде: \n ${error}`.red);
  }
};
