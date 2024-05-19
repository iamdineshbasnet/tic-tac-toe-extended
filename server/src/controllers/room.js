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
			participants: [isPlayerExist._id],
			creator: isPlayerExist._id,
		});

		await createdRoom.save();

		const populatedRoom = await room
			.findById(createdRoom._id)
			.populate('participants', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win');

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

		if (roomDetails?.participants.length >= 2) {
			return res.status(200).json({ status: 'success', message: 'Room is already full' });
		}

		// Check if the player is already a participant
		const isAlreadyParticipant = roomDetails.participants.some((participantId) =>
			participantId.equals(isPlayerExist._id)
		);

		if (isAlreadyParticipant) {
			return res
				.status(400)
				.json({ status: 'failed', message: 'Player already in the room' });
		}

		// Add participant to the room
		roomDetails.participants.push(isPlayerExist?._id);
		await roomDetails.save();

		res.status(200).json({ status: 'success', result: roomDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

// get the room details
const getRoomDetails = async (req, res) => {
	try {
		const { id } = req.params;

		const roomDetails = await room
			.findOne({ roomId: id })
			.populate('participants', 'username image isGuest name win')
			.populate('creator', 'username image isGuest name win');

		if (!roomDetails) {
			return res.status(404).json({ status: 'failed', message: 'room not found' });
		}

		res.status(200).json({ status: 'success', result: roomDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = { createRoom, joinRoom, getRoomDetails };
