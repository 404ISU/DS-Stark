const path=require('path');
const getAllFiles=require('./getAllFiles');

module.exports=(exceptions=[])=>{
  let localComands=[];
  const commandCategories=getAllFiles(path.join(__dirname, '..','events'),true);


  // перебираем категории комманд
  for(const commandCategory of commandCategories){
    const commandFiles = getAllFiles(commandCategory);


    // перебираем файлы в категории комманд и добавляем каждую комманду к массиву комманд
    for (const commandFile of commandFiles){
      const comandObject=require(commandFile);
      if(exceptions.includes(comandObject.name))continue;
      localComands.push(comandObject);
    }
  }
  return localComands;
};