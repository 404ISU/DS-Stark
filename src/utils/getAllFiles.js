const fs = require("fs");
const path = require("path");


// Определим путь к директории с плагинами
module.exports = (directory, foldersOnly = false) => {
  // массив для файлов
  let fileNames = [];

  // читаем все файлы в директории
  const files = fs.readdirSync(directory, { withFileTypes: true });
  // перебираем все файлы и добавляем имена к массиву
  for (const file of files) {
    const filePath = path.join(directory, file.name);
    // если это папка и флаг foldersOnly указан в false, добавляем ее имя к массиву
    if (foldersOnly && file.isDirectory()) {
      fileNames.push(filePath);
    } else if (file.isFile()) {
      fileNames.push(filePath);
    };
  };

  return fileNames;
};