// путь
const path = require('path'); // Импорт модуля 'path' для работы с путями к файлам

// получаем все файлы
const getAllFiles = require("../utils/getAllFiles"); // Импорт функции `getAllFiles` из папки `utils`, которая, вероятно, содержит логику получения всех файлов в указанной директории

// модуль для экспорта функции получения файлов
module.exports = (client) => { 
  // Эта функция будет экспортирована и вызвана в вашем основном файле бота
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true); // Получаем список папок с событиями в директории 'events'

  // перебираем каждую папку с событиями
  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder); // Получаем список файлов в каждой папке с событиями
    let eventName;

    // из пути удаляем слеши и получаем имя файла без расширения
    eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    
    // если имя файла совпадает с именем папки, то это событие "interactionCreate"
    eventName === "validations" ? (eventName = "interactionCreate") : eventName; // Изменяем имя события 'validations' на 'interactionCreate'

    // подписываем обработчик события к имени события и вызываем его при событии
    client.on(eventName, async (arg) => { // Привязываем обработчик к событию `eventName`
      for (const eventFile of eventFiles) {
        const eventFuction = require(eventFile); // Импортируем функцию обработчика из каждого файла в папке события
        await eventFuction(client, arg); // Вызываем функцию обработчика с клиентом и аргументами события
      }
    });
  }
};
