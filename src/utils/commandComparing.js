module.exports = (existing, local) => {
  // проверяем изменилось ли имя
  const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  // проверяем изменилось ли описание и имя
  if (
    changed(existing.name, local.data.name) ||
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
        // проверяем что типы объектов совпадают если нет или масив пустой, то удаляем обхект
        if (typeof obj[key] === "object") {
          cleanObject(obj[key]);
          if(!obj[key] || (Array.isArray(obj[key] && obj[key].lenght===0)))
            delete obj[key];
        }else if (obj[key]=== undefined){
          delete obj[key];
        }
      }
    };
    // нормализованный объект
    const normalizeObject=(input)=>{
      // проверим является ли он масивом, если да то преобразуем его
      if(Array.isArray(input)){
        return input.map((item)=>normalizeObject(item));
      }
      // запишем нормализованный шаблон
      const normalizedItem={
        type: input.type,
        name:input.name,
        description:input.description,
        // проверка есть ли входные данные для параметров, если да, то нормализуем входные данные для параметров
        options: input.options ? normalizeObject(input.options):undefined,
        // требования для input
        required: input.required
      }
      // возвращаем нормализованный шаблон
      return normalizedItem;
    };

    // если для cmd нет входных данных, вернем пустой массив и преобразуем его
    return (cmd.options || []).map((option)=>{
      let cleanedOption = JSON.parse(JSON.stringify(option));
      cleanedOption.options ? (cleanedOption.options = normalizeObject(cleanedOption.options)): (cleanedOption.option=normalizeObject(cleanObject));
      cleanObject(cleanedOption);
      return{
        ...cleanedOption,
        choices: cleanedOption.choices ? JSON.stringify(cleanedOption.choices.map((c)=>c.value)) : null,
      }
    })
  }
};
