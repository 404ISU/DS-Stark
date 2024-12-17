const {model, Schema}=require("mongoose");

let ticketSchema=new Schema(
  {
    guildID: String,
    ticketMemberID: String,
    ticketChannelID: String,
    parentTicketChannelID: String,
    rating: Number,
    feedback: String,
    closed: Boolean, 
    memberAdded: Array,
  },
  {
    strict: false,
  }
);

module.exports=model("ticket", ticketSchema);