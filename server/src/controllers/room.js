const { generateRoomId } = require('../config/generateRandom');
const player = require('../model/player');
const room = require('../model/room');

// create room
const createRoom = async (req, res) => {
	try {
		const { username } = req.player;

		if (!username) {
			return res.status(401).json({ status: 'failed', message: 'Unauthorized!' });
		}

		// Find the Player by username
		const isPlayerExist = await player.findOne({ username });
		if (!isPlayerExist) {
			return res.status(404).json({ status: 'failed', message: 'Player not found!' });
		}

		// generate room id
		const roomId = generateRoomId();

		const createdRoom = new room({
			roomId,
			participants: [
				{
					player: isPlayerExist._id,
					mark: 'x',
				},
			],
			creator: isPlayerExist._id,
			board: Array(9).fill(''),
			history: [],
		});

		await createdRoom.save();

		let populatedRoom = await room
			.findById(createdRoom._id)
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();

		populatedRoom.participants = populatedRoom.participants.map((participant) => ({
			...participant.player,
			mark: participant.mark,
			_id: participant._id,
		}));

		res.status(201).json({ status: 'success', result: populatedRoom });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ status: 'error', message: error.message });
	}
};

// join the room
const joinRoom = async (req, res) => {
	try {
		const { username } = req.player;
		// expect room id
		const { id } = req.params;

		if (!username) {
			return res.status(401).json({ status: 'failed', message: 'Unauthorized!' });
		}

		// Find the Player by username
		const isPlayerExist = await player.findOne({ username });
		if (!isPlayerExist) {
			return res.status(404).json({ status: 'failed', message: 'Player not found!' });
		}

		const roomDetails = await room.findOne({ roomId: id });

		if (!roomDetails) {
			return res.status(404).json({ status: 'failed', message: 'Room not found' });
		}

		if (roomDetails.participants.length >= 2) {
			return res.status(200).json({ status: 'success', message: 'Room is already full' });
		}

		// Check if the player is already a participant
		const isAlreadyParticipant = roomDetails.participants.some((participant) =>
			participant.player.equals(isPlayerExist._id)
		);

		if (isAlreadyParticipant) {
			return res.status(400).json({ status: 'failed', message: 'Player already in the room' });
		}

		// const mark = roomDetails.participants[0].mark === 'x' ? 'o' : 'x';

		// Add participant to the room
		roomDetails.participants.push({
			player: isPlayerExist._id,
			mark: 'o',
		});
		await roomDetails.save();

		// Populate the participants and creator
		let populatedRoom = await room
			.findById(roomDetails._id)
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();

		populatedRoom.participants = populatedRoom.participants.map(participant => ({
			...participant.player,
			mark: participant.mark,
			_id: participant._id
		}));

		res.status(200).json({ status: 'success', result: populatedRoom });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};


// get the room details
const getRoomDetails = async (req, res) => {
	try {
		const { id } = req.params;

		let roomDetails = await room
			.findOne({ roomId: id })
			.populate('participants.player', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win')
			.lean();

		if (!roomDetails) {
			return res.status(404).json({ status: 'failed', message: 'room not found' });
		}

		roomDetails.participants = roomDetails.participants.map(participant => ({
			...participant.player,
			mark: participant.mark,
			_id: participant._id
		}));

		res.status(200).json({ status: 'success', result: roomDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};


module.exports = { createRoom, joinRoom, getRoomDetails };
