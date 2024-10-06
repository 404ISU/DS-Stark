module.exports=async(client,guildId)=>{
  let applicationCommands;

  // получаем список команд из текущего сервера или из приложения
  if(guildId){
    const guild=await client.guilds.fetch(guildId);
    applicationCommands=guild.commands;
  }
  // если нет id сервера, то получаем список команд из приложения
  else{
    applicationCommands=client.application.commands;
  }

  // загружаем список полученных команд из приложения
  await applicationCommands.fetch();
  return applicationCommands;
}