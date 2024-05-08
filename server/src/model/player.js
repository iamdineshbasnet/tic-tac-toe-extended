const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Player = new Schema({
  name: {
    type: String,
    require: true,
    min: 3,
    max: 20,
  },
  username: {
    type: String,
    require: true,
    unique: true,
    min: 3,
    lowercase: true,
  },
  email: {
    type: String,
    lowercase: true,
    default: '',
  },
  image:{
    type: String,
		default: 'https://i.imgur.com/A0vPzPd.jpg',
  },
  isGuest: {
    type: Boolean,
    default: true,
  },
  password: {
		type: String,
		require: false,
	},

})

module.exports = mongoose.model("Player", Player)