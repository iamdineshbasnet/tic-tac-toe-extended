const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Room = new Schema({
	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Player',
		},
	],
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'Player',
	},
  uid:{
    type: String,
  },
	roomId: {
		type: Number,
	},
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Room', Room);
