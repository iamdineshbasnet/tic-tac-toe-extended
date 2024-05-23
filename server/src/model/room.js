const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Room = new Schema({
	participants: [
		{
			player: {
				type: Schema.Types.ObjectId,
				ref: 'Player',
			},
			mark: {
				type: String,
				enum: ['x', 'o'],
				require: true,
			},
		},
	],
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'Player',
		require: true,
	},
	isPlaying: {
		type: Boolean,
		default: false,
	},
	roomId: {
		type: Number,
	},
	board: {
		type: Array,
		default: [],
	},
	history: {
		type: Array,
		default: [],
	},
	turn: {
		type: String,
		enum: ['x', 'o'],
		default: 'x',
	},
	round: {
		type: Number,
		default: 1,
	},
	disabledCell: {
		type: Number,
		default: -1
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Room', Room);
