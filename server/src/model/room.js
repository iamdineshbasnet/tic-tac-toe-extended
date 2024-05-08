const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Room = new Schema({
  player: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player'
    }
  ],
  roomId: {
    type: Number,
    require: true
  }
})


module.exports = mongoose.model("Room", Room)