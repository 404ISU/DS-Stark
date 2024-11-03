require("colors");
const mongoose =require("mongoose");
const mongoURL=process.env.MONGO_URL;
module.exports=(client)=>{
  console.log(`[INFO] ${client.user.username} is online`.green);

  // проверяем подключение к бд
  if(!mongoURL) return;
  mongoose.set("strictQuery", true);
  // если подключились
  (async () => { 
    try { 
      await mongoose.connect(mongoURL); 
      console.log("[MONGODB] Подключен к MongoDB".green); 
    } catch (error) {
      console.error("[MONGODB] Ошибка подключения к MongoDB:", error.message);
    }
  })();
  

  };