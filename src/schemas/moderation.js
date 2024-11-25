const {model,Schema}=require("mongoose");

let moderationSchemas=new Schema({
  GuildID: String,
  MultiGuilded:Boolean, // level 2
  LogChannelID:String,

}, {strict:false})

module.exports=model("moderation", moderationSchemas);