module.exports = (existing, local) => {
  // проверяем изменилось ли имя
  const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  // проверяем изменилось ли описание и имя
  if (
    changed(existing.name, local.date.name) ||
    changed(existing.description, local.data.description)
  ) {
    return true;
  }

  // проверяем изменились ли опции
  const optionChanged = changed(
    optionsArray(existing),
    optionsArray(local.data)
  );

  
  // если хотя бы одно из полей изменилось, возвращаем true
  return optionChanged;

  // функция для преобразования объекта опций в массив
  function optionsArray(cmd) {
    const cleanObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === "object") {
          cleanObject(obj[key]);
        }
      }
    };
  }
};
