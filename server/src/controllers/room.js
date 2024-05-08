const { generateRoomId } = require('../config/generateRandom');
const room = require('../model/room');

const createRoom = async (req, res) => {
	try {
		const { username } = req.body;
		const roomId = generateRoomId();
		const createdRoom = new room({ roomId, player: username });

		await createRoom.save();

		res.status(201).json({ status: 'success', result: createdRoom });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = { createRoom };
