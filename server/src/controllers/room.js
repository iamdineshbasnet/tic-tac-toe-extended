const { generateRoomId, generateRandomString } = require('../config/generateRandom');
const room = require('../model/room');

// create room
const createRoom = async (req, res) => {
	try {
		const { username } = req.player;

		if (!username) {
			return res.status(401).json({ status: 'failed', message: 'Unauthorized!' });
		}

		// generate room id
		const roomId = generateRoomId();
		const generatedString = generateRandomString(8)

		const createdRoom = new room({
			roomId,
			participants: username,
			link: roomLink,
			creator: username,
			uid: generatedString,
		});

		await createRoom.save();

		res.status(201).json({ status: 'success', result: createdRoom });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

// get room details
const joinRoom = async (req, res) => {
	try {
		const { username } = req.player;
		const { uid, id } = req.params;

		if (!username) {
			return res.status(401).json({ status: 'failed', message: 'Unauthorized!' });
		}

		const roomDetails = await room.findOne({ uid, roomId: id });

		if (!roomDetails) {
			return res.status(404).json({ status: 'failed', message: 'Room not found' });
		}

		// Add participant to the room
		roomDetails.participants.push(username);
		await roomDetails.save();

		res.status(200).json({ status: 'success', result: roomDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

// get the room details
const getRoomDetails = async(req, res) =>{
	try {

		const { uid, id } = req.params

		const roomDetails = await room.findOne({ uid, roomId: id })

		if(!roomDetails){
			return res.status(404).json({ status: 'failed', message: 'room not found'})
		}
		
		res.status(200).json({ status: 'success', result: roomDetails})


	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message})
		
	}
}

module.exports = { createRoom, joinRoom, getRoomDetails };
