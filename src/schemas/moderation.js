const {model,Schema}=require("mongoose");

let moderationSchemas=new Schema({
  GuildID: String,
  LogChannelID:String,

}, {strict:false})

module.exports=model("moderation", moderationSchemas);